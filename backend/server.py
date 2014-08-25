import SimpleHTTPServer
import BaseHTTPServer
import os
import yaml
import json
import sqlite3

PORT_NUMBER = 9002


class MyRequestHandler (SimpleHTTPServer.SimpleHTTPRequestHandler):
	def do_GET(self):
		if self.path == '/yaml':
			stream = file('questions.yml', 'r') 
			questions = yaml.load(stream)
			
			#send response code:
			self.send_response(200)
			#send headers:
			self.send_header("Content-type:", "text/yaml")
			# send a blank line to end headers:
			self.wfile.write("\n")
			
			json.dump(questions, self.wfile)
		
		elif self.path == '/sql':
			conn = sqlite3.connect('persistence.sqlite')
			c = conn.cursor()
			if 0 == len(c.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="attempts"').fetchall()):
				c.execute("""
				CREATE TABLE [attempts] (
				[id] VARCHAR(4)  UNIQUE NOT NULL PRIMARY KEY,
				[start] TIMESTAMP  NULL,
				[stop] TIMESTAMP  NULL,
				[score] NUMERIC  NULL
				)
				""")
			if 65536 > c.execute('SELECT COUNT(*) FROM attempts').fetchone()[0]:
				c.executemany('INSERT INTO attempts (id) VALUES (?)', [(hex(x)[2:].upper().zfill(4),) for x in range(65536)])
			conn.commit()
			conn.close()
		else:
			return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
		
httpd = BaseHTTPServer.HTTPServer(('127.0.0.1', PORT_NUMBER), MyRequestHandler)

print "serving at port", PORT_NUMBER
httpd.serve_forever()