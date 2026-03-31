import React, { useState } from "react";

const initialBoard = Array(9).fill(null);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Decorative geometric elements
const GeometricDecorations = () => {
  const elements = [
    { type: "square", color: "#00D9FF", top: "5%", left: "5%", size: "4vw", rotation: 15 },
    { type: "square", color: "#FFD700", top: "10%", right: "5%", size: "5vw", rotation: -20 },
    { type: "square", color: "#FF1493", bottom: "10%", right: "5%", size: "4.5vw", rotation: 25 },
    { type: "square", color: "#00FF7F", bottom: "5%", left: "5%", size: "3.5vw", rotation: -10 },
    { type: "x", color: "#00D9FF", top: "20%", left: "8%", size: "3vw", opacity: 0.7 },
    { type: "x", color: "#FF1493", top: "50%", right: "8%", size: "3.5vw", opacity: 0.6 },
    { type: "x", color: "#FFD700", bottom: "35%", right: "5%", size: "2.8vw", opacity: 0.8 },
    { type: "dots", color: "#00FF7F", top: "15%", left: "25%", opacity: 0.5 },
    { type: "dots", color: "#FF6B35", top: "50%", right: "22%", opacity: 0.4 },
    { type: "dots", color: "#9D4EDD", bottom: "20%", left: "30%", opacity: 0.6 },
    { type: "zigzag", color: "#00D9FF", top: "60%", left: "3%", opacity: 0.5 },
    { type: "plus", color: "#FFD700", bottom: "10%", left: "5%", size: "2.5vw", opacity: 0.7 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {elements.map((el, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{
            top: el.top,
            bottom: el.bottom,
            left: el.left,
            right: el.right,
            opacity: el.opacity || 1,
            transform: `rotate(${el.rotation || 0}deg)`,
          }}
        >
          {el.type === "square" && (
            <div
              style={{
                width: el.size,
                height: el.size,
                backgroundColor: el.color,
                borderRadius: "6px",
              }}
            />
          )}
          {el.type === "x" && (
            <div style={{ fontSize: el.size, color: el.color, fontWeight: "bold" }}>✕</div>
          )}
          {el.type === "dots" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 0.5vw)", gap: "0.3vw" }}>
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    backgroundColor: el.color,
                    borderRadius: "50%",
                  }}
                />
              ))}
            </div>
          )}
          {el.type === "zigzag" && (
            <svg width="4vw" height="8vw" viewBox="0 0 20 60">
              <polyline points="0,0 10,15 0,30 10,45 0,60" stroke={el.color} strokeWidth="2" fill="none" />
            </svg>
          )}
          {el.type === "plus" && (
            <div style={{ fontSize: el.size, color: el.color, fontWeight: "bold" }}>+</div>
          )}
        </div>
      ))}
    </div>
  );
};

function TicTacToe() {
  const [board, setBoard] = useState(initialBoard);
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [gameCount, setGameCount] = useState(0);

  const handleClick = async (idx) => {
    if (board[idx] || winner || thinking) return;
    try {
      setThinking(true);
      const res = await fetch(`${BACKEND_URL}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          move: idx,
          difficulty,
          board: board.map(cell => cell || " "),
          username: localStorage.getItem("username") || "Player",
        }),
      });
      const data = await res.json();
      const convertedBoard = data.board.map(cell => (cell === " " ? null : cell));
      setBoard(convertedBoard);
      if (data.winner) {
        setWinner(data.winner);
        if (data.winner === "X") setScores(prev => ({ ...prev, player: prev.player + 1 }));
        if (data.winner === "O") setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setThinking(false);
    }
  };

  const resetGame = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/restart`, { method: "POST" });
      const data = await res.json();
      setBoard(data.board.map(cell => (cell === " " ? null : cell)));
      setWinner(null);
      setGameCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setBoard(initialBoard);
      setWinner(null);
      setGameCount(prev => prev + 1);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen w-screen bg-gradient-to-br from-[#0F1629] via-[#1a2e5c] to-[#0F1629] overflow-x-hidden font-sans py-6 sm:py-10">
      <GeometricDecorations />

      <div className="relative z-10 flex flex-col items-center justify-start w-full max-w-screen-sm px-4">
        {/* Header */}
        <div className="text-center mb-4 animate-fadeIn">
          <h1 className="text-[12vw] sm:text-[8vw] md:text-[6vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#FFD700] to-[#FF1493] leading-none">
            TIC TAC TOE
          </h1>
          <p className="text-[5vw] sm:text-[3vw] md:text-[2vw] text-gray-300 font-light tracking-wide">vs AI 🤖</p>
        </div>

        {/* Score */}
        <div className="grid grid-cols-3 gap-2 mb-4 w-full text-center">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-2">
            <div className="text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-1">You</div>
            <div className="text-lg md:text-xl font-bold text-[#00D9FF]">{scores.player}</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-2">
            <div className="text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-1">Games</div>
            <div className="text-lg md:text-xl font-bold text-[#FFD700]">{gameCount}</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-2">
            <div className="text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-1">AI</div>
            <div className="text-lg md:text-xl font-bold text-[#FF1493]">{scores.ai}</div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex justify-center gap-2 mb-4 text-xs md:text-sm flex-wrap">
          {["easy", "medium", "hard"].map(level => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-3 py-1 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 transform hover:scale-105 ${
                difficulty === level
                  ? "bg-gradient-to-r from-[#00D9FF] to-[#FFD700] text-[#0F1629] shadow-lg shadow-cyan-500/50"
                  : "backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Game Board */}
        <div className="w-[90vw] max-w-[400px] aspect-square backdrop-blur-xl bg-white/5 border-2 border-white/20 rounded-3xl p-2 md:p-4 shadow-2xl">
          <div className="grid grid-cols-3 gap-1 md:gap-2 w-full h-full">
            {board.map((cell, idx) => (
              <button
                key={idx}
                disabled={thinking || cell !== null || winner}
                onClick={() => handleClick(idx)}
                className={`relative w-full h-full rounded-2xl font-black text-[10vw] md:text-[4vw] transition-all duration-200 transform hover:scale-105 active:scale-95 overflow-hidden group flex items-center justify-center
                  ${cell === "X"
                    ? "bg-gradient-to-br from-[#00D9FF] to-[#0099CC] text-white shadow-lg shadow-cyan-500/50"
                    : cell === "O"
                    ? "bg-gradient-to-br from-[#FF1493] to-[#C71585] text-white shadow-lg shadow-pink-500/50"
                    : "bg-gradient-to-br from-white/5 to-white/2 border border-white/20 text-white/30 hover:text-white/60 hover:border-white/40"
                  }
                  ${(thinking || cell !== null || winner) && cell === null ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                `}
              >
                <span className="relative z-10">{cell || "\u00A0"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-4 min-h-[4rem] flex flex-col justify-center">
          {winner && (
            <p className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00FF7F] to-[#FFD700] animate-pulse">
              {winner === "tie" ? "🎯 It's a Draw!" : winner === "X" ? "🎉 You Win! 🎉" : "🤖 AI Wins!"}
            </p>
          )}
          {!winner && thinking && (
            <span className="flex items-center justify-center gap-2 text-sm md:text-base">
              <span className="w-3 h-3 bg-[#FF1493] rounded-full animate-bounce"></span>
              AI is thinking...
              <span className="w-3 h-3 bg-[#00D9FF] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
            </span>
          )}
          {!winner && !thinking && <span className="text-sm md:text-base text-gray-300">Your turn 👆</span>}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center mt-2">
          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#FF1493] to-[#FF6B35] hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            New Game
          </button>
          <button
            onClick={() => {
              setScores({ player: 0, ai: 0 });
              setGameCount(0);
              setBoard(initialBoard);
              setWinner(null);
            }}
            className="px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-white backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Reset Stats
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
        .animate-bounce { animation: bounce 1s infinite; }
      `}</style>
    </div>
  );
}

export default TicTacToe;
