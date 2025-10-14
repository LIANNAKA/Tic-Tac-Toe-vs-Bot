const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");

for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    boardDiv.appendChild(cell);
}

async function handleClick(e) {
    const cell = e.target;
    const index = cell.dataset.index;
    if (cell.classList.contains("taken")) return;

    cell.textContent = "X";
    cell.classList.add("taken");

    const res = await fetch("/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ move: parseInt(index) }),
    });
    const data = await res.json();

    if (data.winner === "X") {
        statusText.textContent = "🎉 You win!";
        disableBoard();
    } else if (data.winner === "tie") {
        statusText.textContent = "🤝 It's a tie!";
        disableBoard();
    } else {
        const aiCell = document.querySelector(`[data-index='${data.ai_move}']`);
        aiCell.textContent = "O";
        aiCell.classList.add("taken");

        if (data.winner === "O") {
            statusText.textContent = "🤖 AI wins!";
            disableBoard();
        }
    }
}

function disableBoard() {
    document.querySelectorAll(".cell").forEach(c => c.classList.add("taken"));
}

document.getElementById("restartBtn").addEventListener("click", async () => {
    await fetch("/restart", { method: "POST" });
    document.querySelectorAll(".cell").forEach(c => {
        c.textContent = "";
        c.classList.remove("taken");
    });
    statusText.textContent = "";
});
