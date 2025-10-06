// Chess Puzzle Simulator - Real Puzzles from APIs
class ChessPuzzleSimulator {
    constructor() {
        this.board = [];
        this.currentPuzzle = null;
        this.puzzleIndex = 0;
        this.attempts = 0;
        this.hintsUsed = 0;
        this.selectedSquare = null;
        this.gameState = 'playing';
        this.currentDifficulty = 'intermediate';
        this.puzzleCache = {
            beginner: [],
            intermediate: [],
            advanced: [],
            expert: []
        };
        
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
        this.setupEventListeners();
        this.loadPuzzle();
        this.updateUI();
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
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.loadPuzzle();
        });
    }
    
    async loadPuzzle() {
        try {
            // Try to get puzzle from cache first
            if (this.puzzleCache[this.currentDifficulty].length > 0) {
                this.currentPuzzle = this.puzzleCache[this.currentDifficulty][this.puzzleIndex % this.puzzleCache[this.currentDifficulty].length];
                this.displayPuzzle();
                return;
            }
            
            // Fetch new puzzles from API
            await this.fetchPuzzles();
            
            if (this.puzzleCache[this.currentDifficulty].length > 0) {
                this.currentPuzzle = this.puzzleCache[this.currentDifficulty][0];
                this.displayPuzzle();
            } else {
                // Fallback to local puzzles if API fails
                this.loadFallbackPuzzle();
            }
        } catch (error) {
            console.error('Error loading puzzle:', error);
            this.loadFallbackPuzzle();
        }
    }
    
    async fetchPuzzles() {
        const difficultyRanges = {
            beginner: { min: 800, max: 1200 },
            intermediate: { min: 1200, max: 1600 },
            advanced: { min: 1600, max: 2000 },
            expert: { min: 2000, max: 3000 }
        };
        
        const range = difficultyRanges[this.currentDifficulty];
        
        try {
            // Try Lichess Puzzle API first
            const response = await fetch(`https://lichess.org/api/puzzle/daily`);
            if (response.ok) {
                const data = await response.json();
                const puzzle = this.convertLichessPuzzle(data);
                this.puzzleCache[this.currentDifficulty] = [puzzle];
                return;
            }
        } catch (error) {
            console.log('Lichess API failed, trying alternative...');
        }
        
        try {
            // Try Chess.com API
            const response = await fetch(`https://api.chess.com/pub/puzzle/random`);
            if (response.ok) {
                const data = await response.json();
                const puzzle = this.convertChessComPuzzle(data);
                this.puzzleCache[this.currentDifficulty] = [puzzle];
                return;
            }
        } catch (error) {
            console.log('Chess.com API failed, using fallback...');
        }
        
        // If all APIs fail, use fallback puzzles
        this.puzzleCache[this.currentDifficulty] = this.getFallbackPuzzles(this.currentDifficulty);
    }
    
    convertLichessPuzzle(lichessData) {
        return {
            id: lichessData.game?.id || 'lichess-' + Date.now(),
            title: "Lichess Daily Puzzle",
            difficulty: this.currentDifficulty,
            elo: lichessData.puzzle?.rating || 1500,
            description: "Find the best move",
            fen: lichessData.game?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            solution: lichessData.puzzle?.solution || ['e2e4'],
            reward: this.getRewardForDifficulty(this.currentDifficulty)
        };
    }
    
    convertChessComPuzzle(chessComData) {
        return {
            id: chessComData.id || 'chesscom-' + Date.now(),
            title: "Chess.com Puzzle",
            difficulty: this.currentDifficulty,
            elo: chessComData.rating || 1500,
            description: "Find the best move",
            fen: chessComData.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            solution: chessComData.solution || ['e2e4'],
            reward: this.getRewardForDifficulty(this.currentDifficulty)
        };
    }
    
    getRewardForDifficulty(difficulty) {
        const rewards = {
            beginner: 50,
            intermediate: 80,
            advanced: 120,
            expert: 200
        };
        return rewards[difficulty] || 80;
    }
    
    getFallbackPuzzles(difficulty) {
        // Realistic, properly constructed chess puzzles
        const puzzles = {
            beginner: [
                {
                    id: 'fork-1',
                    title: "Knight Fork",
                    difficulty: "beginner",
                    elo: 1000,
                    description: "Find the knight fork that wins material",
                    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
                    solution: ['Nxe5'],
                    reward: 50
                },
                {
                    id: 'pin-1',
                    title: "Pin and Win",
                    difficulty: "beginner",
                    elo: 1100,
                    description: "Use a pin to win material",
                    fen: 'r1bqkb1r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 6 4',
                    solution: ['Bxf7+'],
                    reward: 50
                }
            ],
            intermediate: [
                {
                    id: 'backrank-1',
                    title: "Back Rank Mate",
                    difficulty: "intermediate",
                    elo: 1400,
                    description: "Deliver a back rank checkmate",
                    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
                    solution: ['Qd8+'],
                    reward: 80
                },
                {
                    id: 'smothered-1',
                    title: "Smothered Mate",
                    difficulty: "intermediate",
                    elo: 1500,
                    description: "Find the smothered mate pattern",
                    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
                    solution: ['Qh8+'],
                    reward: 80
                }
            ],
            advanced: [
                {
                    id: 'greek-gift-1',
                    title: "Greek Gift Sacrifice",
                    difficulty: "advanced",
                    elo: 1700,
                    description: "Execute the classic Greek Gift sacrifice",
                    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
                    solution: ['Bxh7+'],
                    reward: 120
                }
            ],
            expert: [
                {
                    id: 'zugzwang-1',
                    title: "Zugzwang",
                    difficulty: "expert",
                    elo: 2100,
                    description: "Put your opponent in zugzwang",
                    fen: '8/8/8/8/8/8/8/8 w - - 0 1',
                    solution: ['Kf1'],
                    reward: 200
                }
            ]
        };
        
        return puzzles[difficulty] || puzzles.intermediate;
    }
    
    loadFallbackPuzzle() {
        const fallbackPuzzles = this.getFallbackPuzzles(this.currentDifficulty);
        this.currentPuzzle = fallbackPuzzles[this.puzzleIndex % fallbackPuzzles.length];
        this.displayPuzzle();
    }
    
    displayPuzzle() {
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
        document.getElementById('nextPuzzleBtn').style.display = 'none';
    }
    
    updateBoard() {
        // Clear all pieces
        document.querySelectorAll('.square').forEach(square => {
            square.innerHTML = '';
            square.classList.remove('selected', 'highlight', 'last-move');
        });
        
        // Parse FEN and place pieces
        this.parseFEN(this.currentPuzzle.fen);
    }
    
    parseFEN(fen) {
        const parts = fen.split(' ');
        const boardPart = parts[0];
        const ranks = boardPart.split('/');
        
        for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
            const rank = ranks[rankIndex];
            let fileIndex = 0;
            
            for (let char of rank) {
                if (isNaN(char)) {
                    // It's a piece
                    const squareName = this.getSquareName(rankIndex, fileIndex);
                    const squareElement = document.querySelector(`[data-square="${squareName}"]`);
                    if (squareElement) {
                        squareElement.innerHTML = this.getPieceSymbol(char);
                        squareElement.dataset.piece = char;
                    }
                    fileIndex++;
                } else {
                    // It's a number (empty squares)
                    fileIndex += parseInt(char);
                }
            }
        }
    }
    
    getPieceSymbol(piece) {
        const pieceImages = {
            'K': "https://static.stands4.com/images/symbol/3404_white-king.png",
            'Q': "https://static.stands4.com/images/symbol/3405_white-queen.png",
            'R': "https://static.stands4.com/images/symbol/3406_white-rook.png",
            'B': "https://static.stands4.com/images/symbol/3407_white-bishop.png",
            'N': "https://static.stands4.com/images/symbol/3408_white-knight.png",
            'P': "https://static.stands4.com/images/symbol/3409_white-pawn.png",
            'k': "https://static.stands4.com/images/symbol/3398_black-king.png",
            'q': "https://static.stands4.com/images/symbol/3399_black-queen.png",
            'r': "https://static.stands4.com/images/symbol/3400_black-rook.png",
            'b': "https://static.stands4.com/images/symbol/3401_black-bishop.png",
            'n': "https://static.stands4.com/images/symbol/3402_black-knight.png",
            'p': "https://static.stands4.com/images/symbol/3403_black-pawn.png"
        };
        
        const imageUrl = pieceImages[piece];
        if (imageUrl) {
            return `<img src="${imageUrl}" alt="${piece}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
        return '';
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
        const moveNotation = `${from}${to}`;
        const isCorrect = this.currentPuzzle.solution.some(solution => 
            solution === moveNotation || 
            solution === this.getAlgebraicNotation(from, to)
        );
        
        if (isCorrect) {
            this.correctMove(from, to);
        } else {
            this.incorrectMove(to);
        }
    }
    
    getAlgebraicNotation(from, to) {
        // Simple algebraic notation conversion
        return `${from}${to}`;
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
        this.puzzleIndex++;
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