import { PriorityQueue } from './priorityqueue.js';
import { Node } from './node.js';

export function uniformCostSearch(startBoard, heuristic = 1) {
    const start = new Node(startBoard, null, null, heuristic);
    const pq = new PriorityQueue((a, b) => a.g - b.g);
    pq.enqueue(start);

    const explored = new Set();
    let expansions = 0;
    const MAX_EXPANSIONS = 100000;

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        expansions++;

        if (expansions > MAX_EXPANSIONS) {
            console.warn('UCS aborted: max expansions reached');
            return { node: null, expansions };
        }
        if (current.isGoal()) {
            
            return { node: current, expansions };
        }

        explored.add(current.serialize());
        for (const nbr of current.getNeighbors()) {
            const key = nbr.serialize();
            if (!explored.has(key)) {
                explored.add(key);
                pq.enqueue(nbr);
            }
        }
    }

    console.log('UCS no solution found');
    return { node: null, expansions };
}

export function greedyBestFirstSearch(startBoard, heuristic = 1) {
    const start = new Node(startBoard, null, null, heuristic);
    const pq = new PriorityQueue((a, b) => a.h - b.h);
    pq.enqueue(start);

    const explored = new Set();
    let expansions = 0;
    const MAX_EXPANSIONS = 100000;

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        expansions++;

        if (expansions > MAX_EXPANSIONS) {
            console.warn('GBFS aborted: max expansions reached');
            return { node: null, expansions };
        }
        if (current.isGoal()) {
            
            return { node: current, expansions };
        }

        const serialized = current.serialize();
        if (explored.has(serialized)) continue;
        explored.add(serialized);

        for (const nbr of current.getNeighbors()) {
            const key = nbr.serialize();
            if (!explored.has(key)) pq.enqueue(nbr);
        }
    }

    console.log('GBFS no solution found');
    return { node: null, expansions };
}

export function aStarSearch(startBoard, heuristic = 1) {
    const start = new Node(startBoard, null, null, heuristic);
    const pq = new PriorityQueue((a, b) => a.f - b.f);
    pq.enqueue(start);

    const explored = new Set();
    let expansions = 0;
    const MAX_EXPANSIONS = 100000;

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        expansions++;

        if (expansions > MAX_EXPANSIONS) {
            console.warn('A* aborted: max expansions reached');
            return { node: null, expansions };
        }
        if (current.isGoal()) {
            
            return { node: current, expansions };
        }

        explored.add(current.serialize());
        for (const nbr of current.getNeighbors()) {
            const key = nbr.serialize();
            if (!explored.has(key)) {
                explored.add(key);
                pq.enqueue(nbr);
            }
        }
    }

    console.log('A* no solution found');
    return { node: null, expansions };
}

export function beamSearch(startBoard, beamWidth = 50, heuristic = 1) {
    const start = new Node(startBoard, null, null, heuristic);
    let beam = [start];
    const explored = new Set();
    let expansions = 0;
    const MAX_EXPANSIONS = 100000;

    while (beam.length > 0) {
        const successors = [];

        for (const node of beam) {
            expansions++;
            if (expansions > MAX_EXPANSIONS) {
                console.warn('BeamSearch aborted: max expansions reached');
                return { node: null, expansions };
            }
            if (node.isGoal()) {
                
                return { node, expansions };
            }

            explored.add(node.serialize());
            for (const nbr of node.getNeighbors()) {
                const key = nbr.serialize();
                if (!explored.has(key)) successors.push(nbr);
            }
        }

        if (successors.length === 0) break;
        successors.sort((a, b) => a.f - b.f);
        beam = successors.slice(0, beamWidth);
    }

    console.log('BeamSearch no solution found');
    return { node: null, expansions };
}
