/**
 * Combat system for Cosmic Voyager
 */

class CombatSystem {
    constructor(game) {
        this.game = game;
        this.inCombat = false;
        this.enemies = [];
        this.projectiles = [];
        this.lastEnemySpawn = 0;
        this.spawnRate = 5000; // ms between enemy spawns
        this.waveSize = 3; // enemies per wave
        this.wavesCleared = 0;
        this.lastPlayerCollision = 0;
        this.collisionCooldown = 1000; // 1 second cooldown
        this.spawnTimer = 0;
        this.maxEnemies = 10;
        this.spawnInterval = 2000; // 2 seconds
        this.currentWave = 0;
        
        // Simple error logging
        this.handleError = (msg, url, line) => {
            console.error('Game Error:', {
                message: msg,
                url: url,
                line: line,
                timestamp: new Date().toISOString()
            });
            return false; // Let other error handlers run
        };
    }
    
    startCombat(enemyCount = null) {
        this.inCombat = true;
        this.currentWave = 1;
        
        // Get wave settings from current difficulty
        const settings = this.game.difficultySettings[this.game.currentDifficulty].waveSettings;
        
        // Use provided enemy count or initial enemies from settings
        const initialEnemies = enemyCount || settings.initialEnemies;
        
        console.log(`Starting Wave ${this.currentWave} with ${initialEnemies} enemies`);
        this.spawnWave(this.currentWave);
        
        // Reset the last spawn time to ensure continuous spawning
        this.lastEnemySpawn = Date.now();
    }
    
    endCombat() {
        this.inCombat = false;
        this.enemies = [];
        this.projectiles = [];
    }
    
    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            this.spawnEnemy();
        }
    }
    
    spawnEnemy() {
        // Determine enemy type based on waves cleared
        let type = 'scout';
        const rand = Math.random();
        
        if (this.wavesCleared >= 5) {
            if (rand < 0.1) {
                type = 'battleship';
            } else if (rand < 0.4) {
                type = 'fighter';
            }
        } else if (this.wavesCleared >= 2) {
            if (rand < 0.3) {
                type = 'fighter';
            }
        }
        
        // Spawn enemy at random edge of the screen
        let x, y;
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        
        switch (side) {
            case 0: // top
                x = Math.random() * this.game.width;
                y = -50;
                break;
            case 1: // right
                x = this.game.width + 50;
                y = Math.random() * this.game.height;
                break;
            case 2: // bottom
                x = Math.random() * this.game.width;
                y = this.game.height + 50;
                break;
            case 3: // left
                x = -50;
                y = Math.random() * this.game.height;
                break;
        }
        
        console.log(`Spawning ${type} alien at position (${x}, ${y})`);
        const enemy = new AlienShip(x, y, type, this.game);
        
        // Set initial shooting delay
        enemy.shootDelay = 2000 + Math.random() * 2000; // 2-4 seconds
        enemy.lastShot = Date.now();
        
        this.enemies.push(enemy);
        
        return enemy;
    }
    
    spawnWave(waveNumber) {
        const settings = this.game.difficultySettings[this.game.currentDifficulty].waveSettings;
        
        // Check if this is a special wave
        if (settings.specialWaves[waveNumber]) {
            const specialWave = settings.specialWaves[waveNumber];
            console.log(`Spawning special wave ${waveNumber}: ${specialWave.type}`);
            this.spawnSpecialWave(specialWave);
            return;
        }

        // Check if this is a boss wave
        if (settings.bossWaves.includes(waveNumber)) {
            console.log(`Spawning boss wave ${waveNumber}`);
            this.spawnBossWave(waveNumber);
            return;
        }

        // Regular wave
        const enemyCount = Math.min(
            settings.initialEnemies + (waveNumber - 1) * settings.enemyIncreasePerWave,
            settings.maxEnemiesPerWave
        );
        
        console.log(`Spawning regular wave ${waveNumber} with ${enemyCount} enemies`);
        this.spawnEnemies(enemyCount);
    }

    spawnSpecialWave({ type, count }) {
        switch (type) {
            case 'mixed':
                // Spawn mix of different enemy types
                for (let i = 0; i < count; i++) {
                    const types = ['scout', 'fighter', 'battleship'];
                    const randomType = types[Math.floor(Math.random() * types.length)];
                    this.spawnEnemy(randomType);
                }
                break;
            case 'elite':
                // Spawn enhanced enemies
                for (let i = 0; i < count; i++) {
                    const enemy = this.spawnEnemy('battleship');
                    enemy.health *= 1.5;
                    enemy.damage *= 1.5;
                }
                break;
            default:
                // Spawn specific type
                for (let i = 0; i < count; i++) {
                    this.spawnEnemy(type);
                }
        }
    }

    spawnBossWave(waveNumber) {
        // Spawn boss with supporting enemies
        const boss = this.spawnEnemy('battleship');
        boss.health *= 3;
        boss.damage *= 2;
        boss.scoreValue *= 5;
        boss.isBoss = true;
        
        // Spawn support enemies
        const supportCount = Math.floor(waveNumber / 2);
        for (let i = 0; i < supportCount; i++) {
            this.spawnEnemy('fighter');
        }
    }
    
    update(deltaTime) {
        if (!this.game || !this.game.player) return;
        
        // Direct check for player health
        if (this.game.player.health <= 0) {
            console.log("COMBAT SYSTEM: Player health is 0, forcing game over");
            this.game.gameOver();
            return;
        }
        
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnEnemies(1);
            this.spawnTimer = 0;
        }
        
        const now = Date.now();
        
        // Debug alien count
        if (this.enemies.length === 0) {
            console.log("No aliens present. Attempting to spawn...");
        }
        
        // Spawn enemies if needed
        if (now - this.lastEnemySpawn > this.spawnRate && this.enemies.length < this.waveSize) {
            console.log(`Spawning new alien. Current count: ${this.enemies.length}, Wave size: ${this.waveSize}`);
            this.spawnEnemy();
            this.lastEnemySpawn = now;
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Update enemy position
            enemy.update(deltaTime);
            
            // Check if enemy is out of bounds
            if (enemy.x < -100 || enemy.x > this.game.width + 100 ||
                enemy.y < -100 || enemy.y > this.game.height + 100) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (this.game.player && checkCollision(enemy, this.game.player)) {
                // Only apply damage if not in cooldown
                if (Date.now() - this.lastPlayerCollision > this.collisionCooldown) {
                    this.lastPlayerCollision = Date.now();
                    
                    // Player takes damage from collision
                    const collisionDamage = 20;
                    const isDead = this.game.player.takeDamage(collisionDamage);
                    
                    // Create collision effect
                    createParticleEffect(
                        this.game.player.x + this.game.player.width / 2,
                        this.game.player.y + this.game.player.height / 2,
                        20,
                        { r: 255, g: 100, b: 100 },
                        3,
                        30,
                        this.game.ctx
                    );
                    
                    // Check if player is dead
                    if (isDead) {
                        console.log("Player died from collision with alien ship");
                        this.game.gameOver();
                        return;
                    }
                    
                    // Apply knockback to both ships
                    const knockbackForce = 200;
                    const dx = this.game.player.x - enemy.x;
                    const dy = this.game.player.y - enemy.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const nx = dx / dist;
                    const ny = dy / dist;
                    
                    this.game.player.velocity.x = nx * knockbackForce;
                    this.game.player.velocity.y = ny * knockbackForce;
                    enemy.velocity.x = -nx * knockbackForce;
                    enemy.velocity.y = -ny * knockbackForce;
                }
            }
            
            // Enemy shooting
            if (now - enemy.lastShot > enemy.shootDelay) {
                enemy.lastShot = now;
                
                // Only shoot if player is in range and in front of the enemy
                if (this.game.player) {
                    const dx = this.game.player.x - enemy.x;
                    const dy = this.game.player.y - enemy.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 500) { // Only shoot if within range
                        const projectile = enemy.shoot(
                            this.game.player.x + this.game.player.width / 2,
                            this.game.player.y + this.game.player.height / 2
                        );
                        
                        if (projectile) {
                            this.projectiles.push(projectile);
                        }
                    }
                }
            }
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Update projectile position
            const isExpired = projectile.update(deltaTime);
            
            // Remove if expired or out of bounds
            if (isExpired || 
                projectile.x < 0 || projectile.x > this.game.width ||
                projectile.y < 0 || projectile.y > this.game.height) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (!projectile.isPlayerProjectile && this.game.player && 
                checkCollision(projectile, this.game.player)) {
                // Player takes damage
                const isDead = this.game.player.takeDamage(projectile.damage);
                
                if (isDead) {
                    this.game.gameOver();
                }
                
                // Create particle effect at collision point
                createParticleEffect(
                    projectile.x,
                    projectile.y,
                    10,
                    { r: 255, g: 100, b: 100 },
                    2,
                    20,
                    this.game.ctx
                );
                
                // Remove projectile
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Check collision with enemies
            if (projectile.isPlayerProjectile) {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    
                    if (checkCollision(projectile, enemy)) {
                        // Enemy takes damage
                        const isDestroyed = enemy.takeDamage(projectile.damage);
                        
                        if (isDestroyed) {
                            // Add resources (rounded to 2 decimal places)
                            this.game.resources = Math.round(this.game.resources + enemy.scoreValue / 10);
                            document.getElementById('resource-count').textContent = this.game.resources;
                            
                            // Update score and aliens defeated count
                            this.game.score = Math.round(this.game.score + enemy.scoreValue);
                            this.game.aliensDefeated++;
                            
                            // Create explosion effect
                            createParticleEffect(
                                enemy.x + enemy.width / 2,
                                enemy.y + enemy.height / 2,
                                30,
                                { r: 255, g: 200, b: 100 },
                                4,
                                40,
                                this.game.ctx
                            );
                            
                            // Remove enemy
                            this.enemies.splice(j, 1);
                            
                            // Chance to spawn resource
                            if (Math.random() < 0.3) {
                                const resourceTypes = ['metal', 'crystal', 'fuel'];
                                const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
                                
                                const resource = new Resource(
                                    enemy.x + enemy.width / 2 - 7.5,
                                    enemy.y + enemy.height / 2 - 7.5,
                                    resourceType
                                );
                                
                                this.game.resources_.push(resource);
                            }
                        } else {
                            // Create hit effect
                            createParticleEffect(
                                projectile.x,
                                projectile.y,
                                10,
                                { r: 255, g: 200, b: 100 },
                                2,
                                20,
                                this.game.ctx
                            );
                        }
                        
                        // Remove projectile
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
        
        // Check for wave completion
        if (this.enemies.length === 0) {
            this.currentWave++;
            this.wavesCleared++;
            
            const settings = this.game.difficultySettings[this.game.currentDifficulty];
            
            // Check for victory
            if (this.currentWave > settings.victoryWaves) {
                this.game.victory();
                return;
            }
            
            // Spawn next wave
            console.log(`Starting Wave ${this.currentWave}`);
            this.spawnWave(this.currentWave);
        }
    }
    
    draw(ctx) {
        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
        
        // Draw projectiles
        for (const projectile of this.projectiles) {
            projectile.draw(ctx);
        }
    }
    
    playerShoot() {
        if (!this.game.player) return;
        
        console.log("Combat system: playerShoot called");
        
        // Create projectile directly instead of relying on player.shoot()
        const player = this.game.player;
        const projectile = new Projectile(
            player.x + player.width / 2 + Math.cos(player.rotation) * player.width / 2,
            player.y + player.height / 2 + Math.sin(player.rotation) * player.height / 2,
            player.rotation,
            true
        );
        
        this.projectiles.push(projectile);
        
        // Create a visual effect for shooting
        createParticleEffect(
            projectile.x - Math.cos(projectile.angle) * 5,
            projectile.y - Math.sin(projectile.angle) * 5,
            10, // More particles
            { r: 100, g: 200, b: 255 },
            1,
            15, // Larger effect
            this.game.ctx
        );
        
        // Play sound effect if available
        if (typeof playSound === 'function') {
            playSound('laser');
        }
        
        console.log("Projectile created:", projectile);
        console.log("Total projectiles:", this.projectiles.length);
        
        return projectile;
    }
    
    forceGameOver() {
        if (this.game) {
            this.game.isRunning = false;
            this.game.isGameOver = true;
            
            // Cancel animation frame if it exists
            if (this.game.animationFrameId) {
                cancelAnimationFrame(this.game.animationFrameId);
            }
            
            // Calculate scores
            const timeSurvived = Math.floor((Date.now() - this.game.gameStartTime) / 1000);
            const finalScore = this.game.score + (this.game.aliensDefeated * 100) + (timeSurvived * 5) + (this.wavesCleared * 500);
            
            // Update score display
            document.getElementById('score-value').textContent = finalScore;
            document.getElementById('aliens-value').textContent = this.game.aliensDefeated;
            document.getElementById('waves-value').textContent = this.wavesCleared || 0;
            document.getElementById('time-value').textContent = timeSurvived;
            
            // Show game over screen
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            document.getElementById('game-over-screen').classList.remove('hidden');
            console.log("COMBAT SYSTEM: Forced game over screen to show");
        }
    }
}

// Add a proper state machine for game states
class GameState {
    constructor() {
        this.state = 'menu';
        this.validTransitions = {
            'menu': ['playing', 'builder'],
            'playing': ['paused', 'gameOver', 'builder'],
            'paused': ['playing', 'menu'],
            'builder': ['playing'],
            'gameOver': ['menu', 'playing']
        };
    }

    transition(newState) {
        if (this.validTransitions[this.state].includes(newState)) {
            this.state = newState;
            gameEvents.emit('stateChange', newState);
        }
    }
}
