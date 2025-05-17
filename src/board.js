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

    constructor(size, cars = [], exitPos) {
        this.size = size;
        this.cars = cars;
        this.exit = exitPos;
        this.grid = this._createGrid();
        this._placeCars();
    }

    _createGrid() {
        return Array.from({ length: this.size }, () =>
        Array.from({ length: this.size }, () => null)
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
        if (!car) throw new Error(`No car with id ${id}`);
        if (car.orientation === 'H') car.col += delta;
        else car.row += delta;
        this._placeCars();
    }

    isGoal() {
        const target = this.cars.find(c => c.isTarget);
        if (!target || target.orientation !== 'H') return false;
        const frontCol = target.col + target.length - 1;
        return (
        target.row === this.exit.row &&
        frontCol === this.exit.col
        );
    }

    heuristic() {
        const target = this.cars.find(c => c.isTarget);
        if (!target) throw new Error('Cannot compute heuristic: no target car');
        const frontCol = target.col + target.length - 1;
        return this.exit.col - frontCol;
    }

    countBlockers() {
        const target = this.cars.find(c => c.isTarget);
        const row = target.row;
        const start = target.col + target.length;
        let blockers = 0;
        for (let c = start; c <= this.exit.col; c++) {
        if (this.grid[row][c]) blockers++;
        }
        return blockers;
    }

    getHeuristic() {
        return this.heuristic() + this.countBlockers();
    }

    clone() {
        const carsCopy = this.cars.map(
        ({ id, row, col, length, orientation, isTarget }) =>
            new Car(id, row, col, length, orientation, isTarget)
        );
        return new Board(this.size, carsCopy, { ...this.exit });
    }

    serialize() {
        return this.cars
        .map(c => `${c.id}:${c.row},${c.col}`)
        .sort()
        .join('|');
    }

    equals(other) {
        return this.serialize() === other.serialize();
    }

    getSuccessors() {
        const successors = [];
        this.cars.forEach(car => {
        let step = -1;
        while (true) {
            const next = this.clone();
            try {
                next.moveCar(car.id, step);
                successors.push(next);
                step--;
            } catch {
            break;
            }
        }
        step = 1;
        while (true) {
            const next = this.clone();
            try {
                next.moveCar(car.id, step);
                successors.push(next);
                step++;
            } catch {
            break;
            }
        }
        });
        return successors;
    }

    getSuccessorMoves() {
        const result = [];
        this.cars.forEach(car => {
        let step = -1;
        while (true) {
            const next = this.clone();
            try {
                next.moveCar(car.id, step);
                result.push({ board: next, move: { id: car.id, delta: step } });
                step--;
            } catch {
            break;
            }
        }
        step = 1;
        while (true) {
            const next = this.clone();
            try {
                next.moveCar(car.id, step);
                result.push({ board: next, move: { id: car.id, delta: step } });
                step++;
            } catch {
            break;
            }
        }
        });
        return result;
    }

    printBoard(highlightMove = null) {
        const RESET = '\x1b[0m';
        const RED = '\x1b[31m';
        const GREEN = '\x1b[32m';
        const CYAN = '\x1b[36m';

        const displayGrid = Array.from({ length: this.size }, () =>
            Array.from({ length: this.size }, () => '.'));

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

        // Print extra line for top or bottom vertical exit
        if (this.exit) {
            if (this.exit.row === -1) { // top edge
                let line = '';
                for (let c = 0; c < this.size; c++) {
                    line += c === this.exit.col ? CYAN + 'K' + RESET : ' ';
                }
                console.log(line);
            }
        }

        // Print each grid row with possible left/right horizontal exit
        for (let r = 0; r < this.size; r++) {
            let line = '';
            if (this.exit) {
                if (this.exit.col === -1) {
                    r === this.exit.row ? line += CYAN + 'K' + RESET: line += ' '; // left exit
                }
            }
            for (let c = 0; c < this.size; c++) {
                line += displayGrid[r][c];
            }
            if (this.exit) {
                if (this.exit.col === this.size) {
                    r === this.exit.row ? line += CYAN + 'K' + RESET: line += ' '; // right exit
                }
            }
            console.log(line);
        }

        if (this.exit) {
            if (this.exit.row === this.size) { // bottom edge
                let line = '';
                for (let c = 0; c < this.size; c++) {
                    line += c === this.exit.col ? CYAN + 'K' + RESET : ' ';
                }
                console.log(line);
            }
        }
    }
}

function placeCarsRecursively(board, carsToPlace, occupiedGrid) {
    let placedAny = false;

    for (let i = 0; i < carsToPlace.length; i++) {
        const car = carsToPlace[i];
        const size = board.size;
        const maxRow = size - (car.orientation === 'V' ? car.length : 1);
        const maxCol = size - (car.orientation === 'H' ? car.length : 1);

        // Find all possible valid placements for this car
        const possiblePositions = [];

        for (let r = 0; r <= maxRow; r++) {
            for (let c = 0; c <= maxCol; c++) {
                // Check if can place car at (r, c)
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
            // Unique placement found, place the car
            const pos = possiblePositions[0];
            car.row = pos.row;
            car.col = pos.col;

            // Mark cells occupied
            for (let offset = 0; offset < car.length; offset++) {
                const rr = car.orientation === 'H' ? pos.row : pos.row + offset;
                const cc = car.orientation === 'H' ? pos.col + offset : pos.col;
                occupiedGrid[rr][cc] = true;
            }

            // Remove placed car from carsToPlace and restart recursion
            const remainingCars = carsToPlace.slice(0, i).concat(carsToPlace.slice(i + 1));
            const placedInRest = placeCarsRecursively(board, remainingCars, occupiedGrid);
            return true; // We placed at least one car, so continue until stable
        }
        // If no unique placement, leave car unplaced (wildcard)
    }

    // If no cars placed in this pass, stop recursion
    return false;
}

export function makeCompleteGoalBoard(startBoard) {
    const goalBoard = startBoard.clone();
    const targetCar = goalBoard.cars.find(c => c.isTarget);
    if (!targetCar) throw new Error('No target car found');
    const exit = goalBoard.exit;

    // Place target car at exit position -1 (handling edge cases)
    if (targetCar.orientation === 'H') {
        targetCar.row = exit.row;
        targetCar.col = exit.col === 0 ? 0 : exit.col - (targetCar.length - 1);
    } else {
        targetCar.col = exit.col;
        targetCar.row = exit.row === 0 ? 0 : exit.row - (targetCar.length - 1);
    }

    // Prepare occupancy grid
    const occupiedGrid = Array.from({ length: goalBoard.size }, () =>
        Array(goalBoard.size).fill(false)
    );

    // Mark target car occupied
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
