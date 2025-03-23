/**
 * Game entities for Cosmic Voyager
 */

// Base Entity class
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.rotation = 0;
    }

    update(deltaTime) {
        // Apply acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // Apply velocity
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

// Player's spaceship
class PlayerShip extends Entity {
    constructor(x, y) {
        super(x, y, 50, 30);
        this.color = '#4488ff';
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 200;
        this.rotationSpeed = 5; 
        this.fireRate = 3; // shots per second
        this.lastShot = 0;
        this.parts = {
            engine: { level: 1, maxLevel: 3 },
            weapons: { level: 1, maxLevel: 3 },
            shield: { level: 1, maxLevel: 3 },
            hull: { level: 1, maxLevel: 3 }
        };
    }

    update(deltaTime, keys) {
        // Handle rotation
        if (keys.left) this.rotation -= this.rotationSpeed * deltaTime;
        if (keys.right) this.rotation += this.rotationSpeed * deltaTime;
        
        // Handle movement
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        if (keys.up) {
            this.velocity.x = Math.cos(this.rotation) * this.speed;
            this.velocity.y = Math.sin(this.rotation) * this.speed;
        }
        
        if (keys.down) {
            this.velocity.x = -Math.cos(this.rotation) * this.speed / 2;
            this.velocity.y = -Math.sin(this.rotation) * this.speed / 2;
        }
        
        super.update(deltaTime);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Draw ship body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(-this.width / 3, 0);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        // Draw direction indicator
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.width / 2 - 5, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw engine glow
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            ctx.fillStyle = '#ff9900';
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, -this.height / 4);
            ctx.lineTo(-this.width / 2 - 10, 0);
            ctx.lineTo(-this.width / 2, this.height / 4);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > 1000 / this.fireRate) {
            this.lastShot = now;
            
            const projectile = new Projectile(
                this.x + this.width / 2 + Math.cos(this.rotation) * this.width / 2,
                this.y + this.height / 2 + Math.sin(this.rotation) * this.height / 2,
                this.rotation,
                true
            );
            
            return projectile;
        }
        return null;
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log("Player took damage:", amount, "Current health:", this.health);
        
        // Update health display
        const healthDisplay = document.getElementById('health-value');
        if (healthDisplay) {
            healthDisplay.textContent = Math.max(0, this.health);
        }
        
        if (this.health <= 0) {
            this.health = 0;
            console.log("Player health reached 0, triggering game over");
            
            // Make sure we have reference to game object
            if (this.game) {
                // Use setTimeout to ensure this runs after current frame
                setTimeout(() => {
                    this.game.gameOver();
                }, 0);
                return true; // Indicates player died
            } else {
                console.error("Cannot call game over: no reference to game object");
            }
        }
        return false; // Indicates player still alive
    }
    
    upgradePart(partName) {
        if (this.parts[partName]) {
            if (this.parts[partName].level < this.parts[partName].maxLevel) {
                this.parts[partName].level++;
                
                // Apply upgrades based on part type
                switch (partName) {
                    case 'engine':
                        this.speed += 50; // Increase speed
                        break;
                    case 'weapons':
                        this.fireRate += 1; // Increase fire rate
                        break;
                    case 'shield':
                        this.maxHealth += 25; // Increase max health
                        this.health = Math.min(this.health + 25, this.maxHealth); // Heal when upgrading shield
                        document.getElementById('health-value').textContent = this.health;
                        break;
                    case 'hull':
                        this.maxHealth += 50; // Increase max health even more
                        this.health = Math.min(this.health + 50, this.maxHealth); // Heal when upgrading hull
                        document.getElementById('health-value').textContent = this.health;
                        break;
                }
                
                console.log(`Upgraded ${partName} to level ${this.parts[partName].level}`);
                return true;
            }
        }
        return false;
    }

    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) this.health = this.maxHealth;
        document.getElementById('health-value').textContent = this.health;
    }
}

// Enemy alien ship
class AlienShip extends Entity {
    constructor(x, y, type = 'scout', game) {
        super(x, y, 40, 25);
        this.game = game;
        this.type = type;
        
        // Get difficulty settings
        const settings = this.game ? this.game.difficultySettings[this.game.currentDifficulty] : {
            enemyDamage: 1.0,
            enemyHealth: 1.0,
            enemySpeed: 1.0,
            resourceMultiplier: 1.0
        };
        
        // Base stats modified by type and difficulty
        if (type === 'fighter') {
            this.width = 45;
            this.height = 30;
            this.health = 50 * settings.enemyHealth;
            this.speed = 180 * settings.enemySpeed;
            this.scoreValue = Math.floor(200 * (1 / settings.resourceMultiplier));
        } else if (type === 'battleship') {
            this.width = 60;
            this.height = 40;
            this.health = 100 * settings.enemyHealth;
            this.speed = 100 * settings.enemySpeed;
            this.scoreValue = Math.floor(500 * (1 / settings.resourceMultiplier));
        } else {
            // Scout type
            this.health = 30 * settings.enemyHealth;
            this.speed = 150 * settings.enemySpeed;
            this.scoreValue = Math.floor(100 * (1 / settings.resourceMultiplier));
        }
        
        this.color = type === 'scout' ? '#ff4444' : 
                    type === 'fighter' ? '#ff8800' : '#ff00ff';
    }

    update(deltaTime) {
        // If we have a target player, move towards them
        if (this.game && this.game.player) {
            const playerX = this.game.player.x + this.game.player.width / 2;
            const playerY = this.game.player.y + this.game.player.height / 2;
            
            // Calculate angle to player
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            this.rotation = Math.atan2(dy, dx);
            
            // Move towards player
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 200) {
                this.velocity.x = Math.cos(this.rotation) * this.speed;
                this.velocity.y = Math.sin(this.rotation) * this.speed;
            } else {
                // Maintain distance for shooting
                this.velocity.x = Math.cos(this.rotation) * this.speed * 0.2;
                this.velocity.y = Math.sin(this.rotation) * this.speed * 0.2;
            }
        } else {
            // Random movement if no player
            if (Math.random() < 0.01) {
                this.velocity.x = (Math.random() - 0.5) * this.speed;
                this.velocity.y = (Math.random() - 0.5) * this.speed;
            }
        }
        
        // Add a small random movement to make ships more dynamic
        this.velocity.x += (Math.random() - 0.5) * 10;
        this.velocity.y += (Math.random() - 0.5) * 10;
        
        // Call parent update to apply velocity
        super.update(deltaTime);
    }

    shoot(targetX, targetY) {
        // Calculate angle to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        
        // Create projectile
        const projectile = new Projectile(
            this.x + this.width / 2 + Math.cos(angle) * this.width / 2,
            this.y + this.height / 2 + Math.sin(angle) * this.height / 2,
            angle,
            false // Not a player projectile
        );
        
        // Add random spread to make it less accurate
        const spread = 0.2; // radians
        projectile.angle += (Math.random() - 0.5) * spread;
        projectile.velocity.x = Math.cos(projectile.angle) * projectile.speed;
        projectile.velocity.y = Math.sin(projectile.angle) * projectile.speed;
        
        return projectile;
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}

// Projectile class for weapons
class Projectile extends Entity {
    constructor(x, y, angle, isPlayerProjectile) {
        super(x, y, 15, 6); 
        this.angle = angle;
        this.speed = 800; 
        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = Math.sin(angle) * this.speed;
        this.isPlayerProjectile = isPlayerProjectile;
        this.damage = isPlayerProjectile ? 15 : 5; 
        this.color = isPlayerProjectile ? '#88ffff' : '#ff8888';
        this.lifetime = 2000; // milliseconds
        this.born = Date.now();
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Check if projectile has expired
        if (Date.now() - this.born > this.lifetime) {
            return true; // Mark for removal
        }
        
        return false;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Add glow effect
        ctx.shadowColor = this.isPlayerProjectile ? '#00ffff' : '#ff0000';
        ctx.shadowBlur = 15;
        
        // Draw projectile with gradient
        const gradient = ctx.createLinearGradient(0, -this.height/2, this.width, this.height/2);
        if (this.isPlayerProjectile) {
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(1, '#0088ff');
        } else {
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(1, '#ff8800');
        }
        
        ctx.fillStyle = gradient;
        
        // Draw projectile body
        ctx.beginPath();
        ctx.moveTo(this.width, 0);
        ctx.lineTo(0, -this.height/2);
        ctx.lineTo(0, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Resource item that can be collected
class Resource extends Entity {
    constructor(x, y, type) {
        super(x, y, 15, 15);
        this.type = type;
        this.value = randomInt(5, 15);
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        
        // Color based on resource type
        switch (type) {
            case 'metal':
                this.color = '#aaaaaa';
                break;
            case 'crystal':
                this.color = '#88ffff';
                break;
            case 'fuel':
                this.color = '#ffaa00';
                break;
            default:
                this.color = '#ffffff';
        }
    }

    update(deltaTime) {
        this.rotation += this.rotationSpeed * deltaTime;
        super.update(deltaTime);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.color;
        
        if (this.type === 'metal') {
            // Draw metal (square)
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else if (this.type === 'crystal') {
            // Draw crystal (diamond)
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(this.width / 2, 0);
            ctx.lineTo(0, this.height / 2);
            ctx.lineTo(-this.width / 2, 0);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'fuel') {
            // Draw fuel (circle)
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
