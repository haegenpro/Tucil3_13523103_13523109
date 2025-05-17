export class Node {
    constructor(board, parent = null, move = null) {
        this.board  = board;
        this.parent = parent;
        this.move   = move;

        if (parent) {
            const stepCost = Math.abs(move.delta);
            this.g = parent.g + stepCost;
        } else {
            this.g = 0;
        }

        this.h = board.getHeuristic();

        this.f = this.g + this.h;
    }

    priorityValue(useAstar = false) {
        return useAstar ? this.f : this.g;
    }

    printBoard() {
        return this.board.printBoard();
    }

    serialize() {
        const s = this.board.serialize();
        return s;
    }

    clone() {
        const boardClone = this.board.clone();
        return new Node(boardClone, this.parent, this.move);
    }

    getNeighbors() {
        const neighbors = this.board.getSuccessorMoves().map(({ board, move }) => {
            const node = new Node(board, this, move);
            return node;
        });
        return neighbors;
    }

    isGoal() {
        return this.board.isGoal();
    }
}