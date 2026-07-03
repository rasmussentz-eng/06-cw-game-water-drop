var gameRunning = false;
var dropMaker = null;
var timerId = null;
var score = 0;
var timeLeft = 30;
var winMessages = [
  "You saved the water! Great job!",
  "Amazing catch! You are a water hero!",
  "You won! Keep spreading clean water love!"
];
var loseMessages = [
  "Try again! The water needs you.",
  "So close! Catch more drops next time.",
  "Keep practicing and you will win!"
];

var gameContainer = document.getElementById("game-container");
var scoreDisplay = document.getElementById("score");
var timeDisplay = document.getElementById("time");
var messageDisplay = document.getElementById("message");
var startButton = document.getElementById("start-btn");
var resetButton = document.getElementById("reset-btn");

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

function startGame() {
  if (gameRunning) {
    return;
  }

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  updateScore();
  updateTimerDisplay();
  messageDisplay.textContent = "Catch the clean drops and avoid the red ones.";

  startButton.disabled = true;
  resetButton.classList.add("hidden");

  dropMaker = setInterval(createDrop, 1000);
  timerId = setInterval(updateTimer, 1000);
  createDrop();
}

function updateTimer() {
  if (!gameRunning) {
    return;
  }

  timeLeft = timeLeft - 1;
  if (timeLeft < 0) {
    timeLeft = 0;
  }

  updateTimerDisplay();

  if (timeLeft === 0) {
    endGame();
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
}

function updateTimerDisplay() {
  timeDisplay.textContent = timeLeft;
}

function endGame() {
  if (!gameRunning) {
    return;
  }

  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerId);
  dropMaker = null;
  timerId = null;
  removeAllDrops();
  showEndMessage();
  resetButton.classList.remove("hidden");
  startButton.disabled = true;
}

function showEndMessage() {
  var messageList = score >= 20 ? winMessages : loseMessages;
  var randomIndex = Math.floor(Math.random() * messageList.length);
  messageDisplay.textContent = messageList[randomIndex];

  if (score >= 20) {
    createCelebration();
  }
}

function removeAllDrops() {
  var drops = gameContainer.querySelectorAll(".water-drop");
  for (var i = 0; i < drops.length; i++) {
    drops[i].remove();
  }
  var confettiPieces = gameContainer.querySelectorAll(".confetti");
  for (var j = 0; j < confettiPieces.length; j++) {
    confettiPieces[j].remove();
  }
}

function resetGame() {
  clearInterval(dropMaker);
  clearInterval(timerId);
  dropMaker = null;
  timerId = null;
  gameRunning = false;
  score = 0;
  timeLeft = 30;
  updateScore();
  updateTimerDisplay();
  messageDisplay.textContent = "Press Start to begin.";
  startButton.disabled = false;
  resetButton.classList.add("hidden");
  removeAllDrops();
}

function createDrop() {
  if (!gameRunning) {
    return;
  }

  var drop = document.createElement("div");
  var isBadDrop = Math.random() < 0.2;
  drop.className = "water-drop " + (isBadDrop ? "bad-drop" : "good-drop");

  var baseSize = 50;
  var sizeMultiplier = Math.random() * 0.8 + 0.6;
  var size = baseSize * sizeMultiplier;
  drop.style.width = size + "px";
  drop.style.height = size + "px";

  var gameWidth = gameContainer.offsetWidth;
  var maxX = Math.max(0, gameWidth - size);
  var xPosition = Math.random() * maxX;
  drop.style.left = xPosition + "px";
  drop.style.top = "-80px";
  drop.style.animationDuration = "4s";

  drop.addEventListener("click", function() {
    if (!gameRunning) {
      return;
    }

    if (isBadDrop) {
      score = Math.max(0, score - 1);
    } else {
      score = score + 1;
    }

    updateScore();
    drop.remove();
  });

  drop.addEventListener("animationend", function() {
    drop.remove();
  });

  gameContainer.appendChild(drop);
}

function createCelebration() {
  // Create a simple confetti effect when the player wins.
  for (var i = 0; i < 18; i++) {
    var confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * (gameContainer.offsetWidth - 10) + "px";
    confetti.style.top = Math.random() * 40 + 10 + "px";
    confetti.style.backgroundColor = i % 2 === 0 ? "#ffc907" : "#4fcb53";
    confetti.style.setProperty("--confetti-x", (Math.random() * 120 - 60) + "px");
    gameContainer.appendChild(confetti);

    // Remove each confetti piece after 4 seconds so the effect lasts 3-5 seconds.
    (function(piece) {
      setTimeout(function() {
        piece.remove();
      }, 4000);
    })(confetti);
  }
}
