const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let isGameOver = false;

// Create board dynamically
for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    boardDiv.appendChild(cell);
}

async function handleClick(e) {
    if (isGameOver) return;

    const cell = e.target;
    const index = cell.dataset.index;
    if (cell.classList.contains("taken")) return;

    // Player move
    cell.textContent = "X";
    cell.classList.add("taken", "player");
    statusText.textContent = "🤖 AI is thinking...";

    const res = await fetch("/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ move: parseInt(index) }),
    });

    const data = await res.json();
    handleGameResponse(data);
}

function handleGameResponse(data) {
    if (data.winner === "X") {
        statusText.textContent = "🎉 You win!";
        endGame();
    } else if (data.winner === "tie") {
        statusText.textContent = "🤝 It's a tie!";
        endGame();
    } else {
        // AI move
        const aiCell = document.querySelector(`[data-index='${data.ai_move}']`);
        if (aiCell && !aiCell.classList.contains("taken")) {
            aiCell.textContent = "O";
            aiCell.classList.add("taken", "ai");
        }

        if (data.winner === "O") {
            statusText.textContent = "🤖 AI wins!";
            endGame();
        } else {
            statusText.textContent = "Your turn!";
        }
    }
}

function endGame() {
    isGameOver = true;
    document.querySelectorAll(".cell").forEach(c => c.classList.add("taken"));
    restartBtn.style.display = "inline-block";
}

// Restart game
restartBtn.addEventListener("click", async () => {
    await fetch("/restart", { method: "POST" });

    document.querySelectorAll(".cell").forEach(c => {
        c.textContent = "";
        c.classList.remove("taken", "player", "ai");
    });

    statusText.textContent = "Your turn!";
    isGameOver = false;
    restartBtn.style.display = "none";
});
