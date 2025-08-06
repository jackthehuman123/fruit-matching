const gameContainer = document.getElementById("gameContainer");
const gridSize = document.querySelector("#gridSize");
const startBtn = document.querySelector("#startBtn");
const statusText = document.querySelector("#statusText");
const recordText = document.querySelector("#record");
const symbols = [
  "🍎",
  "🍌",
  "🍇",
  "🍉",
  "🍓",
  "🍒",
  "🍍",
  "🥝",
  "🍑",
  "🍐",
  "🥥",
  "🥭",
  "🍊",
  "🍋",
  "🍈",
  "🍏",
  "🥦",
  "🥕",
  "🌽",
  "🥔",
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🦁",
  "🚗",
  "🚀",
];

let gameStatus; // Keep track of underlying symbols
let boxes; // Keep track of visible symbols
let revealedCount = 0; // Keep track of total revealed boxes
let revealedBoxes = []; // Holds the currently revealed boxes
let lockBoard = false; // Prevent over-clicking
let moveCounter;

window.addEventListener("load", () => {
  const best = getBestGame();
  if (best) {
    recordText.textContent = `🏆 Record: ${best.moves} moves`;
  } else {
    recordText.textContent = `🏆 Record: N/A`;
  }
});

// Initiate the game
startBtn.addEventListener("click", () => {
  const size = parseInt(gridSize.value);
  gameStatus = createGameStatus(size);
  buildGrid(size);
  revealedBoxes = []; 
  revealedCount = 0; 
  lockBoard = false; 
  moveCounter = 0;
});

function createGameStatus(size) {
  // Building the contents (pairs, shuffles)
  const totalPairs = (size * size) / 2;
  const selectedSymbols = symbols.slice(0, totalPairs);
  const pairs = [...selectedSymbols, ...selectedSymbols];
  pairs.sort(() => Math.random() - 0.5);

  // Each symbol is an object within gameStatus
  return pairs.map((symbol, index) => ({
    value: symbol,
    matched: false,
    index: index,
  }));
}

function buildGrid(size) {
  gameContainer.innerHTML = "";

  // A bunch of DOM for HTML`
  for (let i = 0; i < size * size; i++) {
    let box = document.createElement("div");
    box.addEventListener("click", clickedBox);
    box.classList.add("box");
    box.dataset.index = i;
    box.style.width = "80px";
    box.style.height = "80px";
    box.style.border = "1px solid black";
    gameContainer.append(box);
  }

  boxes = document.querySelectorAll(".box");

  gameContainer.style.display = "grid";
  gameContainer.style.gridTemplateColumns = `repeat(${size}, 82px)`;
  gameContainer.style.gridTemplateRows = `repeat(${size}, 82px)`;
  gameContainer.style.gap = "3px";
}

function clickedBox() {
  if (lockBoard) return; // Prevent over-clicking

  moveCounter += 1;
  reveal(this);
}

function reveal(box) {
  const index = box.dataset.index;

  // Prevent clicking already matched or shown boxes
  if (gameStatus[index].matched || revealedBoxes.includes(gameStatus[index]))
    return;

  box.textContent = gameStatus[index].value;
  revealedBoxes.push(gameStatus[index]);
  revealedCount += 1;
  check();
}

function matching(boxes) {
  return boxes[0].value === boxes[1].value;
}

// Check for matching pairs
function check() {
  if (revealedCount === 2) {
    lockBoard = true; // Locked
    setTimeout(() => {
      if (matching(revealedBoxes)) {
        gameStatus[revealedBoxes[0].index].matched = true;
        gameStatus[revealedBoxes[1].index].matched = true;

        boxes[revealedBoxes[0].index].textContent = "✔️";
        boxes[revealedBoxes[1].index].textContent = "✔️";

        if (win()) {
          statusText.textContent = "🎉 You Win!";
          lockBoard = true; 

          saveGame(moveCounter); // Save current game

          const best = getBestGame(); // Update record if new best
          if (best) {
            recordText.textContent = `🏆 Record: ${best.moves} moves`;
          }
        }
      } else {
        boxes[revealedBoxes[0].index].textContent = "";
        boxes[revealedBoxes[1].index].textContent = "";
      }

      revealedBoxes = [];
      revealedCount = 0;
      lockBoard = false; //
    }, 600); // give players a short time to see the result
  }
}

// Win condition
function win() {
  return gameStatus.every((card) => card.matched);
}

// Save game result to localStorage
function saveGame(moves) {
  const history = JSON.parse(localStorage.getItem("games")) || [];
  history.push({ moves, timestamp: Date.now() });
  localStorage.setItem("games", JSON.stringify(history));
}

// Get the best game
function getBestGame() {
  const history = JSON.parse(localStorage.getItem("games")) || [];
  if (history.length === 0) return null;

  return history.reduce((best, curr) =>
    curr.moves < best.moves ? curr : best
  );
}
