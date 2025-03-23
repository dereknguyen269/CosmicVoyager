/**
 * Ship Builder module for Cosmic Voyager
 */

class ShipBuilder {
    constructor(game) {
        this.game = game;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 300;
        
        this.shipPreview = document.getElementById('ship-preview');
        
        // Clear any existing canvases in the preview
        while (this.shipPreview.firstChild) {
            this.shipPreview.removeChild(this.shipPreview.firstChild);
        }
        
        this.shipPreview.appendChild(this.canvas);
        
        this.selectedPart = null;
        this.resources = 0;
        
        this.partCosts = {
            engine: [50, 100, 200],
            weapons: [50, 100, 200],
            shield: [50, 100, 200],
            hull: [50, 100, 200]
        };
        
        this.init();
    }
    
    init() {
        // Set up event listeners for ship parts
        const parts = document.querySelectorAll('.part');
        parts.forEach(part => {
            part.addEventListener('click', () => {
                // Remove selected class from all parts
                parts.forEach(p => p.classList.remove('selected'));
                
                // Add selected class to clicked part
                part.classList.add('selected');
                
                // Set selected part
                this.selectedPart = part.dataset.part;
                
                // Update preview
                this.updatePreview();
            });
        });
        
        // Save ship button
        document.getElementById('save-ship').addEventListener('click', () => {
            if (this.selectedPart && this.game.player) {
                const partLevel = this.game.player.parts[this.selectedPart].level;
                const nextLevel = partLevel + 1;
                
                if (nextLevel <= this.game.player.parts[this.selectedPart].maxLevel) {
                    const cost = Math.round(this.partCosts[this.selectedPart][partLevel - 1]);
                    
                    if (this.game.resources >= cost) {
                        this.game.removeResources(cost);
                        
                        this.game.player.upgradePart(this.selectedPart);
                        this.updatePreview();
                        
                        // Show success message
                        this.showMessage(`Upgraded ${this.selectedPart} to level ${nextLevel}!`, 'success');
                    } else {
                        // Show error message
                        this.showMessage(`Not enough resources! Need ${cost} resources.`, 'error');
                    }
                } else {
                    this.showMessage(`${this.selectedPart} is already at max level!`, 'error');
                }
            } else {
                this.showMessage('Select a part to upgrade first!', 'error');
            }
        });
        
        // Exit builder button
        document.getElementById('exit-builder').addEventListener('click', () => {
            this.close();
        });
    }
    
    open() {
        console.log("Opening ship builder");
        
        // Clear any existing message
        const existingMessage = document.querySelector('.builder-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Select the first part by default
        const firstPart = document.querySelector('.part');
        if (firstPart) {
            firstPart.click();
        }
        
        // Update the preview
        this.updatePreview();
    }
    
    close() {
        console.log("Closing ship builder");
        
        // Hide builder screen
        document.getElementById('builder-screen').classList.add('hidden');
        
        // Show game screen
        document.getElementById('game-screen').classList.remove('hidden');
        
        // Resume game
        this.game.resumeGame();
    }
    
    updatePreview() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.game.player) return;
        
        // Draw ship preview
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = 3;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        // Draw ship body
        this.ctx.fillStyle = '#4488ff';
        this.ctx.beginPath();
        this.ctx.moveTo(25 * scale, 0);
        this.ctx.lineTo(-25 * scale, -15 * scale);
        this.ctx.lineTo(-15 * scale, 0);
        this.ctx.lineTo(-25 * scale, 15 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw engine based on level
        const engineLevel = this.game.player.parts.engine.level;
        this.ctx.fillStyle = engineLevel === 1 ? '#ff9900' : 
                           engineLevel === 2 ? '#ffcc00' : '#ffff00';
        
        // Engine size based on level
        const engineSize = 5 + (engineLevel * 3);
        this.ctx.beginPath();
        this.ctx.moveTo(-25 * scale, -10 * scale);
        this.ctx.lineTo(-25 * scale - engineSize * scale, 0);
        this.ctx.lineTo(-25 * scale, 10 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw weapons based on level
        const weaponsLevel = this.game.player.parts.weapons.level;
        this.ctx.fillStyle = '#ff4444';
        
        if (weaponsLevel >= 1) {
            // Basic weapon
            this.ctx.fillRect(10 * scale, -15 * scale, 10 * scale, 3 * scale);
            this.ctx.fillRect(10 * scale, 12 * scale, 10 * scale, 3 * scale);
        }
        
        if (weaponsLevel >= 2) {
            // Medium weapon
            this.ctx.fillRect(0 * scale, -18 * scale, 15 * scale, 3 * scale);
            this.ctx.fillRect(0 * scale, 15 * scale, 15 * scale, 3 * scale);
        }
        
        if (weaponsLevel >= 3) {
            // Advanced weapon
            this.ctx.fillRect(15 * scale, -10 * scale, 15 * scale, 3 * scale);
            this.ctx.fillRect(15 * scale, 7 * scale, 15 * scale, 3 * scale);
        }
        
        // Draw shield based on level
        const shieldLevel = this.game.player.parts.shield.level;
        
        if (shieldLevel > 0) {
            this.ctx.strokeStyle = shieldLevel === 1 ? 'rgba(100, 200, 255, 0.3)' : 
                                 shieldLevel === 2 ? 'rgba(100, 200, 255, 0.5)' : 
                                                    'rgba(100, 200, 255, 0.7)';
            this.ctx.lineWidth = shieldLevel * 2;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 35 * scale, 25 * scale, 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw hull based on level (additional armor plates)
        const hullLevel = this.game.player.parts.hull.level;
        this.ctx.fillStyle = '#2266aa';
        
        if (hullLevel >= 2) {
            // Medium hull
            this.ctx.fillRect(-15 * scale, -10 * scale, 30 * scale, 3 * scale);
            this.ctx.fillRect(-15 * scale, 7 * scale, 30 * scale, 3 * scale);
        }
        
        if (hullLevel >= 3) {
            // Advanced hull
            this.ctx.fillRect(-20 * scale, -5 * scale, 35 * scale, 3 * scale);
            this.ctx.fillRect(-20 * scale, 2 * scale, 35 * scale, 3 * scale);
        }
        
        this.ctx.restore();
        
        // Draw part info
        if (this.selectedPart) {
            const part = this.game.player.parts[this.selectedPart];
            const level = part.level;
            const maxLevel = part.maxLevel;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            
            this.ctx.fillText(`${this.selectedPart.charAt(0).toUpperCase() + this.selectedPart.slice(1)} - Level ${level}/${maxLevel}`, this.canvas.width / 2, 30);
            
            if (level < maxLevel) {
                const cost = this.partCosts[this.selectedPart][level - 1];
                this.ctx.fillText(`Upgrade cost: ${cost} resources`, this.canvas.width / 2, this.canvas.height - 30);
            } else {
                this.ctx.fillText('Maximum level reached', this.canvas.width / 2, this.canvas.height - 30);
            }
        }
    }
    
    showMessage(text, type) {
        // Create message element if it doesn't exist
        let messageEl = document.getElementById('builder-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'builder-message';
            document.getElementById('builder-screen').appendChild(messageEl);
        }
        
        // Set message text and style
        messageEl.textContent = text;
        messageEl.className = type;
        
        // Show message
        messageEl.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}
