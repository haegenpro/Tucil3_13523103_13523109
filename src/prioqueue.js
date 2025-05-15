class PriorityQueue {

    constructor(comparator = (a, b) => a - b) {
        this._heap = [];
        this._comparator = comparator;
    }
    enqueue(value) {
        this._heap.push(value);
        this._heapifyUp(this._heap.length - 1);
    }
    dequeue() {
        if (this.isEmpty()) {
        throw new Error('PriorityQueue is empty');
        }
        this._swap(0, this._heap.length - 1);
        const value = this._heap.pop();
        this._heapifyDown(0);
        return value;
    }
    peek() {
        if (this.isEmpty()) {
        return null;
        }
        return this._heap[0];
    }
    isEmpty() {
        return this._heap.length === 0;
    }
    size() {
        return this._heap.length;
    }
    _heapifyUp(index) {
        let parent = Math.floor((index - 1) / 2);
        while (
        index > 0 &&
        this._comparator(this._heap[index], this._heap[parent]) < 0
        ) {
        this._swap(index, parent);
        index = parent;
        parent = Math.floor((index - 1) / 2);
        }
    }
    _heapifyDown(index) {
        const last = this._heap.length - 1;
        while (true) {
        let left = index * 2 + 1;
        let right = index * 2 + 2;
        let smallest = index;

        if (
            left <= last &&
            this._comparator(this._heap[left], this._heap[smallest]) < 0
        ) {
            smallest = left;
        }
        if (
            right <= last &&
            this._comparator(this._heap[right], this._heap[smallest]) < 0
        ) {
            smallest = right;
        }
        if (smallest === index) break;
        this._swap(index, smallest);
        index = smallest;
        }
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
}

module.exports = PriorityQueue;
