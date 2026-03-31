import React, { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  localStorage.setItem("username", username);

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // keep session
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = "/"; // Go to TicTacToe page
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Try again later.");
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-purple-400 via-pink-400 to-red-400">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-lg w-80"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-purple-700">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
