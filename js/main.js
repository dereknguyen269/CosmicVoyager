/**
 * Main initialization script for Cosmic Voyager
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize game
    const game = new Game();
    
    // Difficulty selection
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    // Map difficulty button IDs to settings keys
    const difficultyMap = {
        'easy-mode': 'easy',
        'normal-mode': 'normal',
        'hard-mode': 'hard',
        'very-hard-mode': 'veryHard'  // Match this with the settings key
    };
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Get the correct difficulty key from the map
            const difficulty = difficultyMap[this.id];
            console.log('Setting difficulty to:', difficulty);
            game.setDifficulty(difficulty);
        });
    });
    
    // Start button
    document.getElementById('start-button').addEventListener('click', function() {
        console.log("Start button clicked, current difficulty:", game.currentDifficulty);
        
        // Hide all screens first
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show game screen
        const gameScreen = document.getElementById('game-screen');
        gameScreen.classList.remove('hidden');
        
        // Start the game
        game.startGame();
    });
    
    // Add event listener for force game over button
    document.getElementById('force-game-over').addEventListener('click', function() {
        console.log("Force Game Over button clicked");
        game.forceGameOver();
    });
    
    // Add event listener for open ship builder button
    document.getElementById('open-builder').addEventListener('click', function() {
        console.log("Open Ship Builder button clicked");
        game.openShipBuilder();
    });
    
    // Add event listeners for builder screen
    document.getElementById('save-ship').addEventListener('click', function() {
        showScreen('game-screen');
        game.resumeGame();
    });
    
    document.getElementById('exit-builder').addEventListener('click', function() {
        showScreen('game-screen');
        game.resumeGame();
    });
    
    // Add event listeners for planet screen
    document.getElementById('collect-resources').addEventListener('click', function() {
        game.planetSystem.collectResources();
    });
    
    document.getElementById('leave-planet').addEventListener('click', function() {
        showScreen('game-screen');
        game.resumeGame();
    });
    
    // Add event listeners for game over screen
    document.getElementById('restart-button').addEventListener('click', function() {
        console.log("Restart button clicked");
        try {
            // Hide game over screen
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            // Show game screen
            document.getElementById('game-screen').classList.remove('hidden');
            
            // Reset and start the game
            game.reset();
            game.startGame();
            
        } catch (error) {
            console.error("Error restarting game:", error);
        }
    });
    
    document.getElementById('main-menu-button').addEventListener('click', function() {
        console.log("Main menu button clicked");
        try {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            // Show menu screen
            document.getElementById('menu-screen').classList.remove('hidden');
            
            // Reset game state
            game.reset();
            
        } catch (error) {
            console.error("Error returning to main menu:", error);
        }
    });
    
    // Victory screen buttons
    document.getElementById('play-again-button').addEventListener('click', function() {
        console.log("Play again button clicked");
        try {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            document.getElementById('game-screen').classList.remove('hidden');
            game.reset();
            game.startGame();
        } catch (error) {
            console.error("Error restarting game:", error);
        }
    });

    document.getElementById('victory-menu-button').addEventListener('click', function() {
        console.log("Victory menu button clicked");
        try {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            document.getElementById('menu-screen').classList.remove('hidden');
            game.reset();
        } catch (error) {
            console.error("Error returning to menu:", error);
        }
    });
    
    // Force initial difficulty to easy
    game.setDifficulty('easy');
    
    console.log("Game initialized and event listeners set up");
});
