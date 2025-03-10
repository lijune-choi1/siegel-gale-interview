// Game variables
let gameActive = false;
let gameContext;
let player = { x: 50, y: 200, width: 30, height: 30, jumping: false, velocity: 0, gravity: 0.5 };
let obstacles = [];
let gameSpeed = 4; // Slightly slower
let gameScore = 0;
let transformationProgress = 0;
let gameInterval;
let gameCanvas;
let startGameBtn;
let resetGameBtn;
let canvasWidth;
let canvasHeight;
let groundHeight = 1; // Thinner ground line
let playerGroundY;
let animatingTransformation = false;
let transformationAnimationProgress = 0;
let lastTransformationTime = 0;
const brandingMessages = [
    "Simpler is Smarter",
    "Clarity through Simplicity",
    "Complex to Clear",
    "Simplicity Drives Impact",
    "Less is More"
];
let activeMessages = [];


// Initialize game
function initGame() {
    console.log('Game initialization started');
    gameCanvas = document.getElementById('game-canvas');
    startGameBtn = document.getElementById('start-game');
    resetGameBtn = document.getElementById('reset-game');
    
    if (!gameCanvas) {
        console.error('Game canvas not found');
        return;
    }
    
    // Set canvas to maintain aspect ratio
    setCanvasDimensions();
    
    // Set player's ground position
    playerGroundY = canvasHeight - groundHeight - player.height;
    player.y = playerGroundY;
    
    gameContext = gameCanvas.getContext('2d');
    
    // Create initial obstacles
    createInitialObstacles();
    
    resetGame();
    
    // Game control events
    startGameBtn.addEventListener('click', startGame);
    resetGameBtn.addEventListener('click', resetGame);
    gameCanvas.addEventListener('click', () => {
        if (gameActive) playerJump();
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && document.getElementById('content-game').classList.contains('active')) {
            if (gameActive) playerJump();
            e.preventDefault(); // Prevent page scrolling on spacebar
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (document.getElementById('content-game').classList.contains('active')) {
            setCanvasDimensions();
            // Update player position
            playerGroundY = canvasHeight - groundHeight - player.height;
            if (!player.jumping) {
                player.y = playerGroundY;
            }
            // Adjust obstacle positions
            adjustObstaclePositions();
            // Redraw game if not active
            if (!gameActive) {
                drawBackground();
                drawObstacles();
                drawPlayer();
            }
        }
    });
    
    console.log('Game initialization completed');
}
function setCanvasDimensions() {
    // Get container dimensions
    const container = document.querySelector('.game-canvas-container');
    if (!container) {
        console.error('Game canvas container not found');
        return;
    }
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Use devicePixelRatio for high-resolution displays
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas dimensions accounting for pixel ratio
    gameCanvas.width = containerWidth * dpr;
    gameCanvas.height = containerHeight * dpr;
    
    // Scale the context to ensure correct drawing
    gameContext = gameCanvas.getContext('2d');
    gameContext.scale(dpr, dpr);
    
    // IMPORTANT: Set CSS dimensions explicitly (change this part)
    gameCanvas.style.position = 'absolute';
    gameCanvas.style.top = '0';
    gameCanvas.style.left = '0';
    gameCanvas.style.width = '100%';
    gameCanvas.style.height = '100%';
    
    canvasWidth = containerWidth;
    canvasHeight = containerHeight;
    
    console.log(`Canvas sized to ${canvasWidth}x${canvasHeight} with pixel ratio ${dpr}`);
}
// Create initial set of obstacles
function createInitialObstacles() {
    // Clear existing obstacles
    obstacles = [];
    
    // Create 5 obstacles with wider spacing
    const spacing = canvasWidth / 1.5; // Even wider spacing
    
    for (let i = 0; i < 5; i++) {
        // Make obstacles much smaller - just cubic pixels
        obstacles.push({
            x: canvasWidth + i * spacing,
            y: canvasHeight - groundHeight - 20, // Fixed small height
            width: 10, // Small width
            height: 20, // Small height
            counted: false
        });
    }
}

// Adjust obstacle positions after resize
function adjustObstaclePositions() {
    // Recalculate positions based on new canvas size
    const spacing = canvasWidth / 1.5;
    
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        // Adjust x position based on original position relative to canvas width
        obstacle.x = canvasWidth + (i * spacing) - gameScore * gameSpeed;
        // Make sure it's not off-screen to the left
        if (obstacle.x < -obstacle.width) {
            obstacle.x += 5 * spacing;
        }
        // Update y position relative to ground
        obstacle.y = canvasHeight - groundHeight - obstacle.height;
    }
}

function startGame() {
    if (!gameActive) {
        gameActive = true;
        gameInterval = setInterval(updateGame, 20);
        startGameBtn.innerText = "Pause";
    } else {
        gameActive = false;
        clearInterval(gameInterval);
        startGameBtn.innerText = "Resume";
    }
}

function resetGame() {
    // Reset game state
    gameActive = false;
    clearInterval(gameInterval);
    gameScore = 0;
    transformationProgress = 0;
    
    // Reset player
    player = { 
        x: 50, 
        y: playerGroundY, 
        width: 30, 
        height: 30, 
        jumping: false, 
        velocity: 0, 
        gravity: 0.5 
    };
    
    // Reset obstacles
    createInitialObstacles();
    
    // Clear canvas
    gameContext.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw initial state
    drawBackground();
    drawObstacles();
    drawPlayer();
    
    // Reset button text
    startGameBtn.innerText = "Start Game";
}
function updateGame() {
    // Clear canvas
    gameContext.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Update player
    if (player.jumping) {
        player.velocity += player.gravity;
        player.y += player.velocity;
        
        if (player.y >= playerGroundY) {
            player.y = playerGroundY;
            player.jumping = false;
            player.velocity = 0;
        }
    }
    
    // Update obstacles
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameSpeed;
        
        // Check collisions
        if (
            player.x < obstacles[i].x + obstacles[i].width &&
            player.x + player.width > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y
        ) {
            gameOver();
            return;
        }
        
        if (obstacles[i].x + obstacles[i].width < player.x && !obstacles[i].counted) {
            obstacles[i].counted = true;
            gameScore++;
            transformationProgress = Math.min(100, transformationProgress + 20);
            
            // Add a new message - CHANGE THIS PART
            const messageIndex = gameScore % brandingMessages.length;
            activeMessages.push({
                text: brandingMessages[messageIndex],
                x: player.x + 100, // Position to the left of player instead of at obstacle
                y: player.y ,  // Position above the player
                opacity: 1,
                time: Date.now()
            });
            
            // Check win condition
            if (transformationProgress >= 100) {
                // Don't trigger win yet, let the animation handle it
                if (!animatingTransformation) {
                    animatingTransformation = true;
                    lastTransformationTime = Date.now();
                }
                return;
            }
        }
        
        // Reset obstacles that go off screen
        if (obstacles[i].x + obstacles[i].width < 0) {
            const farthestObstacle = findFarthestObstacle();
            obstacles[i].x = farthestObstacle + canvasWidth / 1.5; // Wider spacing
            obstacles[i].counted = false;
            // Keep obstacles small and uniform
            obstacles[i].height = 20;
            obstacles[i].width = 10;
            obstacles[i].y = canvasHeight - groundHeight - obstacles[i].height;
        }
    }
    
    
    // Update and draw messages
    const currentTime = Date.now();
    for (let i = activeMessages.length - 1; i >= 0; i--) {
        const message = activeMessages[i];
        const elapsed = currentTime - message.time;
        
        // Message fades out after 2 seconds
        if (elapsed > 2000) {
            activeMessages.splice(i, 1);
            continue;
        }
        
        // Calculate opacity and position
        message.opacity = 1 - (elapsed / 2000);
        message.y -= 0.5; // Float upward
    }
    
    // Draw everything
    drawBackground();
    drawObstacles();
    drawPlayer();
    drawMessages();
    drawScore();
    drawTransformationProgress();
}

function drawMessages() {
    for (let message of activeMessages) {
        gameContext.save();
        gameContext.fillStyle = `rgba(0, 0, 0, ${message.opacity})`;
        gameContext.font = "bold 16px Arial";
        gameContext.textAlign = "center";
        gameContext.fillText(message.text, message.x, message.y);
        gameContext.restore();
    }
}

// Find the x-position of the farthest obstacle
function findFarthestObstacle() {
    let farthest = 0;
    for (let obstacle of obstacles) {
        if (obstacle.x > farthest) {
            farthest = obstacle.x;
        }
    }
    return farthest;
}

function drawBackground() {
    // White background
    gameContext.fillStyle = "#ffffff";
    gameContext.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw ground - black line
    gameContext.fillStyle = "#000000";
    gameContext.fillRect(0, canvasHeight - groundHeight, canvasWidth, groundHeight);
}

function drawPlayer() {
    gameContext.save();
    gameContext.translate(player.x + player.width / 2, player.y + player.height / 2);
    
    // When transformation reaches 100%, trigger animation if not already animating
    if (transformationProgress >= 100 && !animatingTransformation) {
        animatingTransformation = true;
        lastTransformationTime = Date.now();
    }
    
    // Normal drawing when not in final animation
    if (!animatingTransformation) {
        // Draw plus sign
        gameContext.fillStyle = "#000";
        gameContext.fillRect(-player.width * 0.1, -player.height * 0.4, player.width * 0.2, player.height * 0.8);
        gameContext.fillRect(-player.width * 0.4, -player.height * 0.1, player.width * 0.8, player.height * 0.2);
        
        // Add partial equals sign based on transformation progress
        if (transformationProgress > 0) {
            const partialWidth = (player.width * 0.8) * (transformationProgress / 100);
            gameContext.fillStyle = "rgba(0, 0, 0, 0.5)";
            gameContext.fillRect(-player.width * 0.4, player.height * 0.2, partialWidth, player.height * 0.1);
        }
    } else {
        // Final animation (+ to =)
        const elapsed = Date.now() - lastTransformationTime;
        const duration = 2000; // 2 seconds for full animation
        transformationAnimationProgress = Math.min(elapsed / duration, 1);
        
        // Shrinking vertical bar
        const verticalHeight = player.height * 0.8 * (1 - transformationAnimationProgress);
        gameContext.fillStyle = "#000";
        gameContext.fillRect(-player.width * 0.1, -verticalHeight/2, player.width * 0.2, verticalHeight);
        
        // Horizontal bars
        gameContext.fillRect(-player.width * 0.4, -player.height * 0.2, player.width * 0.8, player.height * 0.15);
        
        // Second horizontal (equals) bar growing
        const bottomBarHeight = player.height * 0.15;
        const bottomBarY = player.height * 0.05;
        gameContext.fillRect(-player.width * 0.4, bottomBarY, player.width * 0.8, bottomBarHeight);
        
        // If animation complete, trigger win
        if (transformationAnimationProgress >= 1 && gameActive) {
            setTimeout(() => winGame(), 500);
        }
    }
    
    gameContext.restore();
}

function drawObstacles() {
    gameContext.fillStyle = "#000000"; // Black obstacles
    for (let obstacle of obstacles) {
        gameContext.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

function drawScore() {
    gameContext.fillStyle = "#000";
    gameContext.font = "16px Arial";
    gameContext.textAlign = "left";
    gameContext.fillText(`Obstacles Passed: ${gameScore}`, 20, 30);
}

function drawTransformationProgress() {
    // Progress bar outline
    gameContext.strokeStyle = "#000";
    gameContext.strokeRect(20, 40, 100, 10);
    
    // Progress bar fill
    gameContext.fillStyle = "#000";
    gameContext.fillRect(20, 40, transformationProgress, 10);
    
    // Progress label
    gameContext.fillStyle = "#000";
    gameContext.font = "12px Arial";
    gameContext.fillText("Transformation", 20, 65);
}

function playerJump() {
    if (!player.jumping) {
        player.jumping = true;
        player.velocity = -10;
    }
}

function gameOver() {
    gameActive = false;
    clearInterval(gameInterval);
    
    // Semi-transparent gray overlay
    gameContext.fillStyle = "rgba(0,0,0,0.1)";
    gameContext.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Game over text
    gameContext.fillStyle = "#000";
    gameContext.font = "24px Arial";
    gameContext.textAlign = "center";
    gameContext.fillText("Game Over!", canvasWidth / 2, canvasHeight / 2);
    gameContext.font = "16px Arial";
    gameContext.fillText("Click 'Reset' to try again", canvasWidth / 2, canvasHeight / 2 + 30);
    
    // Reset button text
    startGameBtn.innerText = "Start Game";
}

function winGame() {
    gameActive = false;
    clearInterval(gameInterval);
    
    // Semi-transparent gray overlay
    gameContext.fillStyle = "rgba(0,0,0,0.1)";
    gameContext.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Win text
    gameContext.fillStyle = "#000";
    gameContext.font = "24px Arial";
    gameContext.textAlign = "center";
    gameContext.fillText("Transformation Complete!", canvasWidth / 2, canvasHeight / 2);
    gameContext.font = "16px Arial";
    gameContext.fillText("From Complex (+) to Simple (=)", canvasWidth / 2, canvasHeight / 2 + 30);
}