// Chess Puzzle Simulator - Custom Implementation
class ChessPuzzleSimulator {
    constructor() {
        this.board = [];
        this.currentPuzzle = null;
        this.puzzleIndex = 0;
        this.attempts = 0;
        this.hintsUsed = 0;
        this.selectedSquare = null;
        this.gameState = 'playing';
        
        // User stats
        this.userStats = {
            elo: 0,
            points: 0,
            streak: 0,
            puzzlesSolved: 0
        };
        
        // Load saved stats
        this.loadUserStats();
        
        // Initialize the application
        this.init();
    }
    
    init() {
        this.createChessboard();
        this.loadPuzzle();
        this.updateUI();
        this.setupEventListeners();
    }
    
    createChessboard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';
        
        // Create 8x8 grid
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                square.dataset.square = this.getSquareName(row, col);
                
                // Alternate colors
                if ((row + col) % 2 === 0) {
                    square.classList.add('light');
                } else {
                    square.classList.add('dark');
                }
                
                square.addEventListener('click', () => this.onSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }
    
    getSquareName(row, col) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return files[col] + ranks[row];
    }
    
    getSquareFromName(squareName) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const col = files.indexOf(squareName[0]);
        const row = ranks.indexOf(squareName[1]);
        return { row, col };
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
                position: {
                    'a8': 'r', 'b8': 'n', 'c8': 'b', 'd8': 'q', 'e8': 'k', 'f8': 'b', 'g8': 'n', 'h8': 'r',
                    'a7': 'p', 'b7': 'p', 'c7': 'p', 'd7': 'p', 'e7': 'p', 'f7': 'p', 'g7': 'p', 'h7': 'p',
                    'a6': '', 'b6': '', 'c6': 'n', 'd6': '', 'e6': '', 'f6': 'n', 'g6': '', 'h6': '',
                    'a5': '', 'b5': '', 'c5': '', 'd5': '', 'e5': 'p', 'f5': '', 'g5': '', 'h5': '',
                    'a4': '', 'b4': '', 'c4': 'B', 'd4': '', 'e4': 'P', 'f4': '', 'g4': '', 'h4': '',
                    'a3': '', 'b3': '', 'c3': '', 'd3': 'P', 'e3': '', 'f3': 'N', 'g3': '', 'h3': '',
                    'a2': 'P', 'b2': 'P', 'c2': 'P', 'd2': '', 'e2': 'P', 'f2': 'P', 'g2': 'P', 'h2': 'P',
                    'a1': 'R', 'b1': 'N', 'c1': 'B', 'd1': 'Q', 'e1': 'K', 'f1': '', 'g1': '', 'h1': 'R'
                },
                solution: ['Bxf7+'],
                reward: 50
            },
            {
                id: 2,
                title: "Pin and Win",
                difficulty: "Beginner",
                elo: 1300,
                description: "Use a pin to win material",
                position: {
                    'a8': 'r', 'b8': 'n', 'c8': 'b', 'd8': 'q', 'e8': 'k', 'f8': 'b', 'g8': 'n', 'h8': 'r',
                    'a7': 'p', 'b7': 'p', 'c7': 'p', 'd7': 'p', 'e7': 'p', 'f7': 'p', 'g7': 'p', 'h7': 'p',
                    'a6': '', 'b6': '', 'c6': 'n', 'd6': '', 'e6': '', 'f6': 'n', 'g6': '', 'h6': '',
                    'a5': '', 'b5': '', 'c5': 'b', 'd5': '', 'e5': 'p', 'f5': '', 'g5': '', 'h5': '',
                    'a4': '', 'b4': '', 'c4': 'B', 'd4': '', 'e4': 'P', 'f4': '', 'g4': '', 'h4': '',
                    'a3': '', 'b3': '', 'c3': '', 'd3': 'P', 'e3': '', 'f3': 'N', 'g3': '', 'h3': '',
                    'a2': 'P', 'b2': 'P', 'c2': 'P', 'd2': '', 'e2': 'P', 'f2': 'P', 'g2': 'P', 'h2': 'P',
                    'a1': 'R', 'b1': 'N', 'c1': 'B', 'd1': 'Q', 'e1': 'K', 'f1': '', 'g1': '', 'h1': 'R'
                },
                solution: ['Bxf7+'],
                reward: 60
            },
            {
                id: 3,
                title: "Back Rank Mate",
                difficulty: "Intermediate",
                elo: 1500,
                description: "Deliver a back rank checkmate",
                position: {
                    'a8': 'r', 'b8': '', 'c8': '', 'd8': '', 'e8': 'k', 'f8': '', 'g8': '', 'h8': 'r',
                    'a7': 'P', 'b7': 'p', 'c7': 'p', 'd7': 'p', 'e7': 'p', 'f7': 'p', 'g7': 'p', 'h7': 'p',
                    'a6': '', 'b6': 'b', 'c6': '', 'd6': '', 'e6': '', 'f6': 'n', 'g6': 'b', 'h6': 'N',
                    'a5': 'P', 'b5': '', 'c5': '', 'd5': '', 'e5': 'P', 'f5': '', 'g5': '', 'h5': '',
                    'a4': 'B', 'b4': 'B', 'c4': 'P', 'd4': 'P', 'e4': '', 'f4': '', 'g4': '', 'h4': '',
                    'a3': '', 'b3': 'q', 'c3': '', 'd3': 'P', 'e3': '', 'f3': 'N', 'g3': '', 'h3': '',
                    'a2': 'p', 'b2': 'P', 'c2': '', 'd2': 'P', 'e2': 'P', 'f2': 'P', 'g2': 'P', 'h2': 'P',
                    'a1': 'R', 'b1': '', 'c1': '', 'd1': 'Q', 'e1': 'K', 'f1': '', 'g1': '', 'h1': 'R'
                },
                solution: ['Qd8+'],
                reward: 80
            },
            {
                id: 4,
                title: "Smothered Mate",
                difficulty: "Intermediate",
                elo: 1600,
                description: "Find the smothered mate pattern",
                position: {
                    'a8': 'r', 'b8': 'n', 'c8': 'b', 'd8': 'q', 'e8': 'k', 'f8': 'b', 'g8': 'n', 'h8': 'r',
                    'a7': 'p', 'b7': 'p', 'c7': 'p', 'd7': 'p', 'e7': 'p', 'f7': 'p', 'g7': 'p', 'h7': 'p',
                    'a6': '', 'b6': '', 'c6': 'n', 'd6': '', 'e6': '', 'f6': 'n', 'g6': '', 'h6': '',
                    'a5': '', 'b5': '', 'c5': '', 'd5': '', 'e5': 'p', 'f5': '', 'g5': '', 'h5': '',
                    'a4': '', 'b4': '', 'c4': 'B', 'd4': '', 'e4': 'P', 'f4': '', 'g4': '', 'h4': '',
                    'a3': '', 'b3': '', 'c3': '', 'd3': 'P', 'e3': '', 'f3': 'N', 'g3': '', 'h3': '',
                    'a2': 'P', 'b2': 'P', 'c2': 'P', 'd2': '', 'e2': 'P', 'f2': 'P', 'g2': 'P', 'h2': 'P',
                    'a1': 'R', 'b1': 'N', 'c1': 'B', 'd1': 'Q', 'e1': 'K', 'f1': '', 'g1': '', 'h1': 'R'
                },
                solution: ['Qh8+'],
                reward: 100
            },
            {
                id: 5,
                title: "Greek Gift Sacrifice",
                difficulty: "Advanced",
                elo: 1800,
                description: "Execute the classic Greek Gift sacrifice",
                position: {
                    'a8': 'r', 'b8': 'n', 'c8': 'b', 'd8': 'q', 'e8': 'k', 'f8': 'b', 'g8': 'n', 'h8': 'r',
                    'a7': 'p', 'b7': 'p', 'c7': 'p', 'd7': 'p', 'e7': 'p', 'f7': 'p', 'g7': 'p', 'h7': 'p',
                    'a6': '', 'b6': '', 'c6': 'n', 'd6': '', 'e6': '', 'f6': 'n', 'g6': '', 'h6': '',
                    'a5': '', 'b5': '', 'c5': '', 'd5': '', 'e5': 'p', 'f5': '', 'g5': '', 'h5': '',
                    'a4': '', 'b4': '', 'c4': 'B', 'd4': '', 'e4': 'P', 'f4': '', 'g4': '', 'h4': '',
                    'a3': '', 'b3': '', 'c3': '', 'd3': 'P', 'e3': '', 'f3': 'N', 'g3': '', 'h3': '',
                    'a2': 'P', 'b2': 'P', 'c2': 'P', 'd2': '', 'e2': 'P', 'f2': 'P', 'g2': 'P', 'h2': 'P',
                    'a1': 'R', 'b1': 'N', 'c1': 'B', 'd1': 'Q', 'e1': 'K', 'f1': '', 'g1': '', 'h1': 'R'
                },
                solution: ['Bxh7+'],
                reward: 150
            }
        ];
    }
    
    loadPuzzle() {
        const puzzles = this.getPuzzleDatabase();
        this.currentPuzzle = puzzles[this.puzzleIndex];
        
        // Update UI
        document.getElementById('puzzleTitle').textContent = this.currentPuzzle.title;
        document.getElementById('puzzleDifficulty').textContent = this.currentPuzzle.difficulty;
        document.getElementById('puzzleElo').textContent = this.currentPuzzle.elo;
        document.getElementById('puzzleDescription').textContent = this.currentPuzzle.description;
        
        // Reset puzzle state
        this.attempts = 0;
        this.hintsUsed = 0;
        this.selectedSquare = null;
        this.gameState = 'playing';
        this.updateAttempts();
        this.updateBoard();
    }
    
    updateBoard() {
        // Clear all pieces
        document.querySelectorAll('.square').forEach(square => {
            square.innerHTML = '';
            square.classList.remove('selected', 'highlight', 'last-move');
        });
        
        // Place pieces
        Object.entries(this.currentPuzzle.position).forEach(([square, piece]) => {
            if (piece) {
                const squareElement = document.querySelector(`[data-square="${square}"]`);
                if (squareElement) {
                    squareElement.innerHTML = this.getPieceSymbol(piece);
                    squareElement.dataset.piece = piece;
                }
            }
        });
    }
    
    getPieceSymbol(piece) {
        const symbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        return symbols[piece] || '';
    }
    
    onSquareClick(row, col) {
        if (this.gameState !== 'playing') return;
        
        const squareName = this.getSquareName(row, col);
        const squareElement = document.querySelector(`[data-square="${squareName}"]`);
        const piece = squareElement.dataset.piece;
        
        if (this.selectedSquare) {
            // Try to make a move
            this.attemptMove(this.selectedSquare, squareName);
            this.clearSelection();
        } else if (piece) {
            // Select a piece
            this.selectSquare(squareName);
        }
    }
    
    selectSquare(squareName) {
        this.clearSelection();
        this.selectedSquare = squareName;
        const squareElement = document.querySelector(`[data-square="${squareName}"]`);
        squareElement.classList.add('selected');
    }
    
    clearSelection() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'highlight');
        });
        this.selectedSquare = null;
    }
    
    attemptMove(from, to) {
        this.attempts++;
        this.updateAttempts();
        
        // Check if this is the correct move
        if (this.currentPuzzle.solution.includes(`${from}${to}`) || 
            this.currentPuzzle.solution.includes(this.getMoveNotation(from, to))) {
            this.correctMove(from, to);
        } else {
            this.incorrectMove(to);
        }
    }
    
    correctMove(from, to) {
        // Move the piece
        const fromElement = document.querySelector(`[data-square="${from}"]`);
        const toElement = document.querySelector(`[data-square="${to}"]`);
        const piece = fromElement.dataset.piece;
        
        toElement.innerHTML = this.getPieceSymbol(piece);
        toElement.dataset.piece = piece;
        fromElement.innerHTML = '';
        fromElement.dataset.piece = '';
        
        // Highlight the move
        fromElement.classList.add('last-move');
        toElement.classList.add('last-move');
        
        // Check if puzzle is complete
        if (this.attempts >= this.currentPuzzle.solution.length) {
            this.puzzleSolved();
        }
    }
    
    incorrectMove(to) {
        const toElement = document.querySelector(`[data-square="${to}"]`);
        toElement.classList.add('incorrect');
        setTimeout(() => {
            toElement.classList.remove('incorrect');
        }, 1000);
    }
    
    getMoveNotation(from, to) {
        // Simple move notation for puzzle checking
        return `${from}${to}`;
    }
    
    puzzleSolved() {
        this.gameState = 'solved';
        
        // Calculate points and ELO change
        const basePoints = this.currentPuzzle.reward;
        const hintPenalty = this.hintsUsed * 10;
        const pointsEarned = Math.max(10, basePoints - hintPenalty);
        
        // ELO calculation (simplified)
        const eloChange = this.calculateEloChange(this.currentPuzzle.elo, this.attempts);
        
        // Update user stats
        this.userStats.points += pointsEarned;
        this.userStats.elo += eloChange;
        this.userStats.streak++;
        this.userStats.puzzlesSolved++;
        
        // Save stats
        this.saveUserStats();
        
        // Show success modal
        this.showGameOverModal(pointsEarned, eloChange);
        
        // Add reward to list
        this.addReward(`Puzzle solved! +${pointsEarned} points`);
        
        // Check for achievements
        this.checkAchievements();
        
        // Show next puzzle button
        document.getElementById('nextPuzzleBtn').style.display = 'inline-flex';
    }
    
    calculateEloChange(puzzleElo, attempts) {
        const expectedScore = 1 / (1 + Math.pow(10, (puzzleElo - this.userStats.elo) / 400));
        const actualScore = 1; // Solved the puzzle
        const kFactor = 32;
        
        let eloChange = Math.round(kFactor * (actualScore - expectedScore));
        
        // Attempt penalty
        if (attempts > 3) eloChange -= 5;
        
        return eloChange;
    }
    
    showGameOverModal(pointsEarned, eloChange) {
        const modal = document.getElementById('gameOverModal');
        
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
        this.attempts = 0;
        this.hintsUsed = 0;
        this.selectedSquare = null;
        this.gameState = 'playing';
        this.updateAttempts();
        this.updateBoard();
        this.clearSelection();
        document.getElementById('nextPuzzleBtn').style.display = 'none';
    }
    
    nextPuzzle() {
        // Close modals
        document.getElementById('gameOverModal').classList.remove('show');
        document.getElementById('achievementModal').classList.remove('show');
        
        // Move to next puzzle
        this.puzzleIndex = (this.puzzleIndex + 1) % this.getPuzzleDatabase().length;
        this.loadPuzzle();
        this.updateUI();
        document.getElementById('nextPuzzleBtn').style.display = 'none';
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
    window.puzzleSimulator = new ChessPuzzleSimulator();
});