# Chess Puzzle Simulator

A modern, interactive chess puzzle website that challenges players with increasingly difficult puzzles while tracking their ELO rating and rewarding progress.

## Features

### 🎯 Puzzle System
- **8 Difficulty Levels**: From Beginner (1200 ELO) to Expert (2300+ ELO)
- **Diverse Puzzle Types**: Forks, pins, back rank mates, smothered mates, Greek gifts, windmills, and more
- **Progressive Difficulty**: Puzzles get harder as your ELO increases
- **Hint System**: Up to 3 hints per puzzle with point penalties

### 📊 ELO Rating System
- **Dynamic Rating**: Your ELO changes based on puzzle difficulty and performance
- **Performance Factors**: Time taken, number of attempts, and hints used affect rating changes
- **Skill Tracking**: Watch your chess skills improve over time

### 🏆 Rewards & Achievements
- **Point System**: Earn points for solving puzzles quickly and efficiently
- **Achievement Unlocks**: Special rewards for milestones and streaks
- **Progress Tracking**: Monitor your improvement with detailed statistics

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Chess Board**: Drag and drop pieces with visual feedback
- **Real-time Statistics**: Live updates of your ELO, points, and streak
- **Smooth Animations**: Polished interactions and visual effects

## How to Play

1. **Start a Puzzle**: The game loads with a chess position and objective
2. **Find the Solution**: Look for the best move or sequence of moves
3. **Make Your Move**: Drag pieces to execute your solution
4. **Get Feedback**: Correct moves are highlighted in green, incorrect in red
5. **Earn Rewards**: Gain points and ELO based on your performance
6. **Progress**: Unlock achievements and face harder puzzles as you improve

## Technical Features

- **Chess.js Integration**: Full chess logic and move validation
- **Chessboard.js**: Interactive board with piece dragging
- **Local Storage**: Your progress is automatically saved
- **Responsive CSS Grid**: Modern layout that adapts to any screen size
- **Modular JavaScript**: Clean, maintainable code structure

## Getting Started

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" and choose "main"
4. Your site will be live at `https://yourusername.github.io/chess-puzzle-simulator`

### Option 2: Local Development
1. Clone the repository
2. Open `index.html` in your web browser
3. Start solving puzzles!

## File Structure

```
chess-puzzle-simulator/
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling
├── script.js           # Game logic and interactions
└── README.md           # This file
```

## Puzzle Database

The game includes 8 carefully selected puzzles covering:

- **Tactical Patterns**: Forks, pins, skewers
- **Checkmate Patterns**: Back rank, smothered mate
- **Sacrifices**: Greek gift, windmill attacks
- **Endgames**: Complex king and pawn endings
- **Positional Play**: Zugzwang and strategic concepts

## Customization

### Adding New Puzzles
Edit the `getPuzzleDatabase()` function in `script.js` to add your own puzzles:

```javascript
{
    id: 9,
    title: "Your Puzzle Title",
    difficulty: "Intermediate",
    elo: 1600,
    description: "What the player needs to find",
    fen: "fen-string-here",
    solution: ["move1", "move2", "move3"],
    reward: 100
}
```

### Modifying ELO System
Adjust the `calculateEloChange()` function to change how ratings are calculated.

### Styling Changes
Modify `styles.css` to customize colors, fonts, and layout.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the chess puzzle simulator!

## License

This project is open source and available under the MIT License.
