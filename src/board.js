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
        if (!target) return false;

        if (this.exitOrientation === 'H') {
            return this.exit.col === -1 ? target.col === 0 && target.row === this.exit.row : target.col + target.length === this.exit.col && target.row === this.exit.row;
        } else {
            return this.exit.row === -1 ? target.row === 0 && target.col === this.exit.col : target.row + target.length === this.exit.row && target.col === this.exit.col;
        }
    }

    countDirectBlockers() {
        const target = this.cars.find(c => c.isTarget);

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
        } 
        else {
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
        return distance + (blockers * 2);
    }

    countRecursiveBlockers() {
        const base = this.countDirectBlockers();  

        const target = this.cars.find(c => c.isTarget);
        const burdenCache = new Map();
        const burden = this.carBlockers(target.id, burdenCache);

        return base + burden;
    }

    countMinSteps() {
        const target = this.cars.find(c => c.isTarget);

        let frontIdx, exitIdx, distance = 0;
        let blockers = [];

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
                if (this.grid[row][c]) {
                    const car = this.cars.find(c => c.id === this.grid[row][c]);
                    if (car) {
                        blockers.push(car.id);
                    }
                }
            }
        } 
        else {
            exitIdx  = this.exit.row;
            frontIdx = exitIdx < 0
                ? target.row
                : target.row + target.length - 1;

            distance = Math.abs(exitIdx - frontIdx);

            const col = target.col;
            const minR = Math.min(frontIdx, exitIdx);
            const maxR = Math.max(frontIdx, exitIdx);
            for (let r = minR + 1; r < maxR; r++) {
                if (this.grid[r][col]){
                    const car = this.cars.find(c => c.id === this.grid[r][col]);
                    if (car) {
                        blockers.push(car.id);
                    }
                }
            }
        }
        let movesNeeded = 0;
        for (const id of blockers) {
            const car = this.cars.find(c => c.id === id);
            movesNeeded += this.minStepsToFree(car);
        }
        return dist + movesNeeded;
    }

    getHeuristic(h) {
        switch (h) {
            case 2:
                return this.countRecursiveBlockers();
            case 3:
                return this.countMinSteps();
            default:
                return this.countDirectBlockers();
        }
    }

    carBlockers(carId, burdenCache = new Map(), visiting = new Set()) {
        if (burdenCache.has(carId)) {
            return burdenCache.get(carId);
        }

        if (visiting.has(carId)) {
            return 0;
        }
        visiting.add(carId);

        const car = this.cars.find(c => c.id === carId);
        if (!car) {
            visiting.delete(carId);
            burdenCache.set(carId, 0);
            return 0;
        }

        const blockers = new Set();
        if (car.orientation === 'H') {
            const r = car.row;
            for (let c = 0; c < this.width; c++) {
                const occ = this.grid[r][c];
                if (occ && occ !== carId) blockers.add(occ);
            }
        } else {
            const c = car.col;
            for (let r = 0; r < this.height; r++) {
                const occ = this.grid[r][c];
                if (occ && occ !== carId) blockers.add(occ);
            }
        }

        let weight = blockers.size;

        for (const bId of blockers) {
            weight += 0.5 * this.carBlockers(bId, burdenCache, visiting);
        }
        visiting.delete(carId);
        burdenCache.set(carId, weight);
        return weight;
    }

    isCarBlockingTarget(car) {
        const target = this.cars.find(c => c.isTarget);
        if (!target) return false;

        let frontIdx, exitIdx;

        if (this.exitOrientation === 'H') {
            frontIdx = this.exit.col < 0 
                ? target.col 
                : target.col + target.length - 1;
            exitIdx = this.exit.col;

            if (car.row !== target.row) return false;

            const minC = Math.min(frontIdx, exitIdx);
            const maxC = Math.max(frontIdx, exitIdx);
            const carStart = car.col;
            const carEnd = car.col + car.length - 1;

            return !(carEnd < minC || carStart > maxC);
        } else {
            frontIdx = this.exit.row < 0 
                ? target.row 
                : target.row + target.length - 1;
            exitIdx = this.exit.row;

            if (car.col !== target.col) return false;

            const minR = Math.min(frontIdx, exitIdx);
            const maxR = Math.max(frontIdx, exitIdx);
            const carStart = car.row;
            const carEnd = car.row + car.length - 1;

            return !(carEnd < minR || carStart > maxR);
        }
    }

    minStepsToFree(car) {
        if (!this.isCarBlockingTarget(car)) {
            return 0;
        }

        const maxRow = this.height;
        const maxCol = this.width;

        if (car.orientation === 'H') {
            const target = this.cars.find(c => c.isTarget);
            let frontIdx = this.exit.col < 0 
                ? target.col 
                : target.col + target.length - 1;
            let exitIdx = this.exit.col;

            const minC = Math.min(frontIdx, exitIdx);
            const maxC = Math.max(frontIdx, exitIdx);
            let movesLeft = car.col + car.length - 1 - minC + 1;
            movesLeft = movesLeft < 0 ? 0 : movesLeft;

            let movesRight = maxC - car.col + 1;
            movesRight = movesRight < 0 ? 0 : movesRight;
            movesLeft = Math.min(movesLeft, car.col);
            movesRight = Math.min(movesRight, maxCol - (car.col + car.length));
            return Math.min(movesLeft, movesRight);
        }
        else {
            const target = this.cars.find(c => c.isTarget);
            let frontIdx = this.exit.row < 0 
                ? target.row 
                : target.row + target.length - 1;
            let exitIdx = this.exit.row;

            const minR = Math.min(frontIdx, exitIdx);
            const maxR = Math.max(frontIdx, exitIdx);
            let movesUp = car.row + car.length - 1 - minR + 1;
            movesUp = movesUp < 0 ? 0 : movesUp;
            let movesDown = maxR - car.row + 1;
            movesDown = movesDown < 0 ? 0 : movesDown;
            movesUp = Math.min(movesUp, car.row);
            movesDown = Math.min(movesDown, maxRow - (car.row + car.length));

            return Math.min(movesUp, movesDown);
        }
    }

    clone() {
        const carsCopy = this.cars.map(
        ({ id, row, col, length, orientation, isTarget }) =>
            new Car(id, row, col, length, orientation, isTarget)
        );
        return new Board(this.height, this.width, carsCopy, this.exit, this.exitOrientation);
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

    toMatrix() {
    return this.grid.map(row => [...row])
    }
}