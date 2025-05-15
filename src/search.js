function uniformedCostSearch(startBoard, goalBoard) {
  const start = new Node(startBoard);
  const goalKey = new Node(goalBoard).serialize();

  const pq = new PriorityQueue();
  pq.enqueue(start, start.priorityValue());

  const explored = new Set();

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (current.serialize() === goalKey) return current;

    explored.add(current.serialize());

    for (const neighbor of current.getNeighbors()) {
      const key = neighbor.serialize();
      if (!explored.has(key)) {
        pq.enqueue(neighbor, neighbor.priorityValue());
      }
    }
  }
  return null;
}

function greedyBestFirstSearch(startBoard, goalBoard) {
  const start = new Node(startBoard);
  const goalKey = new Node(goalBoard).serialize();

  const pq = new PriorityQueue();
  pq.enqueue(start, start.h);

  const explored = new Set();

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (current.serialize() === goalKey) return current;

    explored.add(current.serialize());

    for (const neighbor of current.getNeighbors()) {
      const key = neighbor.serialize();
      if (!explored.has(key)) {
        pq.enqueue(neighbor, neighbor.h);
      }
    }
  }
  return null;
}

function aStarSearch(startBoard, goalBoard) {
  const start = new Node(startBoard);
  const goalKey = new Node(goalBoard).serialize();

  const pq = new PriorityQueue();
  pq.enqueue(start, start.f);

  const explored = new Set();

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (current.serialize() === goalKey) return current;

    explored.add(current.serialize());

    for (const neighbor of current.getNeighbors()) {
      const key = neighbor.serialize();
      if (!explored.has(key)) {
        pq.enqueue(neighbor, neighbor.f);
      }
    }
  }
  return null;
}
