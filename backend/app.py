from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from tictactoevsbot import best_move, is_winner, is_board_full
from dotenv import load_dotenv
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS

# ------------------------ Firebase Setup ------------------------
load_dotenv()

firebase_key_str = os.environ.get("FIREBASE_KEY")
if not firebase_key_str:
    raise ValueError("FIREBASE_KEY is not set!")

firebase_key = json.loads(firebase_key_str)
cred = credentials.Certificate(firebase_key)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
print("🔥 Firebase connected!")

# ------------------------ App Config ------------------------
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "fallback_secret_key")

# CORS (for React frontend)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# ------------------------ Game Move (MAIN LOGIC) ------------------------
@app.route('/move', methods=['POST'])
def move():
    data = request.get_json()

    username = data.get('username')
    print("USERNAME RECEIVED:", username)

    board = data.get('board')

    # ✅ Normalize board
    board = [cell if cell in ['X', 'O'] else ' ' for cell in board]

    player_move = int(data['move'])
    difficulty = data.get('difficulty', 'medium')

    # Invalid move
    if board[player_move] != ' ':
        return jsonify({'error': 'Invalid move', 'board': board})

    # Player move
    board[player_move] = 'X'

    if is_winner(board, 'X'):
        print("PLAYER WON DETECTED IN BACKEND")
        update_score('X', username)
        return jsonify({'winner': 'X', 'board': board})

    if is_board_full(board):
        return jsonify({'winner': 'tie', 'board': board})

    # AI move
    ai = best_move(board, difficulty)
    board[ai] = 'O'

    if is_winner(board, 'O'):
        return jsonify({'winner': 'O', 'board': board})

    if is_board_full(board):
        return jsonify({'winner': 'tie', 'board': board})

    return jsonify({'winner': None, 'board': board})


# ------------------------ Restart ------------------------
@app.route('/restart', methods=['POST'])
def restart():
    return jsonify({'board': [' '] * 9})


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

        users_ref.document(username).set({
            'password': password,
            'score': 0
        })

        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()  # <-- Get JSON from React

    username = data.get('username')
    password_input = data.get('password')

    if not username or not password_input:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400

    users_ref = db.collection('users')
    user_doc = users_ref.document(username).get()

    if user_doc.exists and check_password_hash(user_doc.to_dict()['password'], password_input):
        session['username'] = username
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))


# ------------------------ Score Update ------------------------
def update_score(winner, username):
    print("Updating score for:", username)

    if not username:
        print("No username, skipping")
        return

    if winner != 'X':
        return

    user_ref = db.collection('users').document(username)
    user_doc = user_ref.get()

    if user_doc.exists:
        current_score = user_doc.to_dict().get('score', 0)
        print("Current score:", current_score)

        user_ref.update({'score': current_score + 1})
        print("Score updated!")
    else:
        print("User not found!")


# ------------------------ Leaderboard (optional HTML route) ------------------------
@app.route('/leaderboard')
def leaderboard():
    users_ref = db.collection('users')
    query = users_ref.order_by('score', direction=firestore.Query.DESCENDING).stream()

    leaderboard_data = [
        {'username': doc.id, 'score': doc.to_dict()['score']}
        for doc in query
    ]

    return render_template('leaderboard.html', leaderboard=leaderboard_data)


# ------------------------ Run ------------------------
if __name__ == '__main__':
    app.run(debug=True)
