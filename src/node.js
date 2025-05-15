import { PriorityQueue } from './priorityQueue.js';

class Node {
    constructor(board, parent = null, move = null) {
        this.board  = board;        // Board instance
        this.parent = parent;       // back‐pointer
        this.move   = move;         // { id, delta } or null for root

        // path‐cost g(n)
        if (parent) {
        const stepCost = Math.abs(move.delta);
        this.g = parent.g + stepCost;
        } else {
        this.g = 0;
        }

        // heuristic h(n)
        this.h = board.getHeuristic();    // exit distance + blockers

        // A* priority f(n)
        this.f = this.g + this.h;
    }

    // for uniform‐cost and A* we compare g and f respectively
    priorityValue(useAstar = false) {
        return useAstar ? this.f : this.g;
    }

    // expand into new Node children
    getNeighbors() {
        return this.board.getSuccessorMoves().map(({ board, move }) =>
        new Node(board, this, move)
        );
    }

    // goal test
    isGoal() {
        return this.board.isGoal();
    }

    // to avoid re‐exploring same state
    serialize() {
        return this.board.serialize();
    }
}
