
function simulateGame(rows, cols) {
    let board = Array(rows).fill(0).map(() => Array(cols).fill(0));
    let rowCounts = Array(rows).fill(0);
    let colCounts = Array(cols).fill(0);
    let turn = 1; // 1 for P1, 2 for P2

    while (true) {
        let legalMoves = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const isOccupied = board[r][c] > 0;
                const rowFull = rowCounts[r] >= 2;
                const colFull = colCounts[c] >= 2;
                const isIntersection = rowCounts[r] > 0 && colCounts[c] > 0;

                if (!isOccupied && !rowFull && !colFull && !isIntersection) {
                    legalMoves.push({ r, c });
                }
            }
        }

        if (legalMoves.length === 0) {
            // Turn player has no moves, so the other player wins.
            return turn === 1 ? 2 : 1;
        }

        // Pick a random legal move
        const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        board[move.r][move.c] = turn;
        rowCounts[move.r]++;
        colCounts[move.c]++;
        
        turn = turn === 1 ? 2 : 1;
    }
}

const M = 6;
const N = 10;
const iterations = 20;
let p1Wins = 0;
let p2Wins = 0;

console.log(`Simulation starting for M=${M}, N=${N}, Total ${iterations} games...`);
for (let i = 1; i <= iterations; i++) {
    const winner = simulateGame(M, N);
    if (winner === 1) p1Wins++;
    else p2Wins++;
    console.log(`Game ${i.toString().padStart(2, ' ')}: Winner is Player ${winner}`);
}

console.log("\nSummary:");
console.log(`Total Games: ${iterations}`);
console.log(`Player 1 (先手) Wins: ${p1Wins}`);
console.log(`Player 2 (後手) Wins: ${p2Wins}`);
