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
        this.speed = 300;
        this.rotationSpeed = 3;
        this.rotation = 0;
        this.velocity = { x: 0, y: 0 };
        this.lastShot = 0;
        this.fireRate = 2; // Increased from 1 to 2 shots per second
        this.damage = 15;
        this.multishot = 1;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.shield = 0;
        this.maxShield = 0;
        this.shieldRegenRate = 0;
        this.shieldRegenDelay = 0;
        this.lastDamageTaken = 0;
        this.parts = {
            engine: { level: 1, maxLevel: 4 },
            weapons: { level: 1, maxLevel: 4 },
            shield: { level: 1, maxLevel: 4 },
            hull: { level: 1, maxLevel: 4 }
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
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        
        // Draw engine trail with particle effect
        const trailLength = 30 + (this.parts.engine.level - 1) * 10;
        const trailWidth = 10 + (this.parts.engine.level - 1) * 3;
        
        // Create gradient for engine trail
        const trailGradient = ctx.createLinearGradient(-this.width/2, 0, -this.width/2 - trailLength, 0);
        trailGradient.addColorStop(0, 'rgba(68, 136, 255, 0.5)');
        trailGradient.addColorStop(0.5, 'rgba(68, 136, 255, 0.2)');
        trailGradient.addColorStop(1, 'rgba(68, 136, 255, 0)');
        
        ctx.beginPath();
        ctx.moveTo(-this.width/2, 0);
        ctx.lineTo(-this.width/2 - trailLength, 0);
        ctx.lineWidth = trailWidth;
        ctx.strokeStyle = trailGradient;
        ctx.stroke();
        
        // Draw shield effect
        if (this.parts.shield.level > 0) {
            const shieldRadius = Math.max(this.width, this.height) * 0.8;
            ctx.beginPath();
            ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(68, 136, 255, ${0.2 + this.parts.shield.level * 0.1})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Draw ship body with gradient
        const gradient = ctx.createLinearGradient(-this.width/2, 0, this.width/2, 0);
        gradient.addColorStop(0, '#4488ff');
        gradient.addColorStop(0.5, '#2266aa');
        gradient.addColorStop(1, '#114488');
        ctx.fillStyle = gradient;
        
        // Main body (rocket shape)
        ctx.beginPath();
        // Nose cone
        ctx.moveTo(this.width/2, 0);
        // Right side
        ctx.lineTo(-this.width/3, -this.height/2);
        // Bottom fin
        ctx.lineTo(-this.width/2, 0);
        // Left side
        ctx.lineTo(-this.width/3, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        // Draw fins
        ctx.fillStyle = '#2266aa';
        // Top fin
        ctx.beginPath();
        ctx.moveTo(-this.width/3, -this.height/2);
        ctx.lineTo(-this.width/2, -this.height/2);
        ctx.lineTo(-this.width/3, -this.height/3);
        ctx.closePath();
        ctx.fill();
        
        // Bottom fin
        ctx.beginPath();
        ctx.moveTo(-this.width/3, this.height/2);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.lineTo(-this.width/3, this.height/3);
        ctx.closePath();
        ctx.fill();
        
        // Draw engine section
        ctx.fillStyle = '#114488';
        ctx.fillRect(-this.width/2, -this.height/3, this.width/3, this.height/1.5);
        
        // Draw engine exhaust
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(-this.width/2, -this.height/4, this.width/4, this.height/2);
        
        // Draw cockpit with enhanced glass effect
        const cockpitGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.height/3);
        cockpitGradient.addColorStop(0, '#88ccff');
        cockpitGradient.addColorStop(0.5, '#44aaff');
        cockpitGradient.addColorStop(1, '#2266aa');
        ctx.fillStyle = cockpitGradient;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.height/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Add cockpit highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-this.height/6, -this.height/6, this.height/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Weapon systems visualization
        if (this.parts.weapons.level > 0) {
            // Draw weapon mounts
            ctx.fillStyle = '#ff8844';
            ctx.fillRect(this.width/4, -this.height/2, 5, this.height);
            
            // Draw weapon energy indicators
            const weaponGradient = ctx.createLinearGradient(this.width/4, 0, this.width/2, 0);
            weaponGradient.addColorStop(0, '#ff8844');
            weaponGradient.addColorStop(1, '#ff4400');
            ctx.fillStyle = weaponGradient;
            
            // Draw energy bars based on weapon level
            const barWidth = this.width/4;
            const barHeight = 3;
            const spacing = 5;
            
            for (let i = 0; i < this.parts.weapons.level; i++) {
                ctx.fillRect(this.width/4, -this.height/2 + i * (barHeight + spacing), barWidth, barHeight);
                ctx.fillRect(this.width/4, this.height/2 - i * (barHeight + spacing), barWidth, barHeight);
            }
        }
        
        ctx.restore();
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > 1000 / this.fireRate) {
            this.lastShot = now;
            
            // Create multiple projectiles based on multishot level
            const projectiles = [];
            const spread = 0.15; // Reduced spread for better accuracy
            
            for (let i = 0; i < this.multishot; i++) {
                const angleOffset = (i - (this.multishot - 1) / 2) * spread;
                const projectile = new Projectile(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.rotation + angleOffset,
                    true
                );
                projectile.multishotLevel = this.multishot;
                projectiles.push(projectile);
            }
            
            return projectiles;
        }
        return [];
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
                        // Level 1: Base stats
                        // Level 2: +50% damage, +1 fire rate, +1 multishot
                        // Level 3: +100% damage, +2 fire rate, +2 multishot, +20% projectile speed
                        switch (this.parts[partName].level) {
                            case 2:
                                this.damage *= 1.5;
                                this.fireRate += 1;
                                this.multishot += 1;
                                break;
                            case 3:
                                this.damage *= 2;
                                this.fireRate += 2;
                                this.multishot += 2;
                                // Increase projectile speed by 20%
                                this.projectileSpeed = 800 * 1.2;
                                break;
                        }
                        console.log(`Weapon upgraded to level ${this.parts[partName].level}. Damage: ${this.damage}, Fire Rate: ${this.fireRate}, Multishot: ${this.multishot}`);
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

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Add glow effect based on type
        ctx.shadowColor = this.type === 'battleship' ? '#ff4444' : 
                         this.type === 'fighter' ? '#ff8844' : '#44ff44';
        ctx.shadowBlur = 15;
        
        // Draw engine trail
        const trailLength = this.type === 'battleship' ? 40 : 
                           this.type === 'fighter' ? 25 : 20;
        const trailWidth = this.type === 'battleship' ? 15 : 
                          this.type === 'fighter' ? 8 : 6;
        ctx.beginPath();
        ctx.moveTo(-this.width/2, 0);
        ctx.lineTo(-this.width/2 - trailLength, 0);
        ctx.lineWidth = trailWidth;
        ctx.strokeStyle = `rgba(255, 100, 0, ${this.type === 'battleship' ? 0.5 : 0.3})`;
        ctx.stroke();
        
        // Draw ship body with gradient based on type
        const gradient = ctx.createLinearGradient(-this.width/2, 0, this.width/2, 0);
        if (this.type === 'battleship') {
            gradient.addColorStop(0, '#ff4444');
            gradient.addColorStop(1, '#aa2222');
        } else if (this.type === 'fighter') {
            gradient.addColorStop(0, '#ff8844');
            gradient.addColorStop(1, '#aa5522');
        } else {
            gradient.addColorStop(0, '#44ff44');
            gradient.addColorStop(1, '#22aa22');
        }
        ctx.fillStyle = gradient;
        
        // Draw different ship designs based on type
        if (this.type === 'battleship') {
            // Battleship design - larger, more armored
            ctx.beginPath();
            ctx.moveTo(this.width/2, 0);
            ctx.lineTo(-this.width/3, -this.height/2);
            ctx.lineTo(-this.width/2, -this.height/3);
            ctx.lineTo(-this.width/2, this.height/3);
            ctx.lineTo(-this.width/3, this.height/2);
            ctx.closePath();
            ctx.fill();
            
            // Additional armor plates
            ctx.fillStyle = '#aa2222';
            ctx.fillRect(-this.width/2, -this.height/3, this.width/3, this.height/1.5);
        } else if (this.type === 'fighter') {
            // Fighter design - sleek and fast
            ctx.beginPath();
            ctx.moveTo(this.width/2, 0);
            ctx.lineTo(-this.width/4, -this.height/2);
            ctx.lineTo(-this.width/2, 0);
            ctx.lineTo(-this.width/4, this.height/2);
            ctx.closePath();
            ctx.fill();
        } else {
            // Scout design - small and agile
            ctx.beginPath();
            ctx.moveTo(this.width/2, 0);
            ctx.lineTo(-this.width/3, -this.height/2);
            ctx.lineTo(-this.width/2, 0);
            ctx.lineTo(-this.width/3, this.height/2);
            ctx.closePath();
            ctx.fill();
        }
        
        // Draw alien cockpit
        ctx.beginPath();
        ctx.arc(0, 0, this.height/3, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'battleship' ? '#ff8888' : 
                       this.type === 'fighter' ? '#ffaa88' : '#88ff88';
        ctx.fill();
        
        ctx.restore();
    }
}

// Projectile class for weapons
class Projectile extends Entity {
    constructor(x, y, angle, isPlayerProjectile) {
        super(x, y, 15, 6); 
        this.angle = angle;
        this.speed = isPlayerProjectile ? 800 : 600; // Base speed for player projectiles
        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = Math.sin(angle) * this.speed;
        this.isPlayerProjectile = isPlayerProjectile;
        this.damage = isPlayerProjectile ? 15 : 5; 
        this.color = isPlayerProjectile ? '#88ffff' : '#ff8888';
        this.lifetime = 2000; // milliseconds
        this.born = Date.now();
        this.multishotLevel = 1; // Default to single shot
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
        
        // Add glow effect based on multishot level
        const glowColor = this.isPlayerProjectile ? '#00ffff' : '#ff0000';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15 + (this.multishotLevel - 1) * 5; // Increased glow for higher multishot
        
        // Create gradient for projectile
        const gradient = ctx.createLinearGradient(0, -this.height/2, this.width, this.height/2);
        if (this.isPlayerProjectile) {
            // Enhanced colors for multishot
            const hue = 180 + (this.multishotLevel - 1) * 20; // Shift hue for each level
            gradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
            gradient.addColorStop(0.5, `hsl(${hue - 20}, 100%, 40%)`);
            gradient.addColorStop(1, `hsl(${hue - 40}, 100%, 30%)`);
        } else {
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(0.5, '#ff4400');
            gradient.addColorStop(1, '#ff8800');
        }
        
        // Draw projectile body
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.width, 0);
        ctx.lineTo(0, -this.height/2);
        ctx.lineTo(0, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        // Add energy trail with multishot effects
        const trailLength = 20 + (this.multishotLevel - 1) * 5; // Longer trail for higher multishot
        const trailGradient = ctx.createLinearGradient(0, 0, -trailLength, 0);
        if (this.isPlayerProjectile) {
            const alpha = 0.3 + (this.multishotLevel - 1) * 0.1; // Brighter trail for higher multishot
            trailGradient.addColorStop(0, `rgba(0, 255, 255, ${alpha})`);
            trailGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        } else {
            trailGradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
            trailGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        }
        
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.moveTo(0, -this.height/2);
        ctx.lineTo(-trailLength, 0);
        ctx.lineTo(0, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        // Add energy core with multishot effects
        ctx.beginPath();
        ctx.arc(0, 0, this.height/3 + (this.multishotLevel - 1) * 2, 0, Math.PI * 2);
        ctx.fillStyle = this.isPlayerProjectile ? '#ffffff' : '#ffaa00';
        ctx.fill();
        
        // Add multishot level indicator
        if (this.isPlayerProjectile && this.multishotLevel > 1) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.multishotLevel.toString(), 0, 0);
        }
        
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

// Add PowerUp class
class PowerUp extends Entity {
    constructor(x, y, type) {
        super(x, y, 20, 20);
        this.type = type;
        this.lifetime = 10000; // 10 seconds to collect
        this.born = Date.now();
        this.pulseScale = 1;
        this.pulseDirection = 0.01;
        
        // Define colors and symbols for different power-ups
        this.powerUpStyles = {
            health: { color: '#ff4444', symbol: '♥', message: 'Health +25!' },
            weapon: { color: '#ff8800', symbol: '⚔', message: 'Damage +20%!' },
            shield: { color: '#44aaff', symbol: '☗', message: 'Shield +20!' },
            speed: { color: '#44ff44', symbol: '⚡', message: 'Speed +15%!' },
            fireRate: { color: '#ffff00', symbol: '✦', message: 'Fire Rate +20%!' },
            multishot: { color: '#ff44ff', symbol: '⋈', message: 'Multishot +1!' }
        };
    }

    update(deltaTime) {
        // Pulse animation
        this.pulseScale += this.pulseDirection;
        if (this.pulseScale > 1.2 || this.pulseScale < 0.8) {
            this.pulseDirection *= -1;
        }
        
        // Check if expired
        return Date.now() - this.born > this.lifetime;
    }

    draw(ctx) {
        const style = this.powerUpStyles[this.type];
        if (!style) return;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        // Draw glow
        ctx.shadowColor = style.color;
        ctx.shadowBlur = 10;
        
        // Draw background
        ctx.fillStyle = style.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(style.symbol, 0, 0);
        
        ctx.restore();
    }

    applyEffect(player) {
        switch(this.type) {
            case 'health':
                const healAmount = 25;
                player.health = Math.min(player.maxHealth, player.health + healAmount);
                break;
            
            case 'weapon':
                player.damage *= 1.2;
                break;
            
            case 'shield':
                player.maxHealth += 20;
                player.health += 20;
                break;
            
            case 'speed':
                player.speed *= 1.15;
                break;
            
            case 'fireRate':
                player.fireRate *= 1.2;
                break;
            
            case 'multishot':
                player.multishot = (player.multishot || 1) + 1;
                break;
        }
        
        // Return the message to display
        return this.powerUpStyles[this.type].message;
    }
}

// Make sure PowerUp is exported if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Entity,
        PowerUp,
        PlayerShip,
        AlienShip,
        Projectile,
        Resource
    };
}
