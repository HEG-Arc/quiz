import SimpleHTTPServer
import BaseHTTPServer
import os
import yaml
import json
import sqlite3
import random
import ConfigParser
import cgi
import sys
import string
from printer import Printer

PORT_NUMBER = 9002

class App:
  def __init__(self):
    self.config = Config()
    self.setMachineAndDB()
    self.printer = Printer()
    
  def setMachineAndDB(self):
    if hasattr(self, 'db') and self.db.conn:
      self.db.conn.close()
    self.machine = self.config.get('machine')
    self.db = DB(self.machine)  
  
  def startQuiz(self):
    #reload configs
    try:
      self.config.reload()
      if self.machine != self.config.get('machine'):
        self.setMachineAndDB()
      #get N random quiz questions
      questions = yaml.load(file('questions.yml', 'r') )
      quiz_questions_ids = random.sample(questions.keys(), int(self.config.get('number_questions')))
      
      #create session
      session = self.db.getSession()
      
      #save to session
      self.db.saveQuiz(session, quiz_questions_ids)
      
      #send data as json
      data = {
        'session': session,
        'timeout': int(self.config.get('timeout')),
        'scores': self.config.scoreValueTable(),
        'questions': [addId(id, questions[id]) for id in quiz_questions_ids]
      }
    except yaml.scanner.ScannerError as e:
      data = {
        'error': str(e)
      }
    return data
  
  def doPrint(self, session, raw_score):
    #machine, session, score_hash, ctrl flag?
    code = str(self.machine)
    code += str(session)
    code += str(self.config.scoreHashTable()[int(raw_score)])
    code += str(compute_checksum(code))

    #log
    self.db.saveScore(session, raw_score)
    #print
    self.printer.doPrint(self, self.config.get('url') + '/' + code, self.config.scoreValueTable()[int(raw_score)])
  
class Config:
  def __init__(self):
    self.config = ConfigParser.RawConfigParser()
    self.reload()
  
  def reload(self):
    self.config.read('config.cfg')
  
  def get(self, key):
    return self.config.get('Main', key)
    
  def getScoreValue(self, hash):
    try:
      return int(self.config.get('Score', hash))
    except (NoOptionError):
      return 0
  def scoreHashTable(self):
    return self.config.get('Score', 'order').split(',')
    
  def scoreValueTable(self):
    return map(self.getScoreValue, self.scoreHashTable())

class DB:
  def __init__(self, machine):
    self.conn = sqlite3.connect("persistence_%s.sqlite" % machine)
    self.checkStructure()
  
  def checkStructure(self):
    c = self.conn.cursor()
    
    if 0 == len(c.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="attempts"').fetchall()):
      c.execute("""
      CREATE TABLE [attempts] (
      [id] VARCHAR(4)  UNIQUE NOT NULL PRIMARY KEY,
      [start] TIMESTAMP  NULL,
      [stop] TIMESTAMP  NULL,
      [score] NUMERIC  NULL
      )
      """)
      
    #populate with empty sessions
    if 65536 > c.execute('SELECT COUNT(*) FROM attempts').fetchone()[0]:
      c.executemany('INSERT INTO attempts (id) VALUES (?)', [(hex(x)[2:].upper().zfill(4),) for x in range(65536)])
    
    if 0 == len(c.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="answers"').fetchall()):
      c.execute("""
      CREATE TABLE [answers] (
      [attempt_id] VARCHAR(4)  NOT NULL,
      [question_id] numeric  NOT NULL,
      [question_order] numeric  NOT NULL,
      [answer_recorded] TIMESTAMP  NULL,
      [answer] NUMERIC  NULL,
      PRIMARY KEY ([attempt_id], [question_id])
      )
      """)
    
    self.conn.commit()
    
  def getSession(self):
    c = self.conn.cursor()
    #WARNING need transaction
    #Select random not used sessions
    session = c.execute('SELECT id FROM attempts WHERE start IS NULL ORDER BY RANDOM() LIMIT 1').fetchone()
    #and update start timestamp
    c.execute("UPDATE attempts SET start = datetime('now', 'localtime') WHERE id = ?", session)
    self.conn.commit()
    return session[0]
    
  def saveQuiz(self, session, quiz_questions_ids):
    c = self.conn.cursor()
    #insert quiz question and order
    for i in range(len(quiz_questions_ids)):
      c.execute("INSERT INTO answers(attempt_id, question_id, question_order) VALUES (?, ?, ?)", (session, quiz_questions_ids[i], i))
    self.conn.commit()
    
  def saveQuizAnswer(self, session, question, answer):
    c = self.conn.cursor()
    c.execute("UPDATE answers SET answer_recorded = datetime('now', 'localtime'), answer = ? WHERE attempt_id = ? AND question_id = ?", (answer, session, question))
    self.conn.commit()
    
  def saveScore(self, session, raw_score):
    c = self.conn.cursor()
    c.execute("UPDATE attempts SET stop = datetime('now', 'localtime'), score = ? WHERE id = ?", (raw_score, session))
    self.conn.commit()
  
class MyRequestHandler (SimpleHTTPServer.SimpleHTTPRequestHandler):
    
  def do_GET(self):
    if self.path == '/start':
      #send response code:
      self.send_response(200)
      #send headers:
      self.send_header("Content-type:", "application/json")
      # send a blank line to end headers:
      self.wfile.write("\n")      
      json.dump(app.startQuiz(), self.wfile)

    else:
      return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

  def do_POST(self):
    form = cgi.FieldStorage(
            fp=self.rfile, 
            headers=self.headers,
            environ={'REQUEST_METHOD':'POST',
                     'CONTENT_TYPE':self.headers['Content-Type'],
                     })
  
    if self.path == '/log':
      app.db.saveQuizAnswer(form.getfirst('session'), form.getfirst('question'), form.getfirst('answer'))
      
    elif self.path == '/print':
      app.doPrint(form.getfirst('session'), form.getfirst('raw_score'))
      app.db.saveScore(form.getfirst('session'), form.getfirst('raw_score'))

    self.send_response(200)
    #send headers:
    self.send_header("Content-type:", "text/plain")
    # send a blank line to end headers:
    self.wfile.write("\n")
      
def addId(id, value):
  value['id'] = id
  return value
  
def compute_checksum(code):
  code = code.lower()
  checksum = 0
  for char in code:
    if char.isdigit():
      checksum += int(char)
    else:
      checksum += int(string.lowercase.index(char))
  return checksum % 10
  
if __name__ == "__main__":
  global app
  app = App()
  httpd = BaseHTTPServer.HTTPServer(('127.0.0.1', PORT_NUMBER), MyRequestHandler)
  print "serving at port", PORT_NUMBER
  httpd.serve_forever()