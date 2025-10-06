// Script to fetch all Lichess daily puzzles and embed them in the website
// This will run separately to collect puzzle data

const fs = require('fs');
const https = require('https');

class LichessPuzzleFetcher {
    constructor() {
        this.puzzles = [];
        this.currentDate = new Date('2020-01-01'); // Start from 2020
        this.endDate = new Date(); // Today
        this.delay = 1000; // 1 second delay between requests
    }

    async fetchPuzzle(date) {
        const dateStr = date.toISOString().split('T')[0];
        const url = `https://lichess.org/api/puzzle/daily/${dateStr}`;
        
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const puzzle = JSON.parse(data);
                        resolve(puzzle);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    async fetchAllPuzzles() {
        console.log('Starting to fetch Lichess daily puzzles...');
        console.log(`From: ${this.currentDate.toISOString().split('T')[0]}`);
        console.log(`To: ${this.endDate.toISOString().split('T')[0]}`);
        
        let successCount = 0;
        let errorCount = 0;
        
        while (this.currentDate <= this.endDate) {
            try {
                console.log(`Fetching puzzle for ${this.currentDate.toISOString().split('T')[0]}...`);
                const puzzle = await this.fetchPuzzle(this.currentDate);
                
                if (puzzle && puzzle.game && puzzle.puzzle) {
                    const processedPuzzle = {
                        id: puzzle.game.id,
                        date: this.currentDate.toISOString().split('T')[0],
                        title: `Daily Puzzle - ${this.currentDate.toISOString().split('T')[0]}`,
                        difficulty: this.getDifficultyFromRating(puzzle.puzzle.rating),
                        elo: puzzle.puzzle.rating,
                        description: "Find the best move",
                        fen: puzzle.game.fen,
                        solution: puzzle.puzzle.solution,
                        reward: this.getRewardFromRating(puzzle.puzzle.rating)
                    };
                    
                    this.puzzles.push(processedPuzzle);
                    successCount++;
                    console.log(`✓ Success: ${processedPuzzle.title} (Rating: ${puzzle.puzzle.rating})`);
                } else {
                    console.log(`✗ No puzzle data for ${this.currentDate.toISOString().split('T')[0]}`);
                    errorCount++;
                }
            } catch (error) {
                console.log(`✗ Error fetching ${this.currentDate.toISOString().split('T')[0]}: ${error.message}`);
                errorCount++;
            }
            
            // Move to next day
            this.currentDate.setDate(this.currentDate.getDate() + 1);
            
            // Delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, this.delay));
        }
        
        console.log(`\nFetching complete!`);
        console.log(`Success: ${successCount} puzzles`);
        console.log(`Errors: ${errorCount} puzzles`);
        console.log(`Total: ${this.puzzles.length} puzzles`);
        
        return this.puzzles;
    }

    getDifficultyFromRating(rating) {
        if (rating < 1200) return 'beginner';
        if (rating < 1600) return 'intermediate';
        if (rating < 2000) return 'advanced';
        return 'expert';
    }

    getRewardFromRating(rating) {
        if (rating < 1200) return 50;
        if (rating < 1600) return 80;
        if (rating < 2000) return 120;
        return 200;
    }

    generateJavaScriptFile() {
        const jsContent = `// Lichess Daily Puzzles Database
// Generated on ${new Date().toISOString()}
// Total puzzles: ${this.puzzles.length}

const LICHESS_PUZZLES = ${JSON.stringify(this.puzzles, null, 2)};

// Export for use in the main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LICHESS_PUZZLES;
} else {
    window.LICHESS_PUZZLES = LICHESS_PUZZLES;
}`;

        fs.writeFileSync('lichess-puzzles.js', jsContent);
        console.log('Generated lichess-puzzles.js with all puzzle data');
    }

    generateStats() {
        const stats = {
            total: this.puzzles.length,
            byDifficulty: {
                beginner: this.puzzles.filter(p => p.difficulty === 'beginner').length,
                intermediate: this.puzzles.filter(p => p.difficulty === 'intermediate').length,
                advanced: this.puzzles.filter(p => p.difficulty === 'advanced').length,
                expert: this.puzzles.filter(p => p.difficulty === 'expert').length
            },
            dateRange: {
                start: this.puzzles[0]?.date,
                end: this.puzzles[this.puzzles.length - 1]?.date
            },
            averageRating: Math.round(this.puzzles.reduce((sum, p) => sum + p.elo, 0) / this.puzzles.length)
        };

        console.log('\n=== PUZZLE STATISTICS ===');
        console.log(`Total Puzzles: ${stats.total}`);
        console.log(`Date Range: ${stats.dateRange.start} to ${stats.dateRange.end}`);
        console.log(`Average Rating: ${stats.averageRating}`);
        console.log('\nBy Difficulty:');
        console.log(`  Beginner: ${stats.byDifficulty.beginner}`);
        console.log(`  Intermediate: ${stats.byDifficulty.intermediate}`);
        console.log(`  Advanced: ${stats.byDifficulty.advanced}`);
        console.log(`  Expert: ${stats.byDifficulty.expert}`);
    }
}

// Run the fetcher
async function main() {
    const fetcher = new LichessPuzzleFetcher();
    
    try {
        await fetcher.fetchAllPuzzles();
        fetcher.generateJavaScriptFile();
        fetcher.generateStats();
        
        console.log('\n🎉 All done! The lichess-puzzles.js file is ready to be included in your website.');
        console.log('This file contains all the puzzle data and can be used offline.');
        
    } catch (error) {
        console.error('Error during fetching:', error);
    }
}

// Run if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = LichessPuzzleFetcher;
