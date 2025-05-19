import fs from 'fs';
import { Board, Car } from './board.js';
import { uniformCostSearch, greedyBestFirstSearch, aStarSearch, beamSearch} from './search.js';
import { error } from 'console';
import { parse } from 'path';

const inputFile = process.argv[2];
const algoArg = process.argv[3];
const heurArg = process.argv[4];

if (!inputFile) {
  console.error('Usage: node main.js <inputfile.txt>');
  process.exit(1);
}

const fileContent = fs.readFileSync(inputFile, 'utf-8');

function parseInput(input) {
    const lines = input.trim().split('\n').map(line => line.replace(/\r$/, ''));
    const headerRe = /^\s*(\d+)\s+(\d+)\s*$/;
    const m = headerRe.exec(lines[0]);
    if (!m) {
        throw new Error(`Baris 1 harus “A B”, tapi anda menginput: "${lines[0]}"`);
    }
    let [A, B] = lines[0].split(' ').map(Number);

    const singleIntRe = /^(\d+)$/;
    if (!singleIntRe.test(lines[1].trim())) {
        throw new Error(`Baris 2 harus integer tunggal, tapi anda menginput: "${lines[1]}"`);
    }
    const N = Number(lines[1]);

    var rawBoard = lines.slice(2); 
    const boardLinesValidate = rawBoard.map(row => row.trim());
    let exitOrientationValidate = null; 
    for (let r = 0; r < rawBoard.length; r++) {
        const row = rawBoard[r];
        for (let c = 0; c < row.length; c++) {
            if (row[c] === 'K') {
                if (r === 0 || r === A) exitOrientationValidate = 'V';
                else if (c === 0 || c === B) exitOrientationValidate = 'H';
            }
        }
    }

    const expectedRows = exitOrientationValidate === 'V' ? A + 1 : A; 
    if (boardLinesValidate.length !== expectedRows) {
        throw new Error(`Diperlukan tepat ${expectedRows} baris konfigurasi papan, tapi ada ${boardLinesValidate.length}.`);
    }

    const validCharRe = /^[\.A-PR-ZK]+$/; 
    for (let i = 0; i < boardLinesValidate.length; i++) {
        const row = boardLinesValidate[i];   
        if (exitOrientationValidate === 'V' && (i === 0 || i === boardLinesValidate.length - 1)) {
            if (row !== 'K' && i == boardLinesValidate.length - 1) {
                throw new Error(`Baris ${i + 3} untuk exit vertikal harus hanya 'K', tapi: "${row}"`);
            }
            if(row == 'K') break;
        }
        const hasExit = row.includes('K');
        const expectedLen = hasExit ? B + 1 : B;
        if (row.length !== expectedLen) {
            throw new Error(
                `Baris konfigurasi ke-${i + 3} panjangnya harus ${expectedLen}` + `${hasExit ? ` (termasuk 'K')` : ''}, tapi ${row.length}.`
            );
        }
        if (!validCharRe.test(row)) {
            throw new Error(`Karakter tidak valid di baris ${i + 3}: "${row}".` + ` Hanya diperbolehkan '.', 'P', 'K', dan huruf lainnya.`);
        }
    }

    var cKvertical; 
    if(exitOrientationValidate === 'V') {
        const firstRow  = rawBoard[0]; 
        const lastrRow = rawBoard[rawBoard.length - 1];
        if(firstRow.includes('K')){
            cKvertical = firstRow.indexOf('K');
        }
        else if(lastrRow.includes('K')){
            cKvertical = lastrRow.indexOf('K');
        }
    }

    const pCoords = [];
    const exitCoords = [];
    for (let r = 0; r < boardLinesValidate.length; r++) {
        const row = boardLinesValidate[r];

        if(exitOrientationValidate === 'V' && (r === 0 || r === boardLinesValidate.length - 1) && row.includes('K')) {
            exitCoords.push([r, cKvertical]);
            continue;
        }
        for (let c = 0; c < row.length; c++) {
            const ch = row[c];
            if (ch === 'P') pCoords.push([r, c]);
            if (ch === 'K') exitCoords.push([r, c]);
        }
    }
    if (pCoords.length < 2) {
        throw new Error(`Primary piece 'P' harus menempati minimal 2 sel, tapi ditemukan ${pCoords.length}.`);
    }
    if (exitCoords.length !== 1) {
        throw new Error(`Harus tepat 1 exit 'K', tapi ditemukan ${exitCoords.length}.`);
    }

    const pRows = new Set(pCoords.map(([r]) => r)); 
    const pCols = new Set(pCoords.map(([, c]) => c));
    let orientation;
    if (pRows.size === 1 && pCols.size > 1) orientation = 'H';
    else if (pCols.size === 1 && pRows.size > 1) orientation = 'V';
    else throw new Error(`Primary piece 'P' harus membentuk garis lurus horizontal atau vertikal.`);

    const [[er, ec]] = exitCoords;
    if (orientation === 'H') {
        const pr = [...pRows][0];
        if (er !== pr || (ec !== 0 && ec !== B)) {
            throw new Error(`Exit 'K' harus di baris ${pr} dan di kolom 0 atau ${B}, tapi di (${er},${ec}).`);
        }
    } else {
        const pc = [...pCols][0];
        if (ec !== pc || (er !== 0 && er !== A)) {
            throw new Error(`Exit 'K' harus di kolom ${pc} dan di baris 0 atau ${A}, tapi di (${er},${ec}).`);
        }
    }

    const gridValidate = []; 
    for (let r = 0; r < boardLinesValidate.length; r++) {
        if (exitOrientationValidate === 'V' && (r === 0 || r === boardLinesValidate.length - 1) && boardLinesValidate[r].includes('K')) continue;
        const rowArr = boardLinesValidate[r].split('');
        const kIndex = rowArr.indexOf('K');
        if (kIndex !== -1) rowArr.splice(kIndex, 1);
        gridValidate.push(rowArr);
    }

    const uniqueIds = new Set();
    gridValidate.forEach(row => row.forEach(ch => {
        if (ch !== '.' && ch !== 'P') uniqueIds.add(ch);
    }));
    if (uniqueIds.size !== N) {
        throw new Error(`N = ${N}, namun terdeteksi ${uniqueIds.size} jenis piece non-primary (${[...uniqueIds].join(',')}).`);
    }

    const carsInfoValidate = {}; 
    gridValidate.forEach((row, r) => row.forEach((ch, c) => {
        if (ch === '.') return;
        if (!carsInfoValidate[ch]) carsInfoValidate[ch] = [];
        carsInfoValidate[ch].push([r, c]);
    }));

    for (const [id, coords] of Object.entries(carsInfoValidate)) {
        coords.sort(([r1, c1], [r2, c2]) => r1 - r2 || c1 - c2);
        const rows = new Set(coords.map(([r]) => r));
        
        const ori = rows.size === 1 ? 'H' : 'V';
        for (let i = 1; i < coords.length; i++) {
            const [pr, pc] = coords[i - 1];
            const [cr, cc] = coords[i];
            if (ori === 'H' && (cr !== pr || cc !== pc + 1)) {
                throw new Error(`Piece '${id}' tidak kontigu horizontal di ${JSON.stringify(coords)}.`);
            }
            if (ori === 'V' && (cc !== pc || cr !== pr + 1)) {
                throw new Error(`Piece '${id}' tidak kontigu vertikal di ${JSON.stringify(coords)}.`);
            }
        }
    }

    // ============================================================================================== // 
    //                                          Batas Validasi                                        //
    // ============================================================================================== //

    const boardLines = lines.slice(2);
    let maxRow = boardLines.length;
    let maxCol = B;
    for (const line of boardLines) {
        if (line.length > B && (line[B] === 'K' || line[0] === 'K')) {
            maxCol = B + 1;
            break;
        }
    }
    let exitPos = null;
    let exitOrientation = null;

    for (let r = 0; r < boardLines.length; r++) {
        const rowStr = boardLines[r];
        for (let c = 0; c < rowStr.length; c++) {
            if (rowStr[c] === 'K') {
                let exitRow = r;
                let exitCol = c;

                if (r === 0) exitOrientation = 'V';
                else if (r === A) exitOrientation = 'V';
                else if (c === 0) exitOrientation = 'H';
                else if (c === B) exitOrientation = 'H';

                if (exitOrientation === 'V') {
                    if (r === 0) exitRow = -1;
                    else if (r === A) exitRow = A;
                } else if (exitOrientation === 'H') {
                    if (c === 0) exitCol = -1;
                    else if (c === B) exitCol = B;
                }
                exitPos = { row: exitRow, col: exitCol };
            }
        }
    }
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

    return new Board(grid.length, grid[0].length, cars, exitPos, exitOrientation);
}


const algorithm = parseInt(algoArg, 10);
const heuristic = parseInt(heurArg, 10);
const board = parseInput(fileContent);

const startTime = Date.now();
let solutionNode = null;
let expansions = 0;

switch (algorithm) {
    case 2: {
        const result = greedyBestFirstSearch(board, heuristic);
        solutionNode = result.node;
        expansions   = result.expansions;
        break;
    }
    case 3: {
        const result = aStarSearch(board, heuristic);
        solutionNode = result.node;
        expansions   = result.expansions;
        break;
    }
    case 4: {
        const result = beamSearch(board, 75, heuristic);
        solutionNode = result.node;
        expansions   = result.expansions;
        break;
    }
    case 1:
    default: {
        const result = uniformCostSearch(board, heuristic);
        solutionNode = result.node;
        expansions   = result.expansions;
        break;
    }
}

const endTime = Date.now();
const elapsedTime = endTime - startTime;

const path = [];
if (solutionNode) {
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
            direction = move.delta > 0 ? 'right' : 'left';
        } else {
            direction = move.delta > 0 ? 'down' : 'up';
        }
    });
    
}

let result;
if(path.length !== 0) {
    const serializedPath = path.map((node, idx) => {
    return {
        step: idx + 1,
        move: node.move,   
        board: node.board.grid,         
    }
    });

    result = {
        elapsedTime,
        expansions,
        solution: serializedPath
    }
}
else {
    result = {
        elapsedTime,
        expansions,
        solution: null
    }
}

console.log(JSON.stringify(result))
