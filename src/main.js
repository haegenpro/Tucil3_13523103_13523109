import fs from 'fs';
import { Board, Car } from './board.js';
import { uniformedCostSearch, greedyBestFirstSearch, aStarSearch } from './search.js';

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
    
    let maxRow = A;
    let maxCol = B;

    let exitPos = null;

    for (let r = 0; r < boardLines.length; r++) {
        const rowStr = boardLines[r];
        for (let c = 0; c < rowStr.length; c++) {
        if (rowStr[c] === 'K') {
            exitPos = { row: r, col: c };
            if (r >= maxRow) maxRow = r + 1;
            if (c >= maxCol) maxCol = c + 1;
        }
        }
    }

    const grid = [];
    for (let r = 0; r < maxRow; r++) {
        const rowStr = boardLines[r] || '';
        const rowArr = [];
        for (let c = 0; c < maxCol; c++) {
        rowArr.push(rowStr[c] || '.');
        }
        grid.push(rowArr);
    }

    const carsInfo = {};
    for (let r = 0; r < maxRow; r++) {
        for (let c = 0; c < maxCol; c++) {
            const ch = grid[r][c];
            if (ch === '.' || ch === 'K') continue;
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

    return new Board(maxRow, cars, exitPos);
}

const board = parseInput(fileContent);
console.log('Papan Awal:');
console.log(board.printBoard());

const solutionNode = uniformedCostSearch(board, board);

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
}
