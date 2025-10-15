import math, random

board = [' ' for _ in range(9)]

def is_winner(board, player):
    win_conditions = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    for condition in win_conditions:
        if board[condition[0]] == board[condition[1]] == board[condition[2]] == player:
            return True
    return False

def is_board_full(board):
    return ' ' not in board


# ---- Modified Minimax (with limited depth) ----
def minimax(board, is_maximizing, depth, max_depth):
    if is_winner(board, 'O'):
        return 1
    elif is_winner(board, 'X'):
        return -1
    elif is_board_full(board) or depth == max_depth:
        return 0  # neutral if max depth reached

    if is_maximizing:
        best_score = -math.inf
        for i in range(9):
            if board[i] == ' ':
                board[i] = 'O'
                score = minimax(board, False, depth + 1, max_depth)
                board[i] = ' '
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = math.inf
        for i in range(9):
            if board[i] == ' ':
                board[i] = 'X'
                score = minimax(board, True, depth + 1, max_depth)
                board[i] = ' '
                best_score = min(score, best_score)
        return best_score


# ---- Smart but Beatable AI ----
def best_move(board, difficulty="medium"):
    """
    difficulty: 'easy', 'medium', 'hard'
    """
    available_moves = [i for i, cell in enumerate(board) if cell == ' ']

    # EASY → mostly random moves
    if difficulty == "easy":
        return random.choice(available_moves)

    # MEDIUM → 40% random + limited depth minimax
    elif difficulty == "medium":
        if random.random() < 0.4:
            return random.choice(available_moves)
        max_depth = 2  # less foresight
    else:
        # HARD → full minimax
        max_depth = 9

    best_score = -math.inf
    move = random.choice(available_moves)  # default fallback
    for i in available_moves:
        board[i] = 'O'
        score = minimax(board, False, 0, max_depth)
        board[i] = ' '
        if score > best_score:
            best_score = score
            move = i
    return move
