/* script.js */

/* JavaScript for Game Functionality */

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set up logical canvas size
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;

// Scale factors for responsive canvas sizing
let scaleX = 1;
let scaleY = 1;

// Responsive canvas sizing
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = window.innerHeight - document.getElementById('scoreboard').offsetHeight - document.getElementById('startButton').offsetHeight - 40; // Adjust based on other elements' height

    // Maintain aspect ratio
    const aspect = LOGICAL_WIDTH / LOGICAL_HEIGHT;
    let newWidth = containerWidth;
    let newHeight = newWidth / aspect;

    if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = newHeight * aspect;
    }

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    // Update scale factors
    scaleX = newWidth / LOGICAL_WIDTH;
    scaleY = newHeight / LOGICAL_HEIGHT;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);
resizeCanvas(); // Initial call

// Paddle and Ball Dimensions
const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

// Paddle Objects
let leftPaddle = {
    x: 20,
    y: LOGICAL_HEIGHT / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

let rightPaddle = {
    x: LOGICAL_WIDTH - 20 - paddleWidth,
    y: LOGICAL_HEIGHT / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball Object
let ball = {
    x: LOGICAL_WIDTH / 2,
    y: LOGICAL_HEIGHT / 2,
    radius: ballRadius,
    speed: 5,
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

// DOM Elements
const startButton = document.getElementById('startButton');
const mobilePauseButton = document.getElementById('mobilePauseButton');
const congratsOverlay = document.getElementById('congratsOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');

// Event Listeners for Keyboard Controls
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    // Prevent default scrolling with keys
    if (['q', 'w', 'o', 'p', ' '].includes(key)) {
        e.preventDefault();
    }

    // Start the game on first control key press
    if (!gameStarted && ['q', 'w', 'o', 'p'].includes(key)) {
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

// Function to Start the Game
function startGame() {
    gameStarted = true;
    isPaused = false;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    startButton.textContent = 'Restart Game';
    mobilePauseButton.textContent = 'Pause';
    hideOverlays();
}

// Function to Reset the Ball Position and State
function resetBall() {
    ball.x = LOGICAL_WIDTH / 2;
    ball.y = LOGICAL_HEIGHT / 2;
    ball.dx = 0;
    ball.dy = 0;
    gameStarted = false;
    isPaused = false;
    startButton.textContent = 'Start Game';
    mobilePauseButton.textContent = 'Pause';
    hideOverlays();
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
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Draw paddles and ball
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall();
}

// Function to Update Paddle Positions Based on Input
function updatePaddles() {
    // Left Paddle Controls: 'q' and 'w'
    if (keys['q']) {
        leftPaddle.dy = -7;
    } else if (keys['w']) {
        leftPaddle.dy = 7;
    } else {
        leftPaddle.dy = 0;
    }

    // Right Paddle Controls: 'o' and 'p'
    if (keys['o']) {
        rightPaddle.dy = -7;
    } else if (keys['p']) {
        rightPaddle.dy = 7;
    } else {
        rightPaddle.dy = 0;
    }

    // Update Paddle Positions
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    // Prevent Paddles from Moving Out of Canvas
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > LOGICAL_HEIGHT)
        leftPaddle.y = LOGICAL_HEIGHT - leftPaddle.height;

    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > LOGICAL_HEIGHT)
        rightPaddle.y = LOGICAL_HEIGHT - rightPaddle.height;
}

// Function to Update Ball Position and Handle Collisions
function updateBall() {
    if (gameStarted && !isPaused) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Top and Bottom Wall Collision
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > LOGICAL_HEIGHT) {
            ball.dy *= -1;
        }

        // Left Paddle Collision
        if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
            ball.y > leftPaddle.y &&
            ball.y < leftPaddle.y + leftPaddle.height) {
            ball.dx *= -1;
            ball.x = leftPaddle.x + leftPaddle.width + ball.radius; // Prevent sticking
            score++;
            checkLevelUp();
            updateScoreboard();
        }

        // Right Paddle Collision
        if (ball.x + ball.radius > rightPaddle.x &&
            ball.y > rightPaddle.y &&
            ball.y < rightPaddle.y + rightPaddle.height) {
            ball.dx *= -1;
            ball.x = rightPaddle.x - ball.radius; // Prevent sticking
            score++;
            checkLevelUp();
            updateScoreboard();
        }

        // Miss Detection
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > LOGICAL_WIDTH) {
            showGameOver();
        }
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
            ball.dx = (ball.dx > 0 ? 1 : -1) * ball.speed;
            ball.dy = (ball.dy > 0 ? 1 : -1) * ball.speed;
            showCongrats();
        }
        updateScoreboard();
    }
}

// Function to Restart the Game
function restartGame() {
    resetBall();
    score = 0;
    level = 1;
    round = 1;
    ball.speed = 5;
    updateScoreboard();
    startButton.textContent = 'Start Game';
    mobilePauseButton.textContent = 'Pause';
}

// Function to Handle Winning the Game
function winGame() {
    showMessage("Congratulations! You won the game!");
    score = 0;
    level = 1;
    round = 1;
    ball.speed = 5;
    resetBall();
    updateScoreboard();
}

// Function to Update the Scoreboard
function updateScoreboard() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('round').textContent = `${round}/${maxRounds}`;
}

// Main Game Loop
function gameLoop() {
    updatePaddles();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize the Game
resetBall();
updateScoreboard();
gameLoop();

/*
   Functions for Overlays
*/

// Function to Show Congratulatory Overlay
function showCongrats() {
    congratsOverlay.style.display = 'flex';
    congratsOverlay.querySelector('button').focus(); // Automatically focus the button
}

// Function to Close Congratulatory Overlay
function closeCongrats() {
    congratsOverlay.style.display = 'none';
}

// Function to Show Game Over Overlay
function showGameOver() {
    gameOverOverlay.style.display = 'flex';
    gameOverOverlay.querySelector('button').focus(); // Automatically focus the button
}

// Function to Show General Message Overlay (e.g., Winning the Game)
function showMessage(message) {
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
    if (!gameStarted) return; // Do nothing if game hasn't started

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
   Accessibility Enhancements:
   - Overlays automatically focus the primary button when displayed.
   - Buttons are natively focusable and can be activated with the Enter key.
*/

/*
   Touch Controls for Mobile
*/

// Variables to track touch positions
let touchPositions = {};

// Function to handle touch start
function handleTouchStart(e) {
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
            leftPaddle.y += deltaY * 0.5; // Adjust sensitivity
            // Prevent paddle from moving out of canvas
            if (leftPaddle.y < 0) leftPaddle.y = 0;
            if (leftPaddle.y + leftPaddle.height > LOGICAL_HEIGHT)
                leftPaddle.y = LOGICAL_HEIGHT - leftPaddle.height;
        } else { // Right side touches move right paddle
            rightPaddle.y += deltaY * 0.5; // Adjust sensitivity
            // Prevent paddle from moving out of canvas
            if (rightPaddle.y < 0) rightPaddle.y = 0;
            if (rightPaddle.y + rightPaddle.height > LOGICAL_HEIGHT)
                rightPaddle.y = LOGICAL_HEIGHT - rightPaddle.height;
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

/*
   Orientation Handling
*/

// Function to check device orientation and prompt user
function checkOrientation() {
    if (window.innerWidth < window.innerHeight) {
        // Portrait mode detected
        alert("Please rotate your device to landscape mode for the best experience.");
    }
}

window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('load', checkOrientation);
