import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-400 to-red-400">
        {/* Navbar */}
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-700">TicTacToe</h1>
          <div className="flex space-x-4">
            <Link className="text-purple-600 hover:text-purple-800 font-semibold" to="/">Home</Link>
            <Link className="text-purple-600 hover:text-purple-800 font-semibold" to="/leaderboard">Leaderboard</Link>
            <Link className="text-purple-600 hover:text-purple-800 font-semibold" to="/login">Login</Link>
            <Link className="text-purple-600 hover:text-purple-800 font-semibold" to="/register">Register</Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
