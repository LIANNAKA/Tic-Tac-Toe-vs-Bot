import React, { useEffect, useState } from "react";

function Leaderboard() {
  const [data,setData] = useState([]);

  useEffect(()=>{
    fetch("https://tic-tac-toe-vs-bot.onrender.com")
      .then(res=>res.json())
      .then(d=>setData(d));
  },[]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Player</th>
            <th className="border px-2 py-1">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player,idx)=>(
            <tr key={idx}>
              <td className="border px-2 py-1 text-center">{player.name}</td>
              <td className="border px-2 py-1 text-center">{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
