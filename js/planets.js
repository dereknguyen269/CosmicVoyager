/**
 * Planet generation and exploration for Cosmic Voyager
 */

class PlanetSystem {
    constructor(game) {
        this.game = game;
        this.planets = [];
        this.currentPlanet = null;
        
        // Planet types with their properties
        this.planetTypes = [
            {
                type: 'rocky',
                colors: ['#a67c52', '#b5835a', '#c48d62'],
                resources: ['metal', 'crystal'],
                difficulty: 1,
                description: 'A rocky planet with valuable minerals.'
            },
            {
                type: 'gas',
                colors: ['#e8c370', '#f0d78a', '#f8ebaa'],
                resources: ['fuel', 'crystal'],
                difficulty: 2,
                description: 'A gas giant with fuel resources.'
            },
            {
                type: 'ice',
                colors: ['#a0e0e0', '#b8f0f0', '#d0ffff'],
                resources: ['crystal', 'metal'],
                difficulty: 3,
                description: 'An ice planet with rare crystals.'
            },
            {
                type: 'volcanic',
                colors: ['#d44000', '#f04000', '#ff5000'],
                resources: ['metal', 'fuel'],
                difficulty: 4,
                description: 'A volcanic planet with abundant metals and fuel.'
            },
            {
                type: 'alien',
                colors: ['#80ff80', '#a0ffa0', '#c0ffc0'],
                resources: ['crystal', 'fuel', 'metal'],
                difficulty: 5,
                description: 'An alien world with strange resources and hostile life forms.'
            }
        ];
    }
    
    generatePlanets(count) {
        this.planets = [];
        
        // Create home base planet
        const homePlanet = {
            id: 'home',
            name: 'Home Base',
            type: 'earth',
            x: this.game.width / 2,
            y: this.game.height / 2,
            radius: 30,
            color: '#4488aa',
            resources: [],
            visited: true,
            description: 'Your home base. Return here to repair your ship and upgrade.',
            difficulty: 0
        };
        
        this.planets.push(homePlanet);
        
        // Generate random planets
        for (let i = 0; i < count; i++) {
            const planetType = this.planetTypes[Math.floor(Math.random() * this.planetTypes.length)];
            
            // Calculate random position (not too close to home)
            let x, y, tooClose;
            do {
                x = Math.random() * (this.game.width - 200) + 100;
                y = Math.random() * (this.game.height - 200) + 100;
                
                // Check if too close to home or other planets
                const distToHome = distance(x, y, homePlanet.x, homePlanet.y);
                tooClose = distToHome < 200;
                
                for (const planet of this.planets) {
                    const dist = distance(x, y, planet.x, planet.y);
                    if (dist < 150) {
                        tooClose = true;
                        break;
                    }
                }
            } while (tooClose);
            
            // Generate planet
            const planet = {
                id: 'planet_' + i,
                name: this.generatePlanetName(),
                type: planetType.type,
                x: x,
                y: y,
                radius: Math.random() * 15 + 20,
                color: planetType.colors[Math.floor(Math.random() * planetType.colors.length)],
                resources: planetType.resources,
                visited: false,
                description: planetType.description,
                difficulty: planetType.difficulty
            };
            
            this.planets.push(planet);
        }
    }
    
    generatePlanetName() {
        const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
        const suffixes = ['Prime', 'Minor', 'Major', 'Secundus', 'Tertius', 'Quartus', 'Quintus', 'Sextus'];
        const numbers = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
        const number = Math.random() > 0.7 ? numbers[Math.floor(Math.random() * numbers.length)] : '';
        
        return `${prefix} ${suffix} ${number}`.trim();
    }
    
    drawPlanets(ctx) {
        for (const planet of this.planets) {
            // Draw planet
            ctx.fillStyle = planet.color;
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw orbit
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw name if visited or home
            if (planet.visited || planet.id === 'home') {
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(planet.name, planet.x, planet.y - planet.radius - 10);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('???', planet.x, planet.y - planet.radius - 10);
            }
        }
    }
    
    checkPlanetCollision(x, y) {
        for (const planet of this.planets) {
            const dist = distance(x, y, planet.x, planet.y);
            if (dist < planet.radius + 20) {
                return planet;
            }
        }
        return null;
    }
    
    enterPlanet(planet) {
        this.currentPlanet = planet;
        planet.visited = true;
        
        // Update planet info
        const planetInfo = document.getElementById('planet-info');
        planetInfo.innerHTML = `
            <h3>${planet.name}</h3>
            <p>${planet.description}</p>
            <p>Type: ${planet.type}</p>
            <p>Difficulty: ${planet.difficulty === 0 ? 'Safe' : '⭐'.repeat(planet.difficulty)}</p>
        `;
        
        // Update planet resources
        const planetResources = document.getElementById('planet-resources');
        planetResources.innerHTML = '';
        
        if (planet.id === 'home') {
            // Home base options
            planetResources.innerHTML = `
                <div class="home-options">
                    <button id="repair-ship">Repair Ship (25 resources)</button>
                    <button id="open-builder">Upgrade Ship</button>
                </div>
            `;
            
            // Add event listeners
            document.getElementById('repair-ship').addEventListener('click', () => {
                if (this.game.resources >= 25) {
                    this.game.resources -= 25;
                    document.getElementById('resource-count').textContent = this.game.resources;
                    this.game.player.health = this.game.player.maxHealth;
                    document.getElementById('health-value').textContent = this.game.player.health;
                    this.showMessage('Ship repaired!', 'success');
                } else {
                    this.showMessage('Not enough resources!', 'error');
                }
            });
            
            document.getElementById('open-builder').addEventListener('click', () => {
                showScreen('builder-screen');
                this.game.shipBuilder.open();
            });
        } else {
            // Show available resources
            planetResources.innerHTML = '<h4>Available Resources:</h4>';
            
            for (const resource of planet.resources) {
                const resourceEl = document.createElement('div');
                resourceEl.className = 'resource';
                resourceEl.textContent = resource.charAt(0).toUpperCase() + resource.slice(1);
                planetResources.appendChild(resourceEl);
            }
            
            // Enable/disable collect button based on planet type
            const collectButton = document.getElementById('collect-resources');
            collectButton.disabled = planet.id === 'home';
        }
        
        // Show planet screen
        showScreen('planet-screen');
    }
    
    collectResources() {
        if (!this.currentPlanet || this.currentPlanet.id === 'home') return;
        
        // Calculate resources based on planet difficulty
        const baseAmount = 10;
        const amount = Math.round(baseAmount + (this.currentPlanet.difficulty * 5));
        
        // Add resources
        this.game.addResources(amount);
        
        // Show message
        this.showMessage(`Collected ${amount} resources!`, 'success');
        
        // Chance to spawn enemies based on planet difficulty
        if (Math.random() < this.currentPlanet.difficulty * 0.1) {
            this.showMessage('Alert! Aliens detected!', 'error');
            
            // Return to game and spawn enemies
            showScreen('game-screen');
            this.game.resumeGame();
            
            // Spawn enemies based on difficulty
            const enemyCount = Math.ceil(this.currentPlanet.difficulty / 2);
            this.game.spawnEnemies(enemyCount);
        }
    }
    
    showMessage(text, type) {
        // Create message element if it doesn't exist
        let messageEl = document.getElementById('planet-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'planet-message';
            document.getElementById('planet-screen').appendChild(messageEl);
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
    
    initEventListeners() {
        // Collect resources button
        document.getElementById('collect-resources').addEventListener('click', () => {
            this.collectResources();
        });
        
        // Leave planet button
        document.getElementById('leave-planet').addEventListener('click', () => {
            showScreen('game-screen');
            this.game.resumeGame();
        });
    }
}
