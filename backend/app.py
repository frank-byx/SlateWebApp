from flask import *
from flask_sqlalchemy import SQLAlchemy
from flask_restplus import Api
import hashlib

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)

daysinweek = {'Monday':1, 'Tuesday':2, 'Wednesday':3, 'Thursday':4, 'Friday':5, 'Saturday':6, 'Sunday':7}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(120), nullable=False, unique=False)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}', '{self.password}')"

class Time(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, unique=False)
    start = db.Column(db.Integer, nullable=False, unique=False)
    end = db.Column(db.Integer, nullable=False, unique=False)
    day = db.Column(db.Integer, nullable=False, unique=False)
    def __repr__(self):
        return f"Time('{self.user_id}', '{self.day}', '{self.start}', '{self.end}')"
    def __str__(self):
        return f"{{'start':'{self.start}', 'end':'{self.end}', 'day':'{self.day}'}}"
    def __lt__(self, other):
        return self.start < other.start

class Friend(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, unique=False)
    friend_id = db.Column(db.Integer, nullable=False, unique=False)
    def __repr__(self):
        return f"Friend('{self.user_id}', '{self.friend_id}')"
    def __str__(self):
        return str(self.friend_id)


@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/login', methods = ['POST'])
def login():
    data = request.json
    email = data['email']
    password = hashlib.sha256(data['password'].encode('ascii')).hexdigest()
    try:
        auth_results = User.query.filter(User.email == email, User.password == password).one()
    except:
        return "authentication failed", 401
    return "login successful", 200
    

@app.route('/signup', methods = ['POST'])
def signup():
    data = request.json
    username = data['username']
    email = data['email']
    password = data['password']
    #checks if email or username already exists
    email_query = User.query.filter(User.email == email).all()
    uname_query = User.query.filter(User.username == username).all()
    if (len(email_query) > 0 or len(uname_query) > 0):
        return 'username or email already exists', 409 
    
    user = User(username=username, email=email, password=hashlib.sha256(password.encode('ascii')).hexdigest())
    db.session.add(user)
    db.session.commit()
    return 'signup successful', 201

@app.route('/addtime', methods = ['POST'])
def addtime():
    data = request.json
    user_id = int(data['user_id'])
    #time is stored in the database in minutes
    start = int(data['start_h'])*60+int(data['start_m'])
    end = int(data['end_h'])*60+int(data['end_m'])
    #day of the week is stored as an integer between 1 and 7
    day = daysinweek[data['day']]
          
    #check validity of time interval
    if (start >= end or start < 0 or end > 1440):
        return 'invalid time interval', 409
    tquery=Time.query.filter(Time.user_id == user_id, Time.day == day).all()
    
    #check if time interval overlaps with existing time intervals 
    for i in tquery:
        if (not ((i.start >= end) or (i.end <= start))):
            return 'overlapping time interval', 409
    
    time = Time(user_id=user_id, start=start, end=end, day=day)
    db.session.add(time)
    db.session.commit()
    return 'time interval successfully added', 201

@app.route('/gettime', methods = ['POST'])
def gettime():
    data = request.json
    user_id = int(data['user_id'])
    
    #formats user's schedule into a length 7 list of lists
    #ith list is the user's sorted list of busy time intervals on the ith day
    jsonstr = '{['
    for day in range (1, 8):
        jsonstr += '['
        tquery=Time.query.filter(Time.user_id == user_id, Time.day == day).all()
        tquery.sort()
        for i in tquery:
            jsonstr += str(i) + ','
        if (len(tquery) > 0):
            jsonstr = jsonstr[:-1]
        jsonstr += '],'
    jsonstr = jsonstr[:-1] + ']}'
    return jsonstr, 200

@app.route('/addfriend', methods = ['POST'])
def addfriend():
    data = request.json
    user_id = int(data['user_id'])
    friend_id = int(data['friend_id'])
    friend = Friend(user_id=user_id, friend_id=friend_id)
    db.session.add(friend)
    friend = Friend(user_id=friend_id, friend_id=user_id)
    db.session.add(friend)
    db.session.commit()
    return 'friend added', 201

@app.route('/getfriends', methods = ['POST'])
def getfriends():
    data = request.json
    user_id = int(data['user_id'])
    jsonstr = '{['
    fquery=Friend.query.filter(Friend.user_id == user_id).all()
    for i in fquery:
        jsonstr += str(i) + ','
    if (len(fquery) > 0):
        jsonstr = jsonstr[:-1]
    jsonstr += ']}'
    return jsonstr, 200

@app.route('/login', methods = ['POST'])
def login():
    data = request.json
    email = data['email']
    password = hashlib.sha256(data['password'].encode('ascii')).hexdigest()
    try:
        auth_results = User.query.filter(User.email == email, User.password == password).one()
    except:
        return "authentication failed", 401

    return "login successful", 200


@app.route('/signup', methods = ['POST'])
def signup():
    data = request.json
    username = data['username']
    email = data['email']
    password = data['password']
    user = User(username=username, email=email, password=hashlib.sha256(password.encode('ascii')).hexdigest())
    db.session.add(user)
    db.session.commit()
    return "congratulations, you have successfully signed up", 201


if __name__ == '__main__':
    app.run()

