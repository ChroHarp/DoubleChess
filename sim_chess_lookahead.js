
function getLegalMoves(rows, cols, board, rowCounts, colCounts) {
    let moves = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const isOccupied = board[r][c] > 0;
            const rowFull = rowCounts[r] >= 2;
            const colFull = colCounts[c] >= 2;
            const isIntersection = rowCounts[r] > 0 && colCounts[c] > 0;

            if (!isOccupied && !rowFull && !colFull && !isIntersection) {
                moves.push({ r, c });
            }
        }
    }
    return moves;
}

function simulateGame(rows, cols) {
    let board = Array(rows).fill(0).map(() => Array(cols).fill(0));
    let rowCounts = Array(rows).fill(0);
    let colCounts = Array(cols).fill(0);
    let turn = 1; // 1 for P1, 2 for P2

    while (true) {
        let legalMoves = getLegalMoves(rows, cols, board, rowCounts, colCounts);

        if (legalMoves.length === 0) {
            return turn === 1 ? 2 : 1;
        }

        // --- Lookahead Strategy ---
        // 1. Check if any move leads to immediate victory.
        let candidates = [];
        let winningMoves = [];

        for (let move of legalMoves) {
            // Simulate my move
            board[move.r][move.c] = turn;
            rowCounts[move.r]++;
            colCounts[move.c]++;

            let opponentMoves = getLegalMoves(rows, cols, board, rowCounts, colCounts);
            if (opponentMoves.length === 0) {
                winningMoves.push(move);
            } else {
                // Not an immediate win. Check if opponent can win on THEIR next move.
                let opponentCanWin = false;
                for (let oppMove of opponentMoves) {
                    // Simulate opponent's move
                    board[oppMove.r][oppMove.c] = (turn === 1 ? 2 : 1);
                    rowCounts[oppMove.r]++;
                    colCounts[oppMove.c]++;

                    let myNextMoves = getLegalMoves(rows, cols, board, rowCounts, colCounts);
                    if (myNextMoves.length === 0) {
                        opponentCanWin = true;
                    }

                    // Undo opponent's move
                    board[oppMove.r][oppMove.c] = 0;
                    rowCounts[oppMove.r]--;
                    colCounts[oppMove.c]--;

                    if (opponentCanWin) break;
                }

                if (!opponentCanWin) {
                    candidates.push(move);
                }
            }

            // Undo my move
            board[move.r][move.c] = 0;
            rowCounts[move.r]--;
            colCounts[move.c]--;
        }

        let selectedMove;
        if (winningMoves.length > 0) {
            // Win immediately if possible
            selectedMove = winningMoves[Math.floor(Math.random() * winningMoves.length)];
        } else if (candidates.length > 0) {
            // Avoid opponent's winning move if possible
            selectedMove = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
            // All moves result in possible loss, just pick randomly from legal ones
            selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }

        // Apply move
        board[selectedMove.r][selectedMove.c] = turn;
        rowCounts[selectedMove.r]++;
        colCounts[selectedMove.c]++;
        turn = turn === 1 ? 2 : 1;
    }
}

const M = 6;
const N = 10;
const iterations = 20;
let p1Wins = 0;
let p2Wins = 0;

console.log(`Simulation starting for M=${M}, N=${N}, Total ${iterations} games with Lookahead...`);
for (let i = 1; i <= iterations; i++) {
    const winner = simulateGame(M, N);
    if (winner === 1) p1Wins++;
    else p2Wins++;
    console.log(`Game ${i.toString().padStart(2, ' ')}: Winner is Player ${winner}`);
}

console.log("\nSummary (Strategized):");
console.log(`Total Games: ${iterations}`);
console.log(`Player 1 (先手) Wins: ${p1Wins}`);
console.log(`Player 2 (後手) Wins: ${p2Wins}`);
