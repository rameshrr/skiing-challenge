class ElevationData {
    constructor({
        value,
        currentValue,
        rowIndex,
        colIndex,
        direction,
    }) {
        this.value = value;
        this.currentValue = currentValue;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.direction = direction;
    }

    setPath(path) {
        this.pathLength = path.length || 0;
        this.leastValue = path.length ? path[path.length - 1] : null;
    }

    isEqual(rowIndex, colIndex) {
        return this.rowIndex === rowIndex && this.colIndex === colIndex;
    }

    toString() {
        return `Current: ${this.currentValue}, Least: ${this.value}, Row: ${this.rowIndex}, Col: ${this.colIndex}, Dir: ${this.direction}`;
    }
}

module.exports = ElevationData;
