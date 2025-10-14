from flask import Flask, request, jsonify, render_template
from tictactoevsbot import board, best_move, is_winner, is_board_full
import math

app = Flask(__name__)

board = [' ' for _ in range(9)]

def is_winner(player):
    win_conditions = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    for condition in win_conditions:
        if board[condition[0]] == board[condition[1]] == board[condition[2]] == player:
            return True
    return False

def is_board_full():
    return ' ' not in board

def minimax(is_maximizing):
    if is_winner('O'): return 1
    elif is_winner('X'): return -1
    elif is_board_full(): return 0

    if is_maximizing:
        best_score = -math.inf
        for i in range(9):
            if board[i] == ' ':
                board[i] = 'O'
                score = minimax(False)
                board[i] = ' '
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = math.inf
        for i in range(9):
            if board[i] == ' ':
                board[i] = 'X'
                score = minimax(True)
                board[i] = ' '
                best_score = min(score, best_score)
        return best_score

def best_move():
    best_score = -math.inf
    move = 0
    for i in range(9):
        if board[i] == ' ':
            board[i] = 'O'
            score = minimax(False)
            board[i] = ' '
            if score > best_score:
                best_score = score
                move = i
    return move

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/move', methods=['POST'])
def move():
    data = request.get_json()
    player_move = data['move']
    board[player_move] = 'X'

    if is_winner('X'):
        return jsonify({'winner': 'X'})

    if is_board_full():
        return jsonify({'winner': 'tie'})

    ai = best_move()
    board[ai] = 'O'

    if is_winner('O'):
        return jsonify({'ai_move': ai, 'winner': 'O'})
    elif is_board_full():
        return jsonify({'ai_move': ai, 'winner': 'tie'})
    
    return jsonify({'ai_move': ai, 'winner': None})

if __name__ == '__main__':
    app.run(debug=True)
