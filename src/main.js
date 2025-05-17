import fs from 'fs';
import { Board, Car, makeCompleteGoalBoard } from './board.js';
import { uniformedCostSearch, greedyBestFirstSearch, aStarSearch} from './search.js';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node main.js <inputfile.txt>');
  process.exit(1);
}

const fileContent = fs.readFileSync(inputFile, 'utf-8');

function parseInput(input) {
    const lines = input.trim().split('\n');
    let [A, B] = lines[0].split(' ').map(Number);
    const N = Number(lines[1]);

    const boardLines = lines.slice(2);
    let maxRow = boardLines.length;
    let maxCol = boardLines.length === A ? B + 1 : B;

    let exitPos = null;
    let exitOrientation = null;

    for (let r = 0; r < boardLines.length; r++) {
        const rowStr = boardLines[r];
        for (let c = 0; c < rowStr.length; c++) {
            if (rowStr[c] === 'K') {
                let exitRow = r;
                let exitCol = c;

                if (r === 0) exitOrientation = 'V'; // top edge, vertical exit
                else if (r === A) exitOrientation = 'V'; // bottom edge, vertical exit
                else if (c === 0) exitOrientation = 'H'; // left edge, horizontal exit
                else if (c === B) exitOrientation = 'H'; // right edge, horizontal exit

                if (exitOrientation === 'V') {
                    if (r === 0) exitRow = -1;
                    else if (r === A) exitRow = A;
                } else if (exitOrientation === 'H') {
                    if (c === 0) exitCol = -1;
                    else if (c === B) exitCol = B;
                }
                exitPos = { row: exitRow, col: exitCol };
                console.log(`Exit found at (${exitRow}, ${exitCol})`);
            }
        }
    }
    console.log(maxRow, maxCol);
    const grid = [];
    for (let r = 0; r < maxRow; r++) {
        if (exitOrientation === 'V' && (r === 0 || r === A)) {
            if ((exitPos.row === -1 && r === 0) || (exitPos.row === A && r === A)) {
                continue;
            }
        }
        const rawLine = boardLines[r] || '';
        let rowArr = [];

        let kIndex = rawLine.indexOf('K');
        if (kIndex !== -1) {
            if (exitOrientation === 'H') {
                let lineWithoutK = rawLine.slice(0, kIndex) + rawLine.slice(kIndex + 1);
                rowArr = lineWithoutK.trimStart().split('');
            } else {
                rowArr = rawLine.trimStart().split('');
            }
        } else {
            rowArr = rawLine.trimStart().split('');
        }

        while (rowArr.length < maxCol) {
            rowArr.push(' ');
        }
        grid.push(rowArr);
    }

    const carsInfo = {};
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            const ch = grid[r][c];
            if (ch === ' ' || ch === 'K' || ch === '.') continue;
            if (!carsInfo[ch]) carsInfo[ch] = [];
            carsInfo[ch].push([r, c]);
        }
    }

    const cars = [];
    for (const [id, coords] of Object.entries(carsInfo)) {
        coords.sort(([r1, c1], [r2, c2]) => r1 - r2 || c1 - c2);
        const rows = new Set(coords.map(([r]) => r));
        const orientation = rows.size === 1 ? 'H' : 'V';
        const length = coords.length;
        const [startRow, startCol] = coords[0];
        const isTarget = id === 'P';
        cars.push(new Car(id, startRow, startCol, length, orientation, isTarget));
    }

    return new Board(grid.length, cars, exitPos);
}

const board = parseInput(fileContent);
console.log('Papan Awal:');
board.printBoard();
/*const goalBoard = makeCompleteGoalBoard(board);
console.log('Papan Tujuan:');
console.log(goalBoard.printBoard());

const solutionNode = uniformedCostSearch(board, goalBoard);

if (solutionNode) {
    const path = [];
    let node = solutionNode;
    while (node) {
        path.push(node);
        node = node.parent;
    }
    path.reverse();

    path.forEach((node, i) => {
        if (i === 0) return;

        const move = node.move;

        const car = node.board.cars.find(c => c.id === move.id);
        let direction = '';

        if (car.orientation === 'H') {
            direction = move.delta > 0 ? 'kanan' : 'kiri';
        } else {
            direction = move.delta > 0 ? 'bawah' : 'atas';
        }
        console.log(`\nGerakan ${i}: ${move.id}-${direction}`);
        node.board.printBoard(move);
    });
} else {
    console.log('No solution found');
}*/
