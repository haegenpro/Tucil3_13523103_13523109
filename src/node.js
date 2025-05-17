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

    getNeighbors() {
        return this.board.getSuccessorMoves().map(({ board, move }) =>
        new Node(board, this, move)
        );
    }

    isGoal() {
        return this.board.isGoal();
    }

    printBoard() {
        return this.board.printBoard();
    }
    serialize() {
        return this.board.serialize();
    }
}