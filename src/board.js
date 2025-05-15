class Car {

  constructor(id, row, col, length, orientation, isTarget = false) {
    this.id = id;
    this.row = row;
    this.col = col;
    this.length = length;
    this.orientation = orientation;
    this.isTarget = isTarget;
  }
}

class Board {
    constructor(size, cars = []) {
        this.size = size;
        this.cars = cars;
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
        if (car.orientation === 'H') {
        car.col += delta;
        } else {
        car.row += delta;
        }
        this._placeCars();
    }

    isGoal() {
        const target = this.cars.find(c => c.isTarget);
        return target && target.col + target.length === this.size;
    }

    clone() {
        const carsCopy = this.cars.map(
        ({ id, row, col, length, orientation, isTarget }) =>
            new Car(id, row, col, length, orientation, isTarget)
        );
        return new Board(this.size, carsCopy);
    }

    serialize() {
        return this.cars
        .map(c => `${c.id}:${c.row},${c.col}`)
        .sort()
        .join("|");
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
}
module.exports = { Car, Board };
