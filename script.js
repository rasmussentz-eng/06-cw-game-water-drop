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
var difficultySelect = document.getElementById("difficulty-select");
var goalDisplay = document.getElementById("goal");
var currentDifficulty = "normal";
var scoreGoal = 20;
var milestoneMessages = [
  { threshold: 5, text: "Halfway there — keep going!" },
  { threshold: 10, text: "Great job — you are on a roll!" },
  { threshold: 15, text: "You are close to winning!" }
];
var milestoneFlags = {};
var audioContext = null;

var difficultyModes = {
  easy: { label: "Easy", time: 45, goal: 10, spawnRate: 1400, dropSpeed: 5.2 },
  normal: { label: "Normal", time: 30, goal: 20, spawnRate: 1000, dropSpeed: 4 },
  hard: { label: "Hard", time: 20, goal: 30, spawnRate: 700, dropSpeed: 2.8 }
};

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
difficultySelect.addEventListener("change", updateDifficultySetting);

function updateDifficultySetting() {
  currentDifficulty = difficultySelect.value;
  var config = difficultyModes[currentDifficulty] || difficultyModes.normal;
  scoreGoal = config.goal;
  timeLeft = config.time;
  updateScoreGoal();
  updateTimerDisplay();

  if (!gameRunning) {
    messageDisplay.textContent = "Mode set to " + config.label + ". Press Start to begin.";
  }
}

function updateScoreGoal() {
  goalDisplay.textContent = scoreGoal;
}

function checkMilestones() {
  if (!gameRunning) {
    return;
  }

  for (var i = 0; i < milestoneMessages.length; i++) {
    var milestone = milestoneMessages[i];
    if (score >= milestone.threshold && !milestoneFlags[milestone.threshold]) {
      milestoneFlags[milestone.threshold] = true;
      messageDisplay.textContent = milestone.text;
      playSound("milestone");
      break;
    }
  }
}

function playSound(type) {
  if (typeof window === "undefined") {
    return;
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  var oscillator = audioContext.createOscillator();
  var gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  var frequency = 440;
  if (type === "collect") {
    frequency = 660;
  } else if (type === "bad") {
    frequency = 220;
  } else if (type === "win") {
    frequency = 880;
  } else if (type === "lose") {
    frequency = 330;
  } else if (type === "milestone") {
    frequency = 540;
  }

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

var initialConfig = difficultyModes[currentDifficulty] || difficultyModes.normal;
scoreGoal = initialConfig.goal;
timeLeft = initialConfig.time;
updateScoreGoal();
updateTimerDisplay();

function startGame() {
  if (gameRunning) {
    return;
  }

  currentDifficulty = difficultySelect.value;
  var config = difficultyModes[currentDifficulty] || difficultyModes.normal;
  scoreGoal = config.goal;
  timeLeft = config.time;
  milestoneFlags = {};
  updateScoreGoal();

  gameRunning = true;
  score = 0;
  updateScore();
  updateTimerDisplay();
  messageDisplay.textContent = "Catch the clean drops and avoid the red ones.";

  startButton.disabled = true;
  resetButton.classList.add("hidden");

  clearInterval(dropMaker);
  clearInterval(timerId);
  dropMaker = setInterval(createDrop, config.spawnRate);
  timerId = setInterval(updateTimer, 1000);
  createDrop();
  playSound("start");
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
  checkMilestones();
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
  var messageList = score >= scoreGoal ? winMessages : loseMessages;
  var randomIndex = Math.floor(Math.random() * messageList.length);
  messageDisplay.textContent = messageList[randomIndex];

  if (score >= scoreGoal) {
    createCelebration();
    playSound("win");
  } else {
    playSound("lose");
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
  milestoneFlags = {};
  var config = difficultyModes[currentDifficulty] || difficultyModes.normal;
  timeLeft = config.time;
  scoreGoal = config.goal;
  updateScoreGoal();
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

  var config = difficultyModes[currentDifficulty] || difficultyModes.normal;
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
  drop.style.animationDuration = config.dropSpeed + "s";

  drop.addEventListener("click", function() {
    if (!gameRunning) {
      return;
    }

    if (isBadDrop) {
      score = Math.max(0, score - 1);
      playSound("bad");
    } else {
      score = score + 1;
      playSound("collect");
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
