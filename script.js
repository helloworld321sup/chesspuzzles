// Chess Puzzle Simulator
class ChessPuzzleSimulator {
    constructor() {
        this.board = null;
        this.game = new Chess();
        this.currentPuzzle = null;
        this.puzzleIndex = 0;
        this.startTime = null;
        this.timer = null;
        this.attempts = 0;
        this.hintsUsed = 0;
        
        // User stats
        this.userStats = {
            elo: 0,
            points: 0,
            streak: 0,
            puzzlesSolved: 0,
            totalTime: 0
        };
        
        // Load saved stats
        this.loadUserStats();
        
        // Initialize the application
        this.init();
    }
    
    init() {
        // Wait for chessboard.js to load
        setTimeout(() => {
            this.initBoard();
            this.loadPuzzle();
            this.startTimer();
            this.updateUI();
            this.setupEventListeners();
        }, 100);
    }
    
    initBoard() {
        try {
            const config = {
                draggable: true,
                position: 'start',
                onDragStart: this.onDragStart.bind(this),
                onDrop: this.onDrop.bind(this),
                onSnapEnd: this.onSnapEnd.bind(this),
                pieceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/chessboard.js/1.0.0/img/chesspieces/wikipedia/{piece}.png'
            };
            
            this.board = Chessboard('chessboard', config);
            console.log('Chessboard initialized successfully');
        } catch (error) {
            console.error('Error initializing chessboard:', error);
            // Fallback: try again after a delay
            setTimeout(() => {
                this.initBoard();
            }, 500);
        }
    }
    
    setupEventListeners() {
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetPuzzle());
        document.getElementById('nextPuzzleBtn').addEventListener('click', () => this.nextPuzzle());
    }
    
    // Puzzle database with various difficulty levels
    getPuzzleDatabase() {
        return [
            {
                id: 1,
                title: "Fork Attack",
                difficulty: "Beginner",
                elo: 1200,
                description: "Find the fork that wins material",
                fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
                solution: ["Bxf7+", "Kxf7", "Ng5+"],
                reward: 50
            },
            {
                id: 2,
                title: "Pin and Win",
                difficulty: "Beginner",
                elo: 1300,
                description: "Use a pin to win material",
                fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 6 4",
                solution: ["Bxf7+", "Kxf7", "Ng5+"],
                reward: 60
            },
            {
                id: 3,
                title: "Back Rank Mate",
                difficulty: "Intermediate",
                elo: 1500,
                description: "Deliver a back rank checkmate",
                fen: "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
                solution: ["Qd8+", "Rxd8", "Rxd8#"],
                reward: 80
            },
            {
                id: 4,
                title: "Smothered Mate",
                difficulty: "Intermediate",
                elo: 1600,
                description: "Find the smothered mate pattern",
                fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
                solution: ["Qh8+", "Kxh8", "Nf7#"],
                reward: 100
            },
            {
                id: 5,
                title: "Greek Gift Sacrifice",
                difficulty: "Advanced",
                elo: 1800,
                description: "Execute the classic Greek Gift sacrifice",
                fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
                solution: ["Bxh7+", "Kxh7", "Ng5+", "Kg8", "Qh5"],
                reward: 150
            },
            {
                id: 6,
                title: "Windmill Attack",
                difficulty: "Advanced",
                elo: 1900,
                description: "Create a windmill to win material",
                fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
                solution: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qh5", "h6", "Qf7+"],
                reward: 200
            },
            {
                id: 7,
                title: "Zugzwang Masterpiece",
                difficulty: "Expert",
                elo: 2200,
                description: "Put your opponent in zugzwang",
                fen: "8/8/8/8/8/8/8/8 w - - 0 1",
                solution: ["Kf1", "Ke8", "Ke2", "Kd8", "Kd3", "Kc8", "Kc4", "Kb8", "Kb5", "Ka8", "Ka6", "Kb8", "Kb6", "Ka8", "Kc7"],
                reward: 300
            },
            {
                id: 8,
                title: "Endgame Precision",
                difficulty: "Expert",
                elo: 2300,
                description: "Navigate a complex endgame",
                fen: "8/8/8/8/8/8/8/8 w - - 0 1",
                solution: ["Kf1", "Ke8", "Ke2", "Kd8", "Kd3", "Kc8", "Kc4", "Kb8", "Kb5", "Ka8", "Ka6", "Kb8", "Kb6", "Ka8", "Kc7"],
                reward: 350
            }
        ];
    }
    
    loadPuzzle() {
        const puzzles = this.getPuzzleDatabase();
        this.currentPuzzle = puzzles[this.puzzleIndex];
        
        // Set up the position
        this.game.load(this.currentPuzzle.fen);
        
        // Update board position if board is initialized
        if (this.board) {
            this.board.position(this.currentPuzzle.fen);
        }
        
        // Update UI
        document.getElementById('puzzleTitle').textContent = this.currentPuzzle.title;
        document.getElementById('puzzleDifficulty').textContent = this.currentPuzzle.difficulty;
        document.getElementById('puzzleElo').textContent = this.currentPuzzle.elo;
        document.getElementById('puzzleDescription').textContent = this.currentPuzzle.description;
        
        // Reset puzzle state
        this.attempts = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        this.updateAttempts();
        this.resetTimer();
    }
    
    onDragStart(source, piece, position, orientation) {
        // Only allow moves for the side to move
        if (this.game.turn() === 'w' && piece.search(/^b/) !== -1) {
            return false;
        }
        if (this.game.turn() === 'b' && piece.search(/^w/) !== -1) {
            return false;
        }
    }
    
    onDrop(source, target) {
        // Make the move
        const move = this.game.move({
            from: source,
            to: target,
            promotion: 'q' // Always promote to queen for simplicity
        });
        
        // If the move is invalid, snap back
        if (move === null) return 'snapback';
        
        this.attempts++;
        this.updateAttempts();
        
        // Check if this is part of the solution
        const moveNotation = this.getMoveNotation(move);
        const solutionIndex = this.attempts - 1;
        
        if (this.currentPuzzle.solution[solutionIndex] === moveNotation) {
            // Correct move
            this.highlightSquare(target, 'correct');
            
            // Check if puzzle is complete
            if (solutionIndex === this.currentPuzzle.solution.length - 1) {
                this.puzzleSolved();
            }
        } else {
            // Incorrect move
            this.highlightSquare(target, 'incorrect');
            this.game.undo();
            this.board.position(this.game.fen());
        }
        
        return true;
    }
    
    onSnapEnd() {
        this.board.position(this.game.fen());
    }
    
    getMoveNotation(move) {
        // Convert move object to algebraic notation
        if (move.flags.includes('c')) {
            return 'O-O-O';
        } else if (move.flags.includes('k')) {
            return 'O-O';
        } else {
            let notation = '';
            if (move.piece !== 'p') {
                notation += move.piece.toUpperCase();
            }
            notation += move.from;
            if (move.captured) {
                notation += 'x';
            }
            notation += move.to;
            if (move.promotion) {
                notation += '=' + move.promotion.toUpperCase();
            }
            if (move.flags.includes('+')) {
                notation += '+';
            }
            if (move.flags.includes('#')) {
                notation += '#';
            }
            return notation;
        }
    }
    
    highlightSquare(square, type) {
        const element = document.querySelector(`[data-square="${square}"]`);
        if (element) {
            element.classList.add(type === 'correct' ? 'correct-move' : 'incorrect-move');
            setTimeout(() => {
                element.classList.remove('correct-move', 'incorrect-move');
            }, 600);
        }
    }
    
    puzzleSolved() {
        const timeElapsed = Date.now() - this.startTime;
        const timeSeconds = Math.floor(timeElapsed / 1000);
        
        // Calculate points and ELO change
        const basePoints = this.currentPuzzle.reward;
        const timeBonus = Math.max(0, 100 - timeSeconds);
        const hintPenalty = this.hintsUsed * 10;
        const pointsEarned = Math.max(10, basePoints + timeBonus - hintPenalty);
        
        // ELO calculation (simplified)
        const eloChange = this.calculateEloChange(this.currentPuzzle.elo, timeSeconds, this.attempts);
        
        // Update user stats
        this.userStats.points += pointsEarned;
        this.userStats.elo += eloChange;
        this.userStats.streak++;
        this.userStats.puzzlesSolved++;
        this.userStats.totalTime += timeSeconds;
        
        // Save stats
        this.saveUserStats();
        
        // Show success modal
        this.showGameOverModal(pointsEarned, eloChange, timeSeconds);
        
        // Add reward to list
        this.addReward(`Puzzle solved! +${pointsEarned} points`);
        
        // Check for achievements
        this.checkAchievements();
    }
    
    calculateEloChange(puzzleElo, timeSeconds, attempts) {
        const expectedScore = 1 / (1 + Math.pow(10, (puzzleElo - this.userStats.elo) / 400));
        const actualScore = 1; // Solved the puzzle
        const kFactor = 32;
        
        let eloChange = Math.round(kFactor * (actualScore - expectedScore));
        
        // Time bonus/penalty
        if (timeSeconds < 30) eloChange += 5;
        else if (timeSeconds > 120) eloChange -= 5;
        
        // Attempt penalty
        if (attempts > 3) eloChange -= 3;
        
        return eloChange;
    }
    
    showGameOverModal(pointsEarned, eloChange, timeSeconds) {
        const modal = document.getElementById('gameOverModal');
        const timeStr = this.formatTime(timeSeconds);
        
        document.getElementById('finalTime').textContent = timeStr;
        document.getElementById('pointsEarned').textContent = `+${pointsEarned}`;
        document.getElementById('eloChange').textContent = eloChange > 0 ? `+${eloChange}` : eloChange.toString();
        
        modal.classList.add('show');
    }
    
    showHint() {
        if (this.hintsUsed >= 3) {
            alert('Maximum hints reached!');
            return;
        }
        
        this.hintsUsed++;
        const solutionIndex = this.attempts;
        
        if (solutionIndex < this.currentPuzzle.solution.length) {
            const hint = this.currentPuzzle.solution[solutionIndex];
            alert(`Hint: The next move is ${hint}`);
        }
    }
    
    resetPuzzle() {
        this.game.load(this.currentPuzzle.fen);
        this.board.position(this.currentPuzzle.fen);
        this.attempts = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        this.updateAttempts();
        this.resetTimer();
    }
    
    nextPuzzle() {
        // Close modals
        document.getElementById('gameOverModal').classList.remove('show');
        document.getElementById('achievementModal').classList.remove('show');
        
        // Move to next puzzle
        this.puzzleIndex = (this.puzzleIndex + 1) % this.getPuzzleDatabase().length;
        this.loadPuzzle();
        this.updateUI();
    }
    
    startTimer() {
        // Clear any existing timer
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            if (this.startTime) {
                const elapsed = Date.now() - this.startTime;
                const timerElement = document.getElementById('timer');
                if (timerElement) {
                    timerElement.textContent = this.formatTime(Math.floor(elapsed / 1000));
                }
            }
        }, 1000);
    }
    
    resetTimer() {
        this.startTime = Date.now();
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateAttempts() {
        document.getElementById('attempts').textContent = this.attempts;
    }
    
    updateUI() {
        document.getElementById('userElo').textContent = Math.round(this.userStats.elo);
        document.getElementById('userPoints').textContent = this.userStats.points;
        document.getElementById('userStreak').textContent = this.userStats.streak;
    }
    
    addReward(text) {
        const rewardsList = document.getElementById('rewardsList');
        const rewardItem = document.createElement('div');
        rewardItem.className = 'reward-item';
        rewardItem.innerHTML = `
            <i class="fas fa-star"></i>
            <span>${text}</span>
        `;
        
        rewardsList.insertBefore(rewardItem, rewardsList.firstChild);
        
        // Keep only last 5 rewards
        while (rewardsList.children.length > 5) {
            rewardsList.removeChild(rewardsList.lastChild);
        }
    }
    
    checkAchievements() {
        const achievements = [];
        
        if (this.userStats.puzzlesSolved === 1) {
            achievements.push({
                title: "First Steps",
                description: "You've solved your first puzzle!",
                points: 50
            });
        }
        
        if (this.userStats.streak === 5) {
            achievements.push({
                title: "On Fire!",
                description: "5 puzzles in a row!",
                points: 100
            });
        }
        
        if (this.userStats.elo >= 1500) {
            achievements.push({
                title: "Rising Star",
                description: "Reached 1500 ELO!",
                points: 200
            });
        }
        
        if (achievements.length > 0) {
            this.showAchievementModal(achievements[0]);
            this.userStats.points += achievements[0].points;
            this.addReward(`Achievement: ${achievements[0].title} +${achievements[0].points} points`);
        }
    }
    
    showAchievementModal(achievement) {
        const modal = document.getElementById('achievementModal');
        document.getElementById('achievementTitle').textContent = achievement.title;
        document.getElementById('achievementDescription').textContent = achievement.description;
        document.querySelector('.achievement-reward span').textContent = `+${achievement.points} points`;
        
        modal.classList.add('show');
    }
    
    saveUserStats() {
        localStorage.setItem('chessPuzzleStats', JSON.stringify(this.userStats));
    }
    
    loadUserStats() {
        const saved = localStorage.getItem('chessPuzzleStats');
        if (saved) {
            this.userStats = { ...this.userStats, ...JSON.parse(saved) };
        }
    }
}

// Global functions for modal interactions
function closeAchievementModal() {
    document.getElementById('achievementModal').classList.remove('show');
}

function nextPuzzle() {
    if (window.puzzleSimulator) {
        window.puzzleSimulator.nextPuzzle();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit more to ensure all libraries are loaded
    setTimeout(() => {
        window.puzzleSimulator = new ChessPuzzleSimulator();
    }, 200);
});
