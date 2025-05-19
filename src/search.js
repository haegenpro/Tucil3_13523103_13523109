import { PriorityQueue } from './priorityqueue.js';
import { Node } from './node.js';

export function uniformCostSearch(startBoard, heuristic = 1) {
    const start = new Node(startBoard, null, null, heuristic);
    const pq = new PriorityQueue((a, b) => a.g - b.g);
    pq.enqueue(start);

    const explored = new Set();
    let expansions = 0;

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        expansions++;
        
        const key = current.serialize();
        if (explored.has(key)) continue;
        
        if (current.isGoal()) {
            return { node: current, expansions };
        }
        explored.add(key);
        for (const nbr of current.getNeighbors()) {
            const nbrKey = nbr.serialize();
            if (!explored.has(nbrKey)) {
                pq.enqueue(nbr);
            }
        }
    }
    return { node: null, expansions };
}

export function greedyBestFirstSearch(startBoard, heuristic = 1) {
    const start = new Node(startBoard, null, null, heuristic);
    const pq = new PriorityQueue((a, b) => a.h - b.h);
    pq.enqueue(start);

    const explored = new Set();
    let expansions = 0;

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        expansions++;

        const key = current.serialize();
        if (explored.has(key)) continue;
        
        if (current.isGoal()) {
            return { node: current, expansions };
        }
        explored.add(key);

        for (const nbr of current.getNeighbors()) {
            const nbrKey = nbr.serialize();
            if (!explored.has(nbrKey)) {
                pq.enqueue(nbr);
            }
        }
    }
    return { node: null, expansions };
}

export function aStarSearch(startBoard, heuristic = 1) {
    const start = new Node(startBoard, null, null, heuristic);
    const pq = new PriorityQueue((a, b) => a.f - b.f);
    pq.enqueue(start);

    const explored = new Set();
    let expansions = 0;

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        expansions++;
        
        const key = current.serialize();
        if (explored.has(key)) continue;
        
        if (current.isGoal()) {
            return { node: current, expansions };
        }
        explored.add(key);
        for (const nbr of current.getNeighbors()) {
            const nbrKey = nbr.serialize();
            if (!explored.has(nbrKey)) {
                pq.enqueue(nbr);
            }
        }
    }
    return { node: null, expansions };
}

export function beamSearch(startBoard, beamWidth = 200, heuristic = 1) {
    const start = new Node(startBoard, null, null, heuristic);
    let beam = [start];
    const explored = new Set();
    let expansions = 0;

    while (beam.length > 0) {
        const successors = [];

        for (const node of beam) {
            expansions++;
            const key = node.serialize();
            if (explored.has(key)) continue;
            
            if (node.isGoal()) {
                return { node, expansions };
            }
            explored.add(key);
            for (const nbr of node.getNeighbors()) {
                const nbrKey = nbr.serialize();
                if (!explored.has(nbrKey)) {
                    successors.push(nbr);
                }
            }
        }
        if (successors.length === 0) break;
        successors.sort((a, b) => a.f - b.f);
        beam = successors.slice(0, beamWidth);
    }
    return { node: null, expansions };
}
