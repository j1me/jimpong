/* script.js */

/* JavaScript for Game Functionality */

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Paddle and Ball Dimensions
const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

// Paddle Objects
let leftPaddle = {
    x: 20,
    y: 0, // Will be set in initGame()
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 400 // Pixels per second
};

let rightPaddle = {
    x: 0, // Will be set in initGame()
    y: 0, // Will be set in initGame()
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 400 // Pixels per second
};

// Ball Object
let ball = {
    x: 0, // Will be set in initGame()
    y: 0, // Will be set in initGame()
    radius: ballRadius,
    speed: 300, // Pixels per second
    dx: 0,
    dy: 0
};

// Game State Variables
let score = 0;
let level = 1;
let round = 1;
const maxRounds = 10;
const pointsPerLevel = 10;

let keys = {}; // Object to track pressed keys
let gameStarted = false;
let isPaused = false;
let gameOver = false; // New variable to track game over state

// Game Loop Variables
let lastTime = 0; // To keep track of the last timestamp

// DOM Elements
const startButton = document.getElementById('startButton');
const mobilePauseButton = document.getElementById('mobilePauseButton');
const congratsOverlay = document.getElementById('congratsOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const playButton = document.getElementById('playButton');
const welcomeScreen = document.getElementById('welcomeScreen');

// Responsive canvas sizing
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const aspect = canvas.width / canvas.height;
    let newWidth, newHeight;

    if (containerWidth / containerHeight > aspect) {
        newHeight = containerHeight;
        newWidth = newHeight * aspect;
    } else {
        newWidth = containerWidth;
        newHeight = newWidth / aspect;
    }

    // Set canvas display size
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
    initGame(); // Initialize game elements after canvas size is set
    resizeCanvas();
});

// Initialize Game Elements
function initGame() {
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 600;

    resetPaddles(); // Reset paddles to initial positions
    resetBall(); // Reset ball position and state
}

// Event Listeners for Keyboard Controls
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    // Prevent default scrolling with keys
    if (['q', 'w', 'o', 'p', ' '].includes(key)) {
        e.preventDefault();
    }

    // Start the game on first control key press
    if (!gameStarted && !gameOver && ['q', 'w', 'o', 'p'].includes(key)) {
        startGame();
    }

    // Pause/Resume the game with Space Bar
    if (key === ' ') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = false;
});

// Event Listener for Start/Restart Button
startButton.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
    } else {
        restartGame();
    }
});

// Event Listener for Mobile Pause/Restart Button
mobilePauseButton.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
    } else {
        togglePause();
    }
});

// Event Listener for Play Button on Mobile
if (playButton) {
    playButton.addEventListener('click', () => {
        // Hide the welcome screen
        welcomeScreen.style.display = 'none';
        // Show the game area
        document.getElementById('gameArea').style.display = 'flex';
        // Lock the orientation to landscape if possible
        lockOrientation();
        // Start the game
        startGame();
    });
}

// Function to Lock Orientation to Landscape (for supported browsers)
function lockOrientation() {
    if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
    }
}

// Function to Start the Game
function startGame() {
    if (gameOver) return; // Prevent starting the game if it's over

    gameStarted = true;
    isPaused = false;

    // Randomize ball direction
    let angle = Math.random() * (Math.PI / 4) - (Math.PI / 8); // Random angle between -22.5 and 22.5 degrees
    let direction = Math.random() < 0.5 ? 1 : -1;
    ball.dx = direction * ball.speed * Math.cos(angle);
    ball.dy = ball.speed * Math.sin(angle);

    // Hide the Start button (desktop)
    startButton.style.display = 'none';

    // Hide the welcome screen (in case it's visible)
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    mobilePauseButton.textContent = 'Pause';
    hideOverlays();
}

// Function to Reset the Ball Position and State
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
}

// Function to Reset Paddles to Initial Positions
function resetPaddles() {
    leftPaddle.x = 20;
    leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
    rightPaddle.x = canvas.width - 20 - paddleWidth;
    rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
    leftPaddle.dy = 0;
    rightPaddle.dy = 0;
}

// Main Game Loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
    lastTime = timestamp;

    if (!gameOver) {
        updatePaddles(deltaTime);
        updateBall(deltaTime);
    }
    draw();

    requestAnimationFrame(gameLoop);
}

// Function to Update Paddle Positions Based on Input
function updatePaddles(deltaTime) {
    if (isPaused || gameOver) return; // Do not update paddles if paused or game over

    // Left Paddle Controls: 'q' and 'w'
    if (keys['q']) {
        leftPaddle.dy = -leftPaddle.speed;
    } else if (keys['w']) {
        leftPaddle.dy = leftPaddle.speed;
    } else {
        leftPaddle.dy = 0;
    }

    // Right Paddle Controls: 'o' and 'p'
    if (keys['o']) {
        rightPaddle.dy = -rightPaddle.speed;
    } else if (keys['p']) {
        rightPaddle.dy = rightPaddle.speed;
    } else {
        rightPaddle.dy = 0;
    }

    // Update Paddle Positions
    leftPaddle.y += leftPaddle.dy * deltaTime;
    rightPaddle.y += rightPaddle.dy * deltaTime;

    // Prevent Paddles from Moving Out of Canvas
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > canvas.height)
        leftPaddle.y = canvas.height - leftPaddle.height;

    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > canvas.height)
        rightPaddle.y = canvas.height - rightPaddle.height;
}

// Function to Update Ball Position and Handle Collisions
function updateBall(deltaTime) {
    if (gameStarted && !isPaused && !gameOver) {
        // Update ball position
        ball.x += ball.dx * deltaTime;
        ball.y += ball.dy * deltaTime;

        // Top and Bottom Wall Collision
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.dy *= -1;
        } else if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.dy *= -1;
        }

        // Left Paddle Collision
        if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
            ball.y > leftPaddle.y &&
            ball.y < leftPaddle.y + leftPaddle.height) {
            ball.x = leftPaddle.x + leftPaddle.width + ball.radius; // Prevent sticking
            ball.dx *= -1;
            score++;
            checkLevelUp();
            updateScoreboard();
        }

        // Right Paddle Collision
        if (ball.x + ball.radius > rightPaddle.x &&
            ball.y > rightPaddle.y &&
            ball.y < rightPaddle.y + rightPaddle.height) {
            ball.x = rightPaddle.x - ball.radius; // Prevent sticking
            ball.dx *= -1;
            score++;
            checkLevelUp();
            updateScoreboard();
        }

        // Miss Detection
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            showGameOver();
        }
    }
}

// Function to Draw a Paddle
function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Function to Draw the Ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red'; // Ball color set to red
    ctx.fill();
    ctx.closePath();
}

// Function to Render the Game Elements
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles and ball
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall();

    // Grey out the background if game over
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Function to Check for Level Up
function checkLevelUp() {
    if (score >= pointsPerLevel) {
        level++;
        round++;
        if (round > maxRounds) {
            winGame();
        } else {
            score = 0;
            ball.speed *= 1.1; // Increase speed by 10%
            // Update ball direction with increased speed
            let angle = Math.atan2(ball.dy, ball.dx);
            let direction = ball.dx > 0 ? 1 : -1;
            ball.dx = direction * ball.speed * Math.cos(angle);
            ball.dy = ball.speed * Math.sin(angle);
            showCongrats();
        }
        updateScoreboard();
    }
}

// Function to Restart the Game
function restartGame() {
    resetBall();
    resetPaddles(); // Reset paddles to initial positions
    score = 0;
    level = 1;
    round = 1;
    ball.speed = 300;
    leftPaddle.speed = 400;
    rightPaddle.speed = 400;
    gameOver = false; // Reset game over state
    updateScoreboard();
    startButton.textContent = 'Start Game';
    mobilePauseButton.textContent = 'Pause';
    hideOverlays();
}

// Function to Handle Winning the Game
function winGame() {
    showMessage("Congratulations! You won the game!");
    restartGame();
}

// Function to Update the Scoreboard
function updateScoreboard() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('round').textContent = `${round}/${maxRounds}`;
}

// Start the Game Loop
requestAnimationFrame(gameLoop);

/*
   Functions for Overlays
*/

// Function to Show Congratulatory Overlay
function showCongrats() {
    gameStarted = false; // Stop the game
    ball.dx = 0;
    ball.dy = 0;
    congratsOverlay.style.display = 'flex';
    congratsOverlay.querySelector('button').focus(); // Automatically focus the button
}

// Function to Close Congratulatory Overlay
function closeCongrats() {
    congratsOverlay.style.display = 'none';
    startGame(); // Start the next round
}

// Function to Show Game Over Overlay
function showGameOver() {
    gameStarted = false; // Stop the game
    gameOver = true; // Set game over state
    ball.dx = 0;
    ball.dy = 0;
    gameOverOverlay.style.display = 'flex';
    gameOverOverlay.querySelector('button').focus(); // Automatically focus the button
}

// Function to Show General Message Overlay (e.g., Winning the Game)
function showMessage(message) {
    gameStarted = false; // Stop the game
    gameOver = true; // Set game over state
    ball.dx = 0;
    ball.dy = 0;
    gameOverOverlay.querySelector('h2').textContent = message;
    gameOverOverlay.style.display = 'flex';
    gameOverOverlay.querySelector('button').focus(); // Automatically focus the button
}

// Function to Hide All Overlays
function hideOverlays() {
    congratsOverlay.style.display = 'none';
    gameOverOverlay.style.display = 'none';
    pauseOverlay.style.display = 'none';
}

/*
   Pause Feature
*/

// Function to Toggle Pause State
function togglePause() {
    if (!gameStarted || gameOver) return; // Do nothing if game hasn't started or game is over

    isPaused = !isPaused;
    if (isPaused) {
        pauseOverlay.style.display = 'flex';
        mobilePauseButton.textContent = 'Resume';
    } else {
        pauseOverlay.style.display = 'none';
        mobilePauseButton.textContent = 'Pause';
    }
}

/*
   Touch Controls for Mobile
*/

// Variables to track touch positions
let touchPositions = {};

// Function to handle touch start
function handleTouchStart(e) {
    if (gameOver) return; // Disable touch controls when game is over

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        touchPositions[touch.identifier] = {
            x: touch.clientX,
            y: touch.clientY
        };
    }
}

// Function to handle touch move
function handleTouchMove(e) {
    if (gameOver) return; // Disable touch controls when game is over

    e.preventDefault(); // Prevent scrolling when touching the canvas
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const prevPos = touchPositions[touch.identifier];
        if (!prevPos) continue;

        const touchX = touch.clientX;
        const touchY = touch.clientY;
        const deltaY = touchY - prevPos.y;

        // Determine which paddle to move based on initial touch position
        if (prevPos.x < window.innerWidth / 2) { // Left side touches move left paddle
            leftPaddle.y += deltaY;
            // Prevent paddle from moving out of canvas
            if (leftPaddle.y < 0) leftPaddle.y = 0;
            if (leftPaddle.y + leftPaddle.height > canvas.height)
                leftPaddle.y = canvas.height - leftPaddle.height;
        } else { // Right side touches move right paddle
            rightPaddle.y += deltaY;
            // Prevent paddle from moving out of canvas
            if (rightPaddle.y < 0) rightPaddle.y = 0;
            if (rightPaddle.y + rightPaddle.height > canvas.height)
                rightPaddle.y = canvas.height - rightPaddle.height;
        }

        // Update touch positions
        touchPositions[touch.identifier] = {
            x: touchX,
            y: touchY
        };
    }
}

// Function to handle touch end
function handleTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        delete touchPositions[touch.identifier];
    }
}

// Attach touch event listeners to the canvas
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);
canvas.addEventListener('touchcancel', handleTouchEnd, false);