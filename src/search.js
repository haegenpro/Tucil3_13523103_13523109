import { PriorityQueue } from './priorityqueue.js';
import { Node } from './node.js';

function debugLog(...args) {
  if (process.env.DEBUG) {
    console.debug('[DEBUG]', ...args);
  }
}

export function uniformCostSearch(startBoard) {
    const start = new Node(startBoard);
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
            return null;
        }

        if (current.isGoal()) {
            console.log(`UCS goal found after ${expansions} expansions with cost: ${current.g}`);
            return current;
        }

        explored.add(current.serialize());

        const neighbors = current.getNeighbors();

        for (const nbr of neighbors) {
            const key = nbr.serialize();
            if (!explored.has(key)) {
                explored.add(key); 
                pq.enqueue(nbr);
            }
        }
    }

    console.log('UCS no solution found');
    return null;
}

export function greedyBestFirstSearch(startBoard) {
    const start = new Node(startBoard);
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
            return null;
        }

        if (current.isGoal()) {
            console.log(`GBFS goal found after ${expansions} expansions with heuristic: ${current.h.toFixed(2)}`);
            return current;
        }

        const serialized = current.serialize();
        if (explored.has(serialized)) {
            continue;
        }
        explored.add(serialized);

        const neighbors = current.getNeighbors();

        for (const nbr of neighbors) {
            const key = nbr.serialize();
            if (!explored.has(key)) {
                pq.enqueue(nbr);
            }
        }
    }
    console.log('GBFS no solution found');
    return null;
}

export function aStarSearch(startBoard) {
    const start = new Node(startBoard);
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
            return null;
        }

        if (current.isGoal()) {
        console.log(`A* goal found after ${expansions} expansions with cost: ${current.g}`);
            return current;
        }

        explored.add(current.serialize());

        const neighbors = current.getNeighbors();

        for (const nbr of neighbors) {
            const key = nbr.serialize();
            if (!explored.has(key)) {
                explored.add(key); 
                pq.enqueue(nbr);
            }
        }
    }
    console.log('A* no solution found');
    return null;
}

export function beamSearch(startBoard, beamWidth = 50) {
    const start = new Node(startBoard);
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
                return null;
            }

            if (node.isGoal()) {
                console.log(`BeamSearch goal found after ${expansions} expansions (cost: ${node.g})`);
                return node;
            }

            explored.add(node.serialize());

            for (const nbr of node.getNeighbors()) {
                const key = nbr.serialize();
                if (!explored.has(key)) {
                    successors.push(nbr);
                }
            }
        }

        if (successors.length === 0) break;
        successors.sort((a, b) => a.f - b.f);
        beam = successors.slice(0, beamWidth);
    }

    console.log('BeamSearch no solution found');
    return null;
}