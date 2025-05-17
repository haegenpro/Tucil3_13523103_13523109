import { PriorityQueue } from './priorityqueue.js';
import { Node } from './node.js';

function debugLog(...args) {
  if (process.env.DEBUG) {
    console.debug('[DEBUG]', ...args);
  }
}

/**
 * Uniform Cost Search (UCS)
 * Explores nodes by lowest cumulative cost (g).
 */
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

    debugLog(`UCS Dequeued node g=${current.g} move=${current.move ? current.move.id + ':' + current.move.delta : 'start'}`);

    if (current.isGoal()) {
      console.log(`UCS goal found after ${expansions} expansions with cost: ${current.g}`);
      return current;
    }

    explored.add(current.serialize());

    const neighbors = current.getNeighbors();
    debugLog(`UCS expanding ${neighbors.length} neighbors`);

    for (const nbr of neighbors) {
      const key = nbr.serialize();
      if (!explored.has(key)) {
        explored.add(key); 
        pq.enqueue(nbr);
        debugLog(`UCS Enqueued neighbor move=${nbr.move.id}:${nbr.move.delta} g=${nbr.g}`);
      } else {
        debugLog(`UCS Skipping explored neighbor: ${key}`);
      }
    }
  }

  console.log('UCS no solution found');
  return null;
}

/**
 * Greedy Best First Search (GBFS)
 * Explores nodes by lowest heuristic estimate (h).
 */
export function greedyBestFirstSearch(startBoard) {
    const start = new Node(startBoard);
    const pq = new PriorityQueue((a, b) => a.h - b.h);
    pq.enqueue(start);

    const explored = new Set();
    let expansions = 0;
    const MAX_EXPANSIONS = 100000;

    console.log('Starting GBFS search');

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        expansions++;

        if (expansions > MAX_EXPANSIONS) {
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


/**
 * A* Search
 * Explores nodes by lowest f = g + h.
 */
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

    debugLog(`A* Dequeued node f=${current.f} (g=${current.g}, h=${current.h}) move=${current.move ? current.move.id + ':' + current.move.delta : 'start'}`);

    if (current.isGoal()) {
      console.log(`A* goal found after ${expansions} expansions with cost: ${current.g}`);
      return current;
    }

    explored.add(current.serialize());

    const neighbors = current.getNeighbors();
    debugLog(`A* expanding ${neighbors.length} neighbors`);

    for (const nbr of neighbors) {
      const key = nbr.serialize();
      if (!explored.has(key)) {
        explored.add(key); 
        pq.enqueue(nbr);
        debugLog(`A* Enqueued neighbor move=${nbr.move.id}:${nbr.move.delta} f=${nbr.f} (g=${nbr.g}, h=${nbr.h})`);
      } else {
        debugLog(`A* Skipping explored neighbor: ${key}`);
      }
    }
  }

  console.log('A* no solution found');
  return null;
}
