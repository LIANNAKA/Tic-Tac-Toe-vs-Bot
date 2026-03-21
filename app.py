from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from tictactoevsbot import best_move, is_winner, is_board_full
from dotenv import load_dotenv
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# ------------------------ Firebase Setup ------------------------
load_dotenv()

firebase_key_str = os.environ.get("FIREBASE_KEY")
if not firebase_key_str:
    raise ValueError("FIREBASE_KEY is not set!")

firebase_key = json.loads(firebase_key_str)
cred = credentials.Certificate(firebase_key)

# Initialize Firebase only if not already initialized
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
print("🔥 Firebase connected!")

# ------------------------ App Config ------------------------
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "fallback_secret_key")

# ------------------------ Routes ------------------------
@app.route('/')
def index():
    username = session.get('username', 'Guest')
    difficulty = session.get('difficulty', 'medium')
    return render_template('index.html', username=username, difficulty=difficulty)

@app.route('/set_difficulty/<level>')
def set_difficulty(level):
    level = level.lower()
    if level not in ['easy', 'medium', 'hard']:
        level = 'medium'
    session['difficulty'] = level
    return redirect(url_for('index'))

# ------------------------ Game Move ------------------------
@app.route('/move', methods=['POST'])
def move():
    data = request.get_json()
    player_move = int(data['move'])
    difficulty = data.get('difficulty', session.get('difficulty', 'medium'))

    if 'board' not in session:
        session['board'] = [' '] * 9
    board = session['board']

    if board[player_move] != ' ':
        return jsonify({'error': 'Cell already taken!'})

    board[player_move] = 'X'

    if is_winner(board, 'X'):
        session['board'] = [' '] * 9
        update_score('X')
        return jsonify({'winner': 'X'})

    if is_board_full(board):
        session['board'] = [' '] * 9
        return jsonify({'winner': 'tie'})

    ai = best_move(board, difficulty)
    board[ai] = 'O'

    if is_winner(board, 'O'):
        session['board'] = [' '] * 9
        update_score('O')
        return jsonify({'ai_move': ai, 'winner': 'O'})
    elif is_board_full(board):
        session['board'] = [' '] * 9
        return jsonify({'ai_move': ai, 'winner': 'tie'})

    session['board'] = board
    return jsonify({'ai_move': ai, 'winner': None})

@app.route('/restart', methods=['POST'])
def restart():
    session['board'] = [' '] * 9
    return jsonify({'status': 'ok'})

# ------------------------ User Authentication ------------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])

        users_ref = db.collection('users')
        user_doc = users_ref.document(username).get()
        if user_doc.exists:
            return "Username already exists!"

        # Save user with document ID = username
        users_ref.document(username).set({
            'password': password,
            'score': 0
        })

        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password_input = request.form['password']

        users_ref = db.collection('users')
        user_doc = users_ref.document(username).get()

        if user_doc.exists and check_password_hash(user_doc.to_dict()['password'], password_input):
            session['username'] = username
            session['difficulty'] = 'medium'
            return redirect(url_for('index'))
        else:
            return "Invalid credentials!"

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('difficulty', None)
    return redirect(url_for('index'))

# ------------------------ Score Update ------------------------
def update_score(winner):
    if 'username' not in session or session['username'] == 'Guest':
        return
    if winner != 'X':
        return

    user_ref = db.collection('users').document(session['username'])
    user_doc = user_ref.get()
    if user_doc.exists:
        current_score = user_doc.to_dict().get('score', 0)
        user_ref.update({'score': current_score + 1})

# ------------------------ Leaderboard ------------------------
@app.route('/leaderboard')
def leaderboard():
    users_ref = db.collection('users')
    query = users_ref.order_by('score', direction=firestore.Query.DESCENDING).stream()
    leaderboard_data = [{'username': doc.id, 'score': doc.to_dict()['score']} for doc in query]
    return render_template('leaderboard.html', leaderboard=leaderboard_data)

# ------------------------ Run App ------------------------
if __name__ == '__main__':
    app.run(debug=True)