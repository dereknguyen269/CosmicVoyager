/**
 * Main game class for Cosmic Voyager
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.resources = 100;
        this.resources_ = []; // Resource objects in the game world
        
        // Score tracking
        this.score = 0;
        this.aliensDefeated = 0;
        this.gameStartTime = 0;
        
        // Input handling
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false,
            interact: false,
            build: false
        };
        
        // Game objects
        this.player = new PlayerShip(this.width / 2, this.height / 2);
        this.player.game = this; // Add reference to game object
        this.stars = []; // Background stars
        
        // Initialize difficulty settings
        this.difficultySettings = {
            easy: {
                enemyDamage: 0.7,
                enemyHealth: 0.8,
                enemySpeed: 0.8,
                spawnRate: 1.5,
                resourceMultiplier: 1.5,
                playerHealth: 120,
                victoryWaves: 5,  // Shorter game for easy mode
                waveSettings: {
                    initialEnemies: 2,
                    maxEnemiesPerWave: 6,
                    enemyIncreasePerWave: 1,
                    bossWaves: [5],  // Boss appears on final wave
                    specialWaves: {
                        2: { type: 'scout', count: 4 },
                        3: { type: 'fighter', count: 2 },
                        4: { type: 'mixed', count: 4 }
                    }
                }
            },
            normal: {
                enemyDamage: 1.0,
                enemyHealth: 1.0,
                enemySpeed: 1.0,
                spawnRate: 1.0,
                resourceMultiplier: 1.0,
                playerHealth: 100,
                victoryWaves: 8,
                waveSettings: {
                    initialEnemies: 3,
                    maxEnemiesPerWave: 8,
                    enemyIncreasePerWave: 1,
                    bossWaves: [4, 8],  // Bosses appear twice
                    specialWaves: {
                        3: { type: 'fighter', count: 3 },
                        5: { type: 'mixed', count: 5 },
                        6: { type: 'battleship', count: 1 }
                    }
                }
            },
            hard: {
                enemyDamage: 1.3,
                enemyHealth: 1.2,
                enemySpeed: 1.2,
                spawnRate: 0.8,
                resourceMultiplier: 0.8,
                playerHealth: 80,
                victoryWaves: 10,
                waveSettings: {
                    initialEnemies: 4,
                    maxEnemiesPerWave: 10,
                    enemyIncreasePerWave: 2,
                    bossWaves: [5, 8, 10],  // More boss encounters
                    specialWaves: {
                        3: { type: 'fighter', count: 4 },
                        4: { type: 'battleship', count: 2 },
                        6: { type: 'mixed', count: 6 },
                        7: { type: 'elite', count: 1 }
                    }
                }
            },
            veryHard: {
                enemyDamage: 1.5,
                enemyHealth: 1.5,
                enemySpeed: 1.4,
                spawnRate: 0.6,
                resourceMultiplier: 0.6,
                playerHealth: 60,
                victoryWaves: 12,
                waveSettings: {
                    initialEnemies: 5,
                    maxEnemiesPerWave: 12,
                    enemyIncreasePerWave: 2,
                    bossWaves: [4, 7, 10, 12],  // Many boss encounters
                    specialWaves: {
                        2: { type: 'fighter', count: 5 },
                        3: { type: 'battleship', count: 3 },
                        5: { type: 'mixed', count: 8 },
                        6: { type: 'elite', count: 2 },
                        8: { type: 'megaboss', count: 1 }
                    }
                }
            }
        };

        this.currentDifficulty = 'easy';
        
        // Then initialize game systems
        this.combatSystem = new CombatSystem(this);
        this.planetSystem = new PlanetSystem(this);
        this.shipBuilder = new ShipBuilder(this);
        
        // Animation frame and timing
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        
        // Add victory conditions
        this.victoryWaves = 10; // Win after clearing 10 waves
        this.victoryScore = 10000; // Win after reaching 10,000 points
        this.isVictory = false;
        
        // Initialize the game
        this.init();
        
        // Bind the gameOver method to ensure correct 'this' context
        this.gameOver = this.gameOver.bind(this);
    }
    
    init() {
        // Initialize player
        this.player = new PlayerShip(this.width / 2, this.height / 2);
        
        // Generate stars
        this.generateStars(200);
        
        // Generate planets
        this.planetSystem.generatePlanets(8);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize planet system event listeners
        this.planetSystem.initEventListeners();
        
        // Set combat system to active
        this.combatSystem.inCombat = true;
        
        // Update UI
        document.getElementById('resource-count').textContent = this.resources;
        document.getElementById('health-value').textContent = this.player.health;
        document.getElementById('current-location').textContent = 'Home Base';
        
        // Add direct click handlers for testing
        this.addClickHandlers();
        
        // Create debug overlay
        this.createDebugOverlay();
        
        // Start menu
        showScreen('menu-screen');
    }
    
    createDebugOverlay() {
        // Create debug overlay container
        const debugOverlay = document.createElement('div');
        debugOverlay.id = 'debug-overlay';
        debugOverlay.style.position = 'absolute';
        debugOverlay.style.top = '10px';
        debugOverlay.style.right = '10px';
        debugOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        debugOverlay.style.color = '#fff';
        debugOverlay.style.padding = '10px';
        debugOverlay.style.borderRadius = '5px';
        debugOverlay.style.fontFamily = 'monospace';
        debugOverlay.style.fontSize = '12px';
        debugOverlay.style.zIndex = '1000';
        debugOverlay.style.maxWidth = '300px';
        debugOverlay.style.maxHeight = '200px';
        debugOverlay.style.overflow = 'auto';
        
        // Add debug info
        debugOverlay.innerHTML = `
            <h3>Debug Info</h3>
            <div id="debug-keys">Keys: -</div>
            <div id="debug-projectiles">Projectiles: 0</div>
            <div id="debug-enemies">Enemies: 0</div>
            <div id="debug-fps">FPS: 0</div>
            <div id="debug-status">Game Status: Not Running</div>
            <button id="debug-shoot" style="margin-top: 10px; padding: 5px;">Force Shoot</button>
        `;
        
        document.getElementById('game-screen').appendChild(debugOverlay);
        
        // Add force shoot button event listener
        document.getElementById('debug-shoot').addEventListener('click', () => {
            if (this.player && this.combatSystem) {
                this.combatSystem.playerShoot();
            }
        });
        
        // Update debug info every frame
        this.updateDebugInfo = true;
    }
    
    updateDebugOverlay() {
        if (!this.updateDebugInfo) return;
        
        // Update key states
        document.getElementById('debug-keys').textContent = `Keys: ${JSON.stringify(this.keys)}`;
        
        // Update projectile count
        document.getElementById('debug-projectiles').textContent = `Projectiles: ${this.combatSystem.projectiles.length}`;
        
        // Update enemy count
        document.getElementById('debug-enemies').textContent = `Enemies: ${this.combatSystem.enemies.length}`;
        
        // Update FPS
        const fps = Math.round(1 / (performance.now() - this.lastFrameTime) * 1000);
        document.getElementById('debug-fps').textContent = `FPS: ${fps}`;
        
        // Update game status
        let status = 'Not Running';
        if (this.isRunning) {
            status = this.isPaused ? 'Paused' : 'Running';
        }
        document.getElementById('debug-status').textContent = `Game Status: ${status}`;
    }
    
    addClickHandlers() {
        // Add on-screen buttons for mobile/testing
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'mobile-controls';
        controlsDiv.style.position = 'absolute';
        controlsDiv.style.bottom = '20px';
        controlsDiv.style.left = '20px';
        controlsDiv.style.zIndex = '1000';
        
        const moveUpBtn = document.createElement('button');
        moveUpBtn.textContent = '↑';
        moveUpBtn.style.width = '50px';
        moveUpBtn.style.height = '50px';
        moveUpBtn.style.margin = '5px';
        moveUpBtn.style.fontSize = '24px';
        moveUpBtn.addEventListener('mousedown', () => { this.keys.up = true; });
        moveUpBtn.addEventListener('mouseup', () => { this.keys.up = false; });
        moveUpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.up = true; });
        moveUpBtn.addEventListener('touchend', () => { this.keys.up = false; });
        
        const moveLeftBtn = document.createElement('button');
        moveLeftBtn.textContent = '←';
        moveLeftBtn.style.width = '50px';
        moveLeftBtn.style.height = '50px';
        moveLeftBtn.style.margin = '5px';
        moveLeftBtn.style.fontSize = '24px';
        moveLeftBtn.addEventListener('mousedown', () => { this.keys.left = true; });
        moveLeftBtn.addEventListener('mouseup', () => { this.keys.left = false; });
        moveLeftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.left = true; });
        moveLeftBtn.addEventListener('touchend', () => { this.keys.left = false; });
        
        const moveRightBtn = document.createElement('button');
        moveRightBtn.textContent = '→';
        moveRightBtn.style.width = '50px';
        moveRightBtn.style.height = '50px';
        moveRightBtn.style.margin = '5px';
        moveRightBtn.style.fontSize = '24px';
        moveRightBtn.addEventListener('mousedown', () => { this.keys.right = true; });
        moveRightBtn.addEventListener('mouseup', () => { this.keys.right = false; });
        moveRightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.right = true; });
        moveRightBtn.addEventListener('touchend', () => { this.keys.right = false; });
        
        const shootBtn = document.createElement('button');
        shootBtn.textContent = 'SHOOT';
        shootBtn.style.width = '100px';
        shootBtn.style.height = '50px';
        shootBtn.style.margin = '5px';
        shootBtn.style.backgroundColor = '#ff4444';
        shootBtn.addEventListener('click', () => { this.combatSystem.playerShoot(); });
        
        controlsDiv.appendChild(moveLeftBtn);
        controlsDiv.appendChild(moveUpBtn);
        controlsDiv.appendChild(moveRightBtn);
        controlsDiv.appendChild(shootBtn);
        
        document.getElementById('game-screen').appendChild(controlsDiv);
    }
    
    generateStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.5 + 0.5,
                brightness: Math.random() * 0.5 + 0.5,
                speed: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    setupEventListeners() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        window.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Start button
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });
        
        // Log that event listeners are set up
        console.log("Event listeners set up");
    }
    
    handleKeyDown(e) {
        // Use event.code instead of event.key for more reliable detection
        console.log("Key down:", e.code);
        
        // Prevent default behavior for game controls
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.up = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.down = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.shoot = true;
                // Immediately shoot when space is pressed (for responsiveness)
                if (this.isRunning && !this.isPaused && this.player) {
                    const now = Date.now();
                    if (now - this.player.lastShot > 1000 / this.player.fireRate) {
                        this.player.lastShot = now;
                        this.combatSystem.playerShoot();
                        console.log("Shooting triggered by Space key!");
                    }
                }
                break;
            case 'KeyE':
                this.keys.interact = true;
                this.handleInteraction();
                break;
            case 'KeyB':
                this.keys.build = true;
                console.log("B key pressed - Opening ship builder");
                if (this.isRunning && !this.isGameOver) {
                    this.openShipBuilder();
                }
                break;
            case 'Escape':
                this.togglePause();
                break;
            case 'KeyG':
                if (e.ctrlKey) {
                    console.log("Forcing Game Over screen with keyboard shortcut");
                    this.forceGameOver();
                }
                break;
        }
    }
    
    handleKeyUp(e) {
        // Use event.code instead of event.key for more reliable detection
        console.log("Key up:", e.code);
        
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.up = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.shoot = false;
                break;
            case 'KeyE':
                this.keys.interact = false;
                break;
            case 'KeyB':
                this.keys.build = false;
                break;
        }
    }
    
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    handleInteraction() {
        if (!this.player) return;
        
        // Check if near a planet
        const planet = this.planetSystem.checkPlanetCollision(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2
        );
        
        if (planet) {
            // Enter planet
            this.pauseGame();
            this.planetSystem.enterPlanet(planet);
            document.getElementById('current-location').textContent = planet.name;
        }
    }
    
    startGame() {
        console.log("Starting game on " + this.currentDifficulty + " difficulty");
        
        try {
            // Validate difficulty settings exist
            if (!this.difficultySettings[this.currentDifficulty]) {
                throw new Error(`Invalid difficulty: ${this.currentDifficulty}`);
            }
            
            // Reset the game state
            this.reset();
            
            // Set game running
            this.isRunning = true;
            this.isPaused = false;
            this.isGameOver = false;
            
            // Record start time for score tracking
            this.gameStartTime = Date.now();
            
            // Initialize player with difficulty settings
            const settings = this.difficultySettings[this.currentDifficulty];
            this.player = new PlayerShip(this.width / 2, this.height / 2);
            this.player.game = this;
            this.player.maxHealth = settings.playerHealth;
            this.player.health = settings.playerHealth;
            
            // Update UI
            document.getElementById('resource-count').textContent = this.resources;
            document.getElementById('health-value').textContent = this.player.health;
            document.getElementById('current-location').textContent = 'Home Base';
            
            // Add difficulty indicator
            this.updateDifficultyUI();
            
            // Start combat system
            if (this.combatSystem) {
                this.combatSystem.startCombat(3);
            } else {
                console.error("Combat system not initialized");
            }
            
            // Start game loop
            this.lastFrameTime = performance.now();
            this.gameLoop(this.lastFrameTime);
            
            console.log("Game started successfully");
            
        } catch (error) {
            console.error("Error starting game:", error);
        }
    }
    
    pauseGame() {
        this.isPaused = true;
        cancelAnimationFrame(this.animationFrameId);
    }
    
    resumeGame() {
        if (this.isRunning) {
            this.isPaused = false;
            this.lastFrameTime = performance.now();
            this.gameLoop(this.lastFrameTime);
        }
    }
    
    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
    
    gameOver() {
        console.log("Game over triggered!");
        
        try {
            // Stop game loop
            this.isRunning = false;
            this.isGameOver = true;
            
            // Cancel animation frame if it exists
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            // Calculate final scores
            const timeSurvived = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const finalScore = this.score + (this.aliensDefeated * 100) + (timeSurvived * 5) + (this.combatSystem.wavesCleared * 500);
            
            console.log("Final score:", finalScore);
            console.log("Aliens defeated:", this.aliensDefeated);
            
            // Update score display
            const scoreElement = document.getElementById('score-value');
            if (scoreElement) scoreElement.textContent = finalScore;
            
            const aliensElement = document.getElementById('aliens-value');
            if (aliensElement) aliensElement.textContent = this.aliensDefeated;
            
            const wavesElement = document.getElementById('waves-value');
            if (wavesElement) wavesElement.textContent = this.combatSystem.wavesCleared || 0;
            
            const timeElement = document.getElementById('time-value');
            if (timeElement) timeElement.textContent = timeSurvived;
            
            // Hide all screens first
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.classList.add('hidden');
            });
            
            // Show game over screen
            const gameOverScreen = document.getElementById('game-over-screen');
            if (gameOverScreen) {
                gameOverScreen.classList.remove('hidden');
                console.log("Game over screen should now be visible");
            } else {
                console.error("Could not find game-over-screen element");
            }
        } catch (error) {
            console.error("Error in gameOver():", error);
        }
    }
    
    forceGameOver() {
        console.log("Force Game Over triggered");
        
        // Stop game loop
        this.isRunning = false;
        this.isGameOver = true;
        cancelAnimationFrame(this.animationFrameId);
        
        // Calculate final scores
        const timeSurvived = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const finalScore = this.score + (this.aliensDefeated * 100) + (timeSurvived * 5) + (this.combatSystem.wavesCleared * 500);
        
        console.log("Final score:", finalScore);
        console.log("Aliens defeated:", this.aliensDefeated);
        
        try {
            // Update score display
            document.getElementById('score-value').textContent = finalScore;
            document.getElementById('aliens-value').textContent = this.aliensDefeated;
            document.getElementById('waves-value').textContent = this.combatSystem.wavesCleared || 0;
            document.getElementById('time-value').textContent = timeSurvived;
            
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            // Show game over screen
            document.getElementById('game-over-screen').classList.remove('hidden');
            console.log("Game over screen should be visible now");
        } catch (error) {
            console.error("Error showing game over screen:", error);
        }
    }
    
    reset() {
        console.log("Resetting game state...");
        
        try {
            // Reset game state
            this.isRunning = false;
            this.isPaused = false;
            this.isGameOver = false;
            this.resources = Math.round(100);
            this.resources_ = [];
            this.score = 0;
            this.aliensDefeated = 0;
            
            // Reset player
            this.player = new PlayerShip(this.width / 2, this.height / 2);
            this.player.game = this; // Add reference to game object
            
            // Reset combat system
            if (this.combatSystem) {
                this.combatSystem.endCombat();
            }
            
            // Reset planet system
            if (this.planetSystem) {
                this.planetSystem.generatePlanets(8);
            }
            
            // Update UI
            document.getElementById('resource-count').textContent = this.resources;
            document.getElementById('health-value').textContent = this.player.health;
            document.getElementById('current-location').textContent = 'Home Base';
            
            console.log("Game reset complete");
            
        } catch (error) {
            console.error("Error resetting game:", error);
        }
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning || this.isPaused) {
            console.log("Game loop stopped", this.isRunning, this.isPaused);
            return;
        }
        
        // Calculate delta time
        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        // Update and draw game objects
        this.update(deltaTime);
        this.draw();
        
        // Request next frame
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(deltaTime) {
        // Skip update if game is over
        if (this.isGameOver) return;
        
        // Check if player health is 0
        if (this.player && this.player.health <= 0 && !this.isGameOver) {
            console.log("Player health is 0, triggering game over");
            this.gameOver();
            return;
        }
        
        // Update stars
        this.updateStars(deltaTime);
        
        // Update player
        if (this.player) {
            // Directly handle movement here instead of relying on the player's update method
            if (this.keys.up) {
                this.player.velocity.x = Math.cos(this.player.rotation) * this.player.speed;
                this.player.velocity.y = Math.sin(this.player.rotation) * this.player.speed;
            } else if (this.keys.down) {
                this.player.velocity.x = -Math.cos(this.player.rotation) * this.player.speed / 2;
                this.player.velocity.y = -Math.sin(this.player.rotation) * this.player.speed / 2;
            } else {
                // Add some friction to stop the ship when not pressing movement keys
                this.player.velocity.x *= 0.95;
                this.player.velocity.y *= 0.95;
            }
            
            // Handle rotation
            if (this.keys.left) this.player.rotation -= this.player.rotationSpeed * deltaTime;
            if (this.keys.right) this.player.rotation += this.player.rotationSpeed * deltaTime;
            
            // Apply velocity
            this.player.x += this.player.velocity.x * deltaTime;
            this.player.y += this.player.velocity.y * deltaTime;
            
            // Keep player within bounds
            if (this.player.x < 0) this.player.x = 0;
            if (this.player.y < 0) this.player.y = 0;
            if (this.player.x + this.player.width > this.width) {
                this.player.x = this.width - this.player.width;
            }
            if (this.player.y + this.player.height > this.height) {
                this.player.y = this.height - this.player.height;
            }
            
            // Handle continuous shooting with a cooldown (for held spacebar)
            if (this.keys.shoot && !this.isPaused) {
                const now = Date.now();
                if (now - this.player.lastShot > 1000 / this.player.fireRate) {
                    this.player.lastShot = now;
                    this.combatSystem.playerShoot();
                    console.log("Shooting triggered by continuous fire!");
                }
            }
        }
        
        // Update combat system
        this.combatSystem.update(deltaTime);
        
        // Update resources
        this.updateResources(deltaTime);
        
        // Check for victory conditions
        if (!this.isGameOver && !this.isVictory) {
            this.checkVictoryConditions();
        }
    }
    
    updateStars(deltaTime) {
        for (const star of this.stars) {
            // Move stars based on player movement to create parallax effect
            if (this.player) {
                if (this.keys.up) {
                    star.y += star.speed * deltaTime * 50;
                }
                if (this.keys.down) {
                    star.y -= star.speed * deltaTime * 25;
                }
                if (this.keys.left) {
                    star.x += star.speed * deltaTime * 50;
                }
                if (this.keys.right) {
                    star.x -= star.speed * deltaTime * 50;
                }
            }
            
            // Wrap stars around screen
            if (star.x < 0) star.x = this.width;
            if (star.x > this.width) star.x = 0;
            if (star.y < 0) star.y = this.height;
            if (star.y > this.height) star.y = 0;
        }
    }
    
    updateResources(deltaTime) {
        for (let i = this.resources_.length - 1; i >= 0; i--) {
            const resource = this.resources_[i];
            
            // Update resource
            resource.update(deltaTime);
            
            // Check if player collected resource
            if (this.player && checkCollision(resource, this.player)) {
                // Add resource value
                this.resources += resource.value;
                document.getElementById('resource-count').textContent = this.resources;
                
                // Remove resource
                this.resources_.splice(i, 1);
                
                // Create collection effect
                createParticleEffect(
                    resource.x + resource.width / 2,
                    resource.y + resource.height / 2,
                    10,
                    { r: 255, g: 255, b: 255 },
                    2,
                    20,
                    this.ctx
                );
            }
        }
    }
    
    draw() {
        // Draw background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw planets
        this.planetSystem.drawPlanets(this.ctx);
        
        // Draw resources
        for (const resource of this.resources_) {
            resource.draw(this.ctx);
        }
        
        // Draw combat elements
        this.combatSystem.draw(this.ctx);
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        // Draw controls hint
        if (this.isRunning && !this.isPaused) {
            this.drawControlsHint();
        }
        
        // Update debug overlay
        this.updateDebugOverlay();
    }
    
    drawStars() {
        for (const star of this.stars) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawControlsHint() {
        // Only show for the first 10 seconds
        if (Date.now() - this.lastFrameTime < 10000) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.width - 250, this.height - 150, 240, 140);
            this.ctx.strokeStyle = '#4a4a8a';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.width - 250, this.height - 150, 240, 140);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('Controls:', this.width - 230, this.height - 125);
            this.ctx.fillText('WASD / Arrows: Move', this.width - 230, this.height - 100);
            this.ctx.fillText('Space: Shoot', this.width - 230, this.height - 75);
            this.ctx.fillText('E: Interact with planets', this.width - 230, this.height - 50);
            this.ctx.fillText('B: Open ship builder', this.width - 230, this.height - 25);
        }
    }
    
    spawnEnemies(count) {
        this.combatSystem.spawnEnemies(count);
    }
    
    openShipBuilder() {
        console.log("Game.openShipBuilder called");
        
        // Pause the game
        this.pauseGame();
        
        // Hide game screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show builder screen
        document.getElementById('builder-screen').classList.remove('hidden');
        
        // Update ship preview
        if (this.shipBuilder) {
            this.shipBuilder.open();
        } else {
            console.error("Ship builder not initialized!");
            // Try to initialize it now
            this.shipBuilder = new ShipBuilder(this);
            this.shipBuilder.open();
        }
    }

    checkVictoryConditions() {
        if (this.combatSystem.wavesCleared >= this.victoryWaves || 
            this.score >= this.victoryScore) {
            this.victory();
            return true;
        }
        return false;
    }

    victory() {
        console.log("Victory achieved!");
        
        try {
            // Stop game loop
            this.isRunning = false;
            this.isVictory = true;
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            // Calculate final scores
            const timeSurvived = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const finalScore = this.score + (this.aliensDefeated * 100) + 
                             (timeSurvived * 5) + (this.combatSystem.wavesCleared * 500);
            
            // Update victory screen
            document.getElementById('victory-score-value').textContent = finalScore;
            document.getElementById('victory-aliens-value').textContent = this.aliensDefeated;
            document.getElementById('victory-waves-value').textContent = this.combatSystem.wavesCleared;
            document.getElementById('victory-time-value').textContent = timeSurvived;
            
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            // Show victory screen
            document.getElementById('victory-screen').classList.remove('hidden');
            
            // Play victory sound if available
            if (typeof playSound === 'function') {
                playSound('victory');
            }
            
        } catch (error) {
            console.error("Error in victory():", error);
        }
    }

    setDifficulty(difficulty) {
        console.log('Setting difficulty:', difficulty);
        
        // Validate difficulty exists
        if (!this.difficultySettings[difficulty]) {
            console.error('Invalid difficulty:', difficulty, 'Available difficulties:', Object.keys(this.difficultySettings));
            // Fall back to normal if invalid difficulty
            difficulty = 'normal';
        }
        
        this.currentDifficulty = difficulty;
        const settings = this.difficultySettings[difficulty];
        
        // Store settings for use when game starts
        this.currentSettings = settings;
        
        console.log('Difficulty set to:', difficulty, 'with settings:', settings);
    }

    updateDifficultyUI() {
        // Remove existing difficulty indicator if any
        const existingIndicator = document.querySelector('.difficulty-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create new difficulty indicator
        const indicator = document.createElement('div');
        indicator.className = 'difficulty-indicator';
        indicator.textContent = `Difficulty: ${this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1)}`;
        document.getElementById('game-screen').appendChild(indicator);
    }

    addResources(amount) {
        this.resources = Math.round(this.resources + amount);
        document.getElementById('resource-count').textContent = this.resources;
    }

    removeResources(amount) {
        this.resources = Math.round(Math.max(0, this.resources - amount));
        document.getElementById('resource-count').textContent = this.resources;
    }

    updateHUD() {
        document.getElementById('resource-count').textContent = this.resources;
        document.getElementById('health-value').textContent = this.player.health;
        
        // Add wave counter
        const waveInfo = `Wave ${this.combatSystem.currentWave}/${this.difficultySettings[this.currentDifficulty].victoryWaves}`;
        document.getElementById('wave-counter').textContent = waveInfo;
    }
}
