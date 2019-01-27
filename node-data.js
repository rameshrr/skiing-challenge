class NodeData {
    constructor(value, elevationDatas) {
        this.optimizedPath = null;
        this.rowIndex = null;
        this.colIndex = null;

        this.value = value;
        this.elevationDatas = elevationDatas;
    }

    setLocation(rowIndex, colIndex) {
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
    }

    setOptimizedPath(allPaths) {
        this.optimizedPath = allPaths.reduce((prev, cur) => prev.length > cur.length ? prev : cur);
    }
}

module.exports = NodeData;
