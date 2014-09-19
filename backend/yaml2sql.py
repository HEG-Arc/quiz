import yaml

questions = yaml.load(file('questions.yml', 'r') )

for id in questions.keys():
    #print "".join(["INSERT INTO questions VALUES (", str(id), ", '",questions[id]['question'].replace("'", "''"), "','", questions[id]['explain'].replace("'", "''"), "');"])
    for key in range(len(questions[id]['answers'])):
        print "".join(["INSERT INTO questions_answers VALUES (", str(id), ", ", str(key), ", '", questions[id]['answers'][key].replace("'", "''") if type(questions[id]['answers'][key]) is str or type(questions[id]['answers'][key]) is unicode else str(questions[id]['answers'][key]), "');"])
    
