/**
 * Utility functions for the Cosmic Voyager game
 */

// Add ErrorHandler class at the top of utils.js
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Keep last 100 errors
    }

    handleError(msg, url, line) {
        const error = {
            message: msg,
            url: url,
            line: line,
            timestamp: new Date().toISOString()
        };

        console.error('Game Error:', error);
        this.errors.push(error);

        // Keep error log size manageable
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // You could add additional error handling here:
        // - Send to analytics
        // - Show user-friendly error message
        // - Try to recover game state
        
        return false; // Let other error handlers run
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
    }
}

// Random number generator between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Check collision between two objects with x, y, width, height properties
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Show a specific screen and hide all others
function showScreen(screenId) {
    console.log(`Showing screen: ${screenId}`);
    
    try {
        // Hide all screens first
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show the requested screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            console.log(`Successfully showed screen: ${screenId}`);
        } else {
            console.error(`Screen not found: ${screenId}`);
        }
    } catch (error) {
        console.error(`Error showing screen ${screenId}:`, error);
    }
}

// Hide a specific screen
function hideScreen(screenId) {
    console.log(`Hiding screen: ${screenId}`);
    
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('hidden');
    } else {
        console.error(`Screen not found: ${screenId}`);
    }
}

// Create a simple sprite with basic properties
function createSprite(x, y, width, height, color) {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        color: color,
        draw: function(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}

// Create a simple particle effect
function createParticleEffect(x, y, count, color, speed, lifetime, ctx) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = {
            x: Math.cos(angle) * speed * Math.random(),
            y: Math.sin(angle) * speed * Math.random()
        };
        
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 3 + 1,
            color: color,
            velocity: velocity,
            lifetime: lifetime,
            remainingLife: lifetime
        });
    }
    
    function update() {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.remainingLife--;
            
            if (p.remainingLife <= 0) {
                particles.splice(i, 1);
                i--;
                continue;
            }
            
            p.x += p.velocity.x;
            p.y += p.velocity.y;
            
            // Fade out
            const alpha = p.remainingLife / p.lifetime;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.fill();
        }
        
        if (particles.length > 0) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Load an image and return a promise
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Simple event emitter
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }
    
    off(event, listener) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(l => l !== listener);
        }
    }
}

// Global game events
const gameEvents = new EventEmitter();
