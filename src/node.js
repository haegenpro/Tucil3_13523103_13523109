export class Node {
    constructor(board, parent = null, move = null, heuristic = 1) {
        this.board  = board;
        this.parent = parent;
        this.move   = move;
        if (parent) {
            const stepCost = Math.abs(move.delta);
            this.g = parent.g + stepCost;
        } else this.g = 0;
        this.heuristic = heuristic;
        this.h = board.getHeuristic(heuristic);
        this.f = this.g + this.h;
    }

    serialize() {
        const s = this.board.serialize();
        return s;
    }

    clone() {
        const boardClone = this.board.clone();
        return new Node(boardClone, this.parent, this.move, this.heuristic);
    }

    getNeighbors() {
        const neighbors = this.board.getSuccessorMoves().map(({ board, move }) => {
            const node = new Node(board, this, move, this.heuristic);
            return node;
        });
        return neighbors;
    }

    isGoal() {
        return this.board.isGoal();
    }
}