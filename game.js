const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Grid size
const box = 20;
const canvasSize = 400;
const rows = canvasSize / box;
const cols = canvasSize / box;

let snake, direction, food, score, gameLoop;

// Initialize Game
function initGame() {
  snake = [{ x: 10 * box, y: 10 * box }];
  direction = "RIGHT";
  score = 0;

  food = {
    x: Math.floor(Math.random() * cols) * box,
    y: Math.floor(Math.random() * rows) * box,
  };

  // Stop any existing game loop
  if (gameLoop) clearInterval(gameLoop);

  // Start new game loop
  gameLoop = setInterval(draw, 100);
}

// Draw Snake & Food
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Draw snake
  ctx.fillStyle = "green";
  snake.forEach((part, index) => {
    ctx.fillRect(part.x, part.y, box, box);
    ctx.strokeStyle = "black";
    ctx.strokeRect(part.x, part.y, box, box);
  });

  // Update snake position
  let head = { ...snake[0] };
  if (direction === "RIGHT") head.x += box;
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  // Game over conditions
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    snake.some((part) => part.x === head.x && part.y === head.y)
  ) {
    clearInterval(gameLoop);
    setTimeout(() => {
      alert("Game Over! Your Score: " + score);
      initGame(); // Restart game after alert
    }, 100);
    return;
  }

  // Add new head
  snake.unshift(head);

  // Check if snake eats food
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = {
      x: Math.floor(Math.random() * cols) * box,
      y: Math.floor(Math.random() * rows) * box,
    };
  } else {
    // Remove last part of snake (move forward)
    snake.pop();
  }

  // Display score
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

// Handle Key Events
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Start the game
initGame();
