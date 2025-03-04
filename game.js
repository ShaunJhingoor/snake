document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const canvasSize = canvas?.height;
  const box = Math.floor(Math.min(canvasSize, canvas.height) / 30);
  const rows = canvasSize / box;
  const cols = canvasSize / box;

  document.addEventListener(
    "touchmove",
    function (event) {
      event.preventDefault();
    },
    { passive: false }
  );

  document.getElementById("up").addEventListener("click", () => {
    if (direction !== "DOWN") direction = "UP";
  });
  document.getElementById("down").addEventListener("click", () => {
    if (direction !== "UP") direction = "DOWN";
  });
  document.getElementById("left").addEventListener("click", () => {
    if (direction !== "RIGHT") direction = "LEFT";
  });
  document.getElementById("right").addEventListener("click", () => {
    if (direction !== "LEFT") direction = "RIGHT";
  });

  canvas.addEventListener("click", (event) => {
    event.preventDefault();
    togglePause();
  });

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    togglePause();
  });

  let snake, direction, food, score, gameLoop, badFood, level, speed, running;
  let lastScoreForLevelUp = 0;
  let isPaused = false;

  const bgMusic = new Audio("assets/bgMusic.wav");
  const goodFruitSFX = new Audio("assets/goodFood.mp3");
  const badFoodSFX = new Audio("assets/badFood.wav");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
  const muteButton = document.getElementById("muteButton");
  let isMuted = false;

  muteButton.addEventListener("click", () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    goodFruitSFX.muted = isMuted;
    badFoodSFX.muted = isMuted;
    muteButton.textContent = isMuted ? "Unmute" : "Mute";
  });

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
    speed = 150;
    running = false;
    lastScoreForLevelUp = 0;

    food = getRandomPositions(1);
    badFood = getRandomPositions(1);

    if (gameLoop) clearInterval(gameLoop);
    document.getElementById("gameOverModal").style.display = "none";

    clearBoard();
  }

  // Clear the board completely
  function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "wheat"; // Match the h2 color
    ctx.font = "5dvh 'Press Start 2P', cursive"; // Use the same font

    const text = "Press to Start";
    const textWidth = ctx.measureText(text).width;

    ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height / 2);
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
    bgMusic.play().catch((err) => console.error("Music playback failed:", err));
  }

  function playSound(effect) {
    effect.currentTime = 0; // Reset audio for overlapping plays
    effect.play();
  }

  // Draw Snake & Food
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.fillStyle = "green";
    food.forEach((pos) => {
      const radius = box / 2;

      ctx.beginPath();
      ctx.arc(pos.x + radius, pos.y + radius, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "brown";
      ctx.fillRect(
        pos.x + radius - box / 10,
        pos.y + radius - box / 1.5,
        box / 5,
        box / 3
      );

      ctx.fillStyle = "lightgreen";
      ctx.beginPath();
      ctx.arc(
        pos.x + radius / 2,
        pos.y + radius / 2,
        radius / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw bad food
    badFood.forEach((pos) => {
      const bottleWidth = box * 0.6; // Width of the bottle
      const bottleHeight = box * 1.5; // Height of the bottle
      const centerX = pos.x + box / 2;
      const centerY = pos.y + box / 2;

      // **1️⃣ Draw Flask Body (Transparent Glass)**
      ctx.fillStyle = "rgba(100, 100, 255, 0.5)"; // Light blue transparent glass
      ctx.beginPath();
      ctx.moveTo(centerX - bottleWidth / 2, centerY + bottleHeight / 3); // Bottom Left
      ctx.quadraticCurveTo(
        centerX,
        centerY + bottleHeight / 2,
        centerX + bottleWidth / 2,
        centerY + bottleHeight / 3
      ); // Curve bottom
      ctx.lineTo(centerX + bottleWidth / 2.8, centerY - bottleHeight / 3); // Move up slightly inward
      ctx.lineTo(centerX - bottleWidth / 2.8, centerY - bottleHeight / 3);
      ctx.lineTo(centerX - bottleWidth / 2, centerY + bottleHeight / 3);
      ctx.fill();

      // **2️⃣ Draw Poison Liquid Inside**
      ctx.fillStyle = "limegreen";
      ctx.fillRect(
        centerX - bottleWidth / 2.2,
        centerY,
        bottleWidth * 0.9,
        bottleHeight / 3.5
      );

      // **3️⃣ Draw Flask Neck (Top Part)**
      ctx.fillStyle = "gray";
      ctx.fillRect(
        centerX - bottleWidth / 4,
        centerY - bottleHeight / 2.5,
        bottleWidth / 2,
        bottleHeight / 6
      );

      // **4️⃣ Draw Cork (Cap on Top)**
      ctx.fillStyle = "brown";
      ctx.fillRect(
        centerX - bottleWidth / 3,
        centerY - bottleHeight / 2.3,
        bottleWidth * 0.6,
        bottleHeight / 12
      );

      // **5️⃣ Skull Face (White)**
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(centerX, centerY, bottleWidth / 3.5, 0, Math.PI * 2); // Skull head
      ctx.fill();

      // **Eyes**
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(
        centerX - bottleWidth / 6,
        centerY - bottleWidth / 8,
        bottleWidth / 10,
        0,
        Math.PI * 2
      );
      ctx.arc(
        centerX + bottleWidth / 6,
        centerY - bottleWidth / 8,
        bottleWidth / 10,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // **Mouth (Small Line)**
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - bottleWidth / 6, centerY + bottleWidth / 8);
      ctx.lineTo(centerX + bottleWidth / 6, centerY + bottleWidth / 8);
      ctx.stroke();

      // **6️⃣ Crossbones (Two Diagonal Lines)**
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - bottleWidth / 2, centerY + bottleWidth / 2);
      ctx.lineTo(centerX + bottleWidth / 2, centerY - bottleWidth / 2);
      ctx.moveTo(centerX - bottleWidth / 2, centerY - bottleWidth / 2);
      ctx.lineTo(centerX + bottleWidth / 2, centerY + bottleWidth / 2);
      ctx.stroke();

      // **7️⃣ Poison Bubbles (Floating Above the Flask)**
      ctx.fillStyle = "lightgreen";
      ctx.beginPath();
      ctx.arc(
        centerX - 5,
        centerY - bottleHeight / 1.6,
        bottleWidth / 8,
        0,
        Math.PI * 2
      );
      ctx.arc(
        centerX + 5,
        centerY - bottleHeight / 1.8,
        bottleWidth / 10,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // **8️⃣ Glowing Poison Effect**
      ctx.shadowColor = "rgba(0, 255, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY + bottleHeight / 4,
        bottleWidth / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0; // Reset glow effect
    });

    // Draw Snake Body & Head
    ctx.fillStyle = "green"; // Snake color

    snake.forEach((part, index) => {
      const isHead = index === 0; // First segment is the head
      const radius = isHead ? box / 2 : box / 2.5; // Slightly larger head

      // **1️⃣ Create Smooth Snake Body**
      ctx.fillStyle = index % 2 === 0 ? "green" : "darkgreen"; // Alternate colors for a snake scale effect
      ctx.beginPath();
      ctx.arc(part.x + box / 2, part.y + box / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "darkgreen"; // Slightly darker outline
      ctx.lineWidth = 2;
      ctx.stroke();

      // **2️⃣ Draw Snake Head with Eyes & Tapered Shape**
      if (isHead) {
        ctx.fillStyle = "black"; // Eye color

        let eyeX, eyeY;

        if (direction === "RIGHT") {
          eyeX = part.x + box * 0.8;
          eyeY = part.y + box * 0.3; // Move eye higher
        } else if (direction === "LEFT") {
          eyeX = part.x + box * 0.2;
          eyeY = part.y + box * 0.3; // Move eye higher
        } else if (direction === "UP") {
          eyeX = part.x + box * 0.3;
          eyeY = part.y + box * 0.15; // Already high
        } else {
          eyeX = part.x + box * 0.6;
          eyeY = part.y + box * 0.75; // Keep it lower
        }

        // Draw the eye (ellipse for realism)
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, box * 0.12, box * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw the slit pupil
        ctx.strokeStyle = "yellow"; // Pupil color (adjust for realism)
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(eyeX, eyeY - box * 0.1);
        ctx.lineTo(eyeX, eyeY + box * 0.1);
        ctx.stroke();

        // **3️⃣ Draw Snake Tongue in the Correct Direction**
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.beginPath();

        if (direction === "RIGHT") {
          ctx.moveTo(part.x + box, part.y + box / 2);
          ctx.lineTo(part.x + box + 8, part.y + box / 2);
          ctx.moveTo(part.x + box + 8, part.y + box / 2);
          ctx.lineTo(part.x + box + 12, part.y + box / 2 - 3);
          ctx.moveTo(part.x + box + 8, part.y + box / 2);
          ctx.lineTo(part.x + box + 12, part.y + box / 2 + 3);
        } else if (direction === "LEFT") {
          ctx.moveTo(part.x, part.y + box / 2);
          ctx.lineTo(part.x - 8, part.y + box / 2);
          ctx.moveTo(part.x - 8, part.y + box / 2);
          ctx.lineTo(part.x - 12, part.y + box / 2 - 3);
          ctx.moveTo(part.x - 8, part.y + box / 2);
          ctx.lineTo(part.x - 12, part.y + box / 2 + 3);
        } else if (direction === "UP") {
          ctx.moveTo(part.x + box / 2, part.y);
          ctx.lineTo(part.x + box / 2, part.y - 8);
          ctx.moveTo(part.x + box / 2, part.y - 8);
          ctx.lineTo(part.x + box / 2 - 3, part.y - 12);
          ctx.moveTo(part.x + box / 2, part.y - 8);
          ctx.lineTo(part.x + box / 2 + 3, part.y - 12);
        } else {
          ctx.moveTo(part.x + box / 2, part.y + box);
          ctx.lineTo(part.x + box / 2, part.y + box + 8);
          ctx.moveTo(part.x + box / 2, part.y + box + 8);
          ctx.lineTo(part.x + box / 2 - 3, part.y + box + 12);
          ctx.moveTo(part.x + box / 2, part.y + box + 8);
          ctx.lineTo(part.x + box / 2 + 3, part.y + box + 12);
        }

        ctx.stroke();
      }
    });

    let head = { ...snake[0] };
    if (direction === "RIGHT") head.x += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;

    // Add new head before checking collision (so the final move is displayed)
    snake.unshift(head);

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
        playSound(goodFruitSFX);
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
        playSound(badFoodSFX);
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

    ctx.fillStyle = score === 0 ? "wheat" : "";
    ctx.font = "1.5dvh 'Press Start 2P', cursive"; // Use the same font
    ctx.fillText(`Score: ${score}`, 20, 40);
    ctx.fillText(`Level: ${level}`, 20, 60);
  }

  function togglePause() {
    if (!running) {
      // If game is not running, start it
      resetGame();
      startGame();
      return;
    }

    if (isPaused) {
      gameLoop = setInterval(draw, speed);
      isPaused = false;
    } else {
      clearInterval(gameLoop);
      isPaused = true;
      ctx.fillStyle = "wheat";
      ctx.font = "2dvh 'Press Start 2P', cursive";
      const text = "Paused - Press Space or Tap to Resume";
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height / 2);
    }
  }

  // Handle Key Events
  document.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      togglePause();
    }

    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  });

  // Level up function
  function levelUp() {
    level++;
    speed = Math.max(50, speed - 10);
    food.push(...getRandomPositions(1));
    badFood.push(...getRandomPositions(1));

    clearInterval(gameLoop);
    gameLoop = setInterval(draw, speed);
  }

  function endGame() {
    clearInterval(gameLoop);
    running = false;

    setTimeout(() => {
      if (score < 0) {
        document.getElementById("finalScore").innerText = `Final Score: 0`;
        document.getElementById("gameOverModal").style.display = "flex";
      } else {
        document.getElementById(
          "finalScore"
        ).innerText = `Final Score: ${score}`;
        document.getElementById("gameOverModal").style.display = "flex";
      }
    }, 200);
  }

  // Add event listeners for modal buttons
  document.getElementById("playAgain").addEventListener("click", () => {
    document.getElementById("gameOverModal").style.display = "none"; // Hide modal
    resetGame();
    startGame();
  });

  document.getElementById("exitGame").addEventListener("click", () => {
    document.getElementById("gameOverModal").style.display = "none"; // Hide modal
    clearBoard();
    resetGame();
  });

  canvas.addEventListener("click", () => {
    if (!running) {
      startGame();
    }
  });
  const instructionsModal = document.getElementById("instructionsModal");

  instructionsModal.style.display = "flex";

  const instructionsButton = document.getElementById("instructionsSettings");
  const closeInstructions = document.getElementById("closeInstructions");

  const settingsButton = document.getElementById("settingsButton");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettings = document.getElementById("closeSettings");

  const controlButtons = document.querySelectorAll(".controlOption");
  const controls = document.getElementById("controls");

  // Ensure the parent container is flexbox
  controls.style.display = "flex";
  controls.style.flexDirection = "column";
  controls.style.alignItems = "center"; // Default center

  // Open Settings Modal & Pause Game
  settingsButton.addEventListener("click", () => {
    if (!isPaused && running) {
      togglePause();
    }

    settingsModal.style.display = "flex";
  });

  // Close Settings Modal
  closeSettings.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });

  instructionsButton.addEventListener("click", () => {
    if (!isPaused && running) {
      togglePause();
    }

    instructionsModal.style.display = "flex"; // ✅ Show the correct modal
  });

  closeInstructions.addEventListener("click", () => {
    instructionsModal.style.display = "none"; // ✅ Close the instructions modal
  });

  // Change Control Position
  controlButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const position = event.target.dataset.position;

      // Get the parent container of controls (so we modify positioning properly)
      const controlsContainer = controls.parentElement;

      if (position === "left") {
        controlsContainer.style.justifyContent = "flex-start";
        controlsContainer.style.alignItems = "flex-start";
      } else if (position === "right") {
        controlsContainer.style.justifyContent = "flex-end";
        controlsContainer.style.alignItems = "flex-end";
      } else {
        controlsContainer.style.justifyContent = "center";
        controlsContainer.style.alignItems = "center";
      }

      settingsModal.style.display = "none"; // Close settings after selection
    });
  });

  resetGame();
});
