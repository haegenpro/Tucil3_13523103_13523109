export class Car {

    constructor(id, row, col, length, orientation, isTarget = false) {
        this.id = id;
        this.row = row;
        this.col = col;
        this.length = length;
        this.orientation = orientation;
        this.isTarget = isTarget;
    }
}

export class Board {

    constructor(height, width, cars = [], exitPos, exitOrientation) {
        this.height = height;
        this.width = width;
        this.cars = cars;
        this.exit = exitPos;
        this.exitOrientation = exitOrientation;
        this.grid = this._createGrid();
        this._placeCars();
    }

    _createGrid() {
        return Array.from({ length: this.height }, () =>
        Array.from({ length: this.width }, () => null)
        );
    }

    _placeCars() {
        this.grid = this._createGrid();
        this.cars.forEach(({ id, row, col, length, orientation }) => {
            for (let offset = 0; offset < length; offset++) {
                const r = orientation === 'V' ? row + offset : row;
                const c = orientation === 'H' ? col + offset : col;
                this.grid[r][c] = id;
            }
        });
    }

    addCar(car) {
        this.cars.push(car);
        this._placeCars();
    }

    moveCar(id, delta) {
        const car = this.cars.find(c => c.id === id);
        if (!car) {
            return;
        }
        if (!this.canMove(car, delta)) {
            return;
        }
        let newRow = car.row;
        let newCol = car.col;

        if (car.orientation === 'H') {
            newCol += delta;
        } else {
            newRow += delta;
        }
        car.row = newRow;
        car.col = newCol;

        this._placeCars();
    }

    canMove(car, delta) {
        const newRow = car.orientation === 'V' ? car.row + delta : car.row;
        const newCol = car.orientation === 'H' ? car.col + delta : car.col;
        if (
            newRow < 0 ||
            newCol < 0 ||
            (car.orientation === 'H' && newCol + car.length > this.width) ||
            (car.orientation === 'V' && newRow + car.length > this.height)
        ) {
            return false;
        }

        for (let offset = 0; offset < car.length; offset++) {
            const checkRow = car.orientation === 'V' ? newRow + offset : newRow;
            const checkCol = car.orientation === 'H' ? newCol + offset : newCol;
            const occupant = this.grid[checkRow][checkCol];
            if (occupant && occupant !== car.id) {
                return false;
            }
        }
        return true;
    }


    isGoal() {
        const target = this.cars.find(c => c.isTarget);
        console.log(target);
        if (!target) return false;
        console.log(target.row, target.col, target.length);
        console.log(this.exit.row, this.exit.col);

        if (this.exitOrientation === 'H') {
            console.log(this.exit.col, target.col, target.length);
            return this.exit.col === -1 ? target.col === 0 && target.row === this.exit.row : target.col + target.length === this.exit.col && target.row === this.exit.row;
        } else {
            console.log(this.exit.row, target.row, target.length);
            return this.exit.row === -1 ? target.row === 0 && target.col === this.exit.col : target.row + target.length === this.exit.row && target.col === this.exit.col;
        }
    }

    heuristic() {
        const target = this.cars.find(c => c.isTarget);
        if (!target) throw new Error("No primary car for heuristic");

        let frontIdx, exitIdx, distance, blockers = 0;

        if (this.exitOrientation === 'H') {
            exitIdx  = this.exit.col;
            frontIdx = exitIdx < 0
                ? target.col
                : target.col + target.length - 1;

            distance = Math.abs(exitIdx - frontIdx);

            const row = target.row;
            const minC = Math.min(frontIdx, exitIdx);
            const maxC = Math.max(frontIdx, exitIdx);

            for (let c = minC + 1; c < maxC; c++) {
                if (this.grid[row][c]) blockers++;
            }
        } else {
            exitIdx  = this.exit.row;
            frontIdx = exitIdx < 0
                ? target.row
                : target.row + target.length - 1;

            distance = Math.abs(exitIdx - frontIdx);

            const col = target.col;
            const minR = Math.min(frontIdx, exitIdx);
            const maxR = Math.max(frontIdx, exitIdx);
            for (let r = minR + 1; r < maxR; r++) {
                if (this.grid[r][col]) blockers++;
            }
        }
        return distance + (blockers * 3);
    }

    getHeuristic() {
        return this.heuristic();
    }

    clone() {
        const carsCopy = this.cars.map(
        ({ id, row, col, length, orientation, isTarget }) =>
            new Car(id, row, col, length, orientation, isTarget)
        );
        return new Board(this.height, this.width, carsCopy, this.exit, this.exitOrientation);
    }

    reset() {
        this.cars.forEach(car => {
            car.row = -1;
            car.col = -1;
        });
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                this.grid[r][c] = null;
            }
        }
    }

    serialize() {
        return this.cars
        .map(c => `${c.id}:${c.row},${c.col}`)
        .sort()
        .join('|');
    }

    isGoal() {
        const target = this.cars.find(c => c.isTarget);
        let frontIdx, exitIdx;
        if (this.exitOrientation === 'H') {
            frontIdx = exitIdx < 0
                ? target.col
                : target.col + target.length - 1;
            exitIdx = exitIdx < 0 ? 0 : this.exit.col - 1;
        } else {
            frontIdx = exitIdx < 0
                ? target.row
                : target.row + target.length - 1;
            exitIdx = exitIdx < 0 ? 0 : this.exit.row - 1;
        }
        return frontIdx === exitIdx && (this.exitOrientation === 'H' ? target.row === this.exit.row : target.col === this.exit.col);
    }

    getSuccessorMoves() {
        const result = [];
        this.cars.forEach(car => {
            for (let step = -1; ; step--) {
                if (!this.canMove(car, step)) break;
                const next = this.clone();
                next.moveCar(car.id, step);
                result.push({ board: next, move: { id: car.id, delta: step } });
            }
            for (let step = 1; ; step++) {
                if (!this.canMove(car, step)) break;
                const next = this.clone();
                next.moveCar(car.id, step);
                result.push({ board: next, move: { id: car.id, delta: step } });
            }
        });
        return result;
    }

    printBoard(highlightMove = null) {
        const RESET = '\x1b[0m';
        const RED = '\x1b[31m';
        const GREEN = '\x1b[32m';
        const CYAN = '\x1b[36m';

        const displayGrid = Array.from({ length: this.height }, () =>
            Array.from({ length: this.width }, () => '.'));

        this.cars.forEach(car => {
            for (let offset = 0; offset < car.length; offset++) {
                const r = car.orientation === 'V' ? car.row + offset : car.row;
                const c = car.orientation === 'H' ? car.col + offset : car.col;

                let ch = car.id.toUpperCase();

                if (highlightMove && car.id === highlightMove.id) {
                    ch = RED + ch + RESET;
                } else if (car.isTarget) {
                    ch = GREEN + ch + RESET;
                }

                displayGrid[r][c] = ch;
            }
        });
        if (this.exit) {
            if (this.exit.row === -1) {
                let line = '';
                for (let c = 0; c < this.width; c++) {
                    line += c === this.exit.col ? CYAN + 'K' + RESET : ' ';
                }
                console.log(line);
            }
        }
        for (let r = 0; r < this.height; r++) {
            let line = '';
            if (this.exit) {
                if (this.exit.col === -1) {
                    r === this.exit.row ? line += CYAN + 'K' + RESET: line += ' ';
                }
            }
            for (let c = 0; c < this.width; c++) {
                line += displayGrid[r][c];
            }
            if (this.exit) {
                if (this.exit.col === this.width) {
                    r === this.exit.row ? line += CYAN + 'K' + RESET: line += ' ';
                }
            }
            console.log(line);
        }

        if (this.exit) {
            if (this.exit.row === this.height) {
                let line = '';
                for (let c = 0; c < this.width; c++) {
                    line += c === this.exit.col ? CYAN + 'K' + RESET : ' ';
                }
                console.log(line);
            }
        }
    }
}

/*function placeCarsRecursively(board, carsToPlace, occupiedGrid) {
    let placedAny = false;

    for (let i = 0; i < carsToPlace.length; i++) {
        const car = carsToPlace[i];
        const height = board.height;
        const width = board.width;
        const maxRow = height - (car.orientation === 'V' ? car.length : 1);
        const maxCol = width - (car.orientation === 'H' ? car.length : 1);

        const possiblePositions = [];

        for (let r = 0; r <= maxRow; r++) {
            for (let c = 0; c <= maxCol; c++) {
                let canPlace = true;
                for (let offset = 0; offset < car.length; offset++) {
                    const rr = car.orientation === 'H' ? r : r + offset;
                    const cc = car.orientation === 'H' ? c + offset : c;
                    if (occupiedGrid[rr][cc]) {
                        canPlace = false;
                        break;
                    }
                }
                if (canPlace) {
                    possiblePositions.push({ row: r, col: c });
                }
            }
        }

        if (possiblePositions.length === 1) {
            const pos = possiblePositions[0];
            car.row = pos.row;
            car.col = pos.col;

            for (let offset = 0; offset < car.length; offset++) {
                const rr = car.orientation === 'H' ? pos.row : pos.row + offset;
                const cc = car.orientation === 'H' ? pos.col + offset : pos.col;
                occupiedGrid[rr][cc] = true;
            }

            const remainingCars = carsToPlace.slice(0, i).concat(carsToPlace.slice(i + 1));
            return placeCarsRecursively(board, remainingCars, occupiedGrid);
        }
    }
    return [board, carsToPlace];
}

export function makeCompleteGoalBoard(startBoard) {
    const goalBoard = startBoard.clone();
    const targetCar = goalBoard.cars.find(c => c.isTarget);
    if (!targetCar) throw new Error('No target car found');
    const exit = goalBoard.exit;
    console.log(targetCar.row, targetCar.col, targetCar.length, targetCar.orientation);
    // Place target car at exit position -1 (handling edge cases)
    if (targetCar.orientation === 'H') {
        targetCar.row = exit.row;
        targetCar.col = exit.col === -1 ? 1 : exit.col - (targetCar.length + 1);
    } else {
        targetCar.col = exit.col;
        targetCar.row = exit.row === -1 ? 1 : exit.row - (targetCar.length + 1);
    }

    // Prepare occupancy grid
    const occupiedGrid = Array.from({ length: goalBoard.height }, () =>
        Array(goalBoard.width).fill(false)
    );

    for (let offset = 0; offset < targetCar.length; offset++) {
        const rr = targetCar.orientation === 'H' ? targetCar.row : targetCar.row + offset;
        const cc = targetCar.orientation === 'H' ? targetCar.col + offset : targetCar.col;
        occupiedGrid[rr][cc] = true;
    }

    if (!placeCarsRecursively(goalBoard, goalBoard.cars, occupiedGrid)) {
        throw new Error('Could not place all cars logically');
    }

    goalBoard._placeCars();
    return goalBoard;
}
*/