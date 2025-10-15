from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from tictactoevsbot import best_move, is_winner, is_board_full
import sqlite3
import math     
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "users.db")
print("Database path being used:", DB_PATH)

app = Flask(__name__)
app.secret_key = "your_secret_key"  # add this in .env file

# ------------------------
# User authentication DB
# ------------------------
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    score INTEGER DEFAULT 0
)
''')
conn.commit()
conn.close()

# ------------------------
# Routes
# ------------------------
@app.route('/')
def index():
    username = session.get('username', 'Guest')
    return render_template('index.html', username=username)

@app.route('/move', methods=['POST'])
def move():
    data = request.get_json()
    player_move = data['move']

    # Initialize board if not in session
    if 'board' not in session:
        session['board'] = [' '] * 9

    board = session['board']

    if board[player_move] != ' ':
        return jsonify({'error': 'Cell already taken!'})

    board[player_move] = 'X'

    if is_winner(board, 'X'):
        session['board'] = [' '] * 9  # reset after win
        update_score('X')
        return jsonify({'winner': 'X'})

    if is_board_full(board):
        session['board'] = [' '] * 9
        return jsonify({'winner': 'tie'})

    ai = best_move(board)
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

# ------------------------
# User Auth Routes
# ------------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
            conn.commit()
            conn.close()
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            return "Username already exists!"
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username=?", (username,))
        user = c.fetchone()
        conn.close()
        if user and check_password_hash(user[2], password):
            session['username'] = username
            return redirect(url_for('index'))
        else:
            return "Invalid credentials!"
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

# ------------------------
# Score update
# ------------------------
def update_score(winner):
    if 'username' not in session or session['username'] == 'Guest':
        return
    if winner != 'X':
        return  # Only track player score for now
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE users SET score = score + 1 WHERE username=?", (session['username'],))
    conn.commit()
    conn.close()

# ------------------------
# Leaderboard
# ------------------------
@app.route('/leaderboard')
def leaderboard():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT username, score FROM users ORDER BY score DESC")
    data = c.fetchall()
    conn.close()
    return render_template('leaderboard.html', leaderboard=data)

if __name__ == '__main__':
    app.run(debug=True)
