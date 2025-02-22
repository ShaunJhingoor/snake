const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Grid size
const box = 20;
const canvasSize = 800;
const rows = canvasSize / box;
const cols = canvasSize / box;

let snake, direction, food, score, gameLoop, badFood, level, speed, running;
let lastScoreForLevelUp = 0; // Prevents infinite level up

// Initialize variables but do not start the game yet
function resetGame() {
  snake = [
    {
      x: Math.floor(cols / 2) * box,
      y: Math.floor(rows / 2) * box,
    },
  ];
  direction = "RIGHT";
  score = 0;
  level = 1;
  speed = 150; // Base speed (milliseconds per frame)
  running = false;
  lastScoreForLevelUp = 0; // Reset level tracking

  food = getRandomPositions(1);
  badFood = getRandomPositions(1);

  if (gameLoop) clearInterval(gameLoop);

  // Clear the canvas
  clearBoard();
}

// Clear the board completely
function clearBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Press Play to Start", canvas.width / 4, canvas.height / 2);
}

// Generate a random position on the grid
function getRandomPositions(count) {
  let positions = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      x: Math.floor(Math.random() * cols) * box,
      y: Math.floor(Math.random() * rows) * box,
    });
  }
  return positions;
}

// Start game when play is pressed
function startGame() {
  if (running) return; // Prevent multiple game loops
  running = true;
  gameLoop = setInterval(draw, speed);
}

// Draw Snake & Food
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.fillStyle = "green";
  food.forEach((pos) => ctx.fillRect(pos.x, pos.y, box, box));

  // Draw bad food
  ctx.fillStyle = "red";
  badFood.forEach((pos) => ctx.fillRect(pos.x, pos.y, box, box));

  // Draw snake
  ctx.fillStyle = "blue";
  snake.forEach((part) => {
    ctx.fillRect(part.x, part.y, box, box);
    ctx.strokeStyle = "black";
    ctx.strokeRect(part.x, part.y, box, box);
  });

  let head = { ...snake[0] };
  if (direction === "RIGHT") head.x += box;
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  // Add new head before checking collision (so the final move is displayed)
  snake.unshift(head);

  // Check for collision with walls or itself
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    snake.some(
      (part, index) => index !== 0 && part.x === head.x && part.y === head.y
    )
  ) {
    setTimeout(() => endGame(), 100); // Delay game over so last move is drawn
    return;
  }

  // Check if snake eats food
  let ateGoodFood = false;
  food = food.filter((pos) => {
    if (pos.x === head.x && pos.y === head.y) {
      ateGoodFood = true;
      return false;
    }
    return true;
  });

  if (ateGoodFood) {
    score++;
    food.push(...getRandomPositions(1)); // Add new food
  } else {
    snake.pop();
  }

  // Check if snake eats bad food
  let ateBadFood = false;
  badFood = badFood.filter((pos) => {
    if (pos.x === head.x && pos.y === head.y) {
      ateBadFood = true;
      return false;
    }
    return true;
  });

  if (ateBadFood) {
    score--;
    badFood.push(...getRandomPositions(1)); // Add new bad food
    if (score < 0) {
      setTimeout(() => endGame(), 100); // Delay so last move is drawn
      return;
    }
    if (snake.length > 1) snake.pop();
  }

  // Level up every 2 points, but only once per threshold
  if (score > 0 && score % 2 === 0 && score !== lastScoreForLevelUp) {
    lastScoreForLevelUp = score; // Prevents infinite level-ups
    levelUp();
  }

  // Display score and level
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Level: ${level}`, 10, 40);
}

// Handle Key Events
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Level up function
function levelUp() {
  level++;
  speed = Math.max(50, speed - 10); // Increase speed
  food.push(...getRandomPositions(1)); // Add more food
  badFood.push(...getRandomPositions(1)); // Add more bad food

  clearInterval(gameLoop);
  gameLoop = setInterval(draw, speed);
}

// End Game Function
function endGame() {
  clearInterval(gameLoop);
  running = false;

  setTimeout(() => {
    let playAgain = confirm(
      `Game Over! Final Score: ${score}\nDo you want to play again?`
    );
    if (playAgain) {
      resetGame();
      startGame();
    } else {
      clearBoard(); // Clears the board if user cancels
    }
  }, 200); // Small delay ensures last movement is fully rendered
}

// Attach Play Button
document.getElementById("playButton").addEventListener("click", startGame);

// Reset game state on load
resetGame();
