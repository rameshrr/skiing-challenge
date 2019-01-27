const request = require('request-promise');
const debug = require('debug');

const ElevationData = require('./elevation-data');
const { getClosestNode, getClosestNodes } = require('./utils');

const { promisify } = require('util');
const fs = require('fs');

const readFilePromise = promisify(fs.readFile);
const setImmediatePromise = promisify(setImmediate);

const log = debug('SKII');
const LINE_DELIMITER = '\n';
const ITEM_DELIMITER = / /g;

class Skiing {
    constructor() {
        this.indexedData = [];
        this.longestPath = [];
    }

    async computeFromUrl(dataUrl) {
        const skiData = await this.downloadData(dataUrl);

        if (!skiData) {
            return;
        }

        this.indexNodes(skiData);
        return await this.compute();
    }

    async computeFromFile(dataUrl) {
        const skiData = await this.readFileData(dataUrl);

        if (!skiData) {
            return;
        }

        this.indexNodes(skiData);
        return await this.compute();
    }

    async downloadData(url) {

        log('Trying to download input data');

        let response = null;

        try {
            response = await request(url);
        } catch (err) {
            log(err.stack);
            return;
        }

        if (response instanceof Error) {
            log(response.stack);
            return;
        }

        log('Input data has been downloaded');

        return this.processData(response);
    }

    async readFileData(filePath) {

        log('Trying to read input data');

        let response = null;

        try {
            response = await readFilePromise(filePath, 'utf8');
        } catch (err) {
            log(err.stack);
            return;
        }

        log('Able to read file from disk');

        return this.processData(response);
    }

    processData(response) {
        const rawData = response.split(LINE_DELIMITER);

        if (rawData.length == 0) {
            log('Invalid data', response);
            return;
        }

        const headerInfo = rawData.shift().split(ITEM_DELIMITER);
        const rows = headerInfo[0];
        const columns = headerInfo[1];

        const parsedData = [];
        for (let i = 0; i < rows; i++) {
            parsedData[i] = rawData[i].split(ITEM_DELIMITER);
            parsedData[i] = parsedData[i].map(Number);
        }

        return parsedData;
    }

    indexNodes(skiData) {

        for (let rowIndex = 0; rowIndex < skiData.length; rowIndex++) {
            this.indexedData.push([]);

            for (let colIndex = 0; colIndex < skiData[rowIndex].length; colIndex++) {
                const currentSki = skiData[rowIndex];

                let allNodes = [
                    /// North Direction
                    {
                        value: rowIndex === 0 ? null : skiData[rowIndex - 1][colIndex],
                        rowIndex: rowIndex === 0 ? null : rowIndex - 1,
                        colIndex,
                        direction: 'NORTH'
                    },

                    /// South Direction
                    {
                        value: rowIndex === skiData.length - 1 ? null : skiData[rowIndex + 1][colIndex],
                        rowIndex: rowIndex === skiData.length - 1 ? null : rowIndex + 1,
                        colIndex,
                        direction: 'SOUTH'
                    },

                    /// East Direction
                    {
                        value: colIndex === currentSki.length - 1 ? null : currentSki[colIndex + 1],
                        rowIndex,
                        colIndex: colIndex === currentSki.length - 1 ? null : colIndex + 1,
                        direction: 'EAST'
                    },

                    /// West Direction
                    {
                        value: colIndex === 0 ? null : currentSki[colIndex - 1],
                        rowIndex,
                        colIndex: colIndex === 0 ? null : colIndex - 1,
                        direction: 'WEST'
                    },
                ];

                let nodeData = null;

                try {
                    nodeData = getClosestNodes(allNodes, currentSki[colIndex]);

                    if (nodeData) {
                        nodeData.setLocation(rowIndex, colIndex);
                    }
                } catch (err) {
                    log(err);
                }

                this.indexedData[rowIndex].push(nodeData);
            }
        }
    }

    async compute() {
        for (let rowIndex = 0; rowIndex < this.indexedData.length; rowIndex++) {
            for (let colIndex = 0; colIndex < this.indexedData[rowIndex].length; colIndex++) {
                const nodeData = this.indexedData[rowIndex][colIndex];

                if (nodeData && nodeData.elevationDatas && Array.isArray(nodeData.elevationDatas) && nodeData.elevationDatas.length) {

                    const path = nodeData.optimizedPath || await this.computeByNode(nodeData);

                    if (this.longestPath.length < path.length) {
                        this.longestPath = path;
                    }

                    if (this.longestPath.length &&
                        this.longestPath.length === path.length &&
                        this.longestPath[0] - this.longestPath[this.longestPath.length - 1] < path[0] - path[path.length - 1]) {
                        this.longestPath = path;
                    }
                }
            }
        }

        return this.longestPath;
    }

    async computeByNode(nodeData) {
        if (nodeData.optimizedPath) {
            return nodeData.optimizedPath;
        }

        let allPaths = await Promise.all(nodeData.elevationDatas.map(async elevationData => {
            if (elevationData.optimizedPath) {
                return elevationData.optimizedPath;
            }

            const optimizedPath = await this.computeByIndex(elevationData.rowIndex, elevationData.colIndex, [nodeData.value]);
            elevationData.setOptimizedPath(optimizedPath);

            return optimizedPath;
        }));

        if (!nodeData.elevationDatas.length) {
            allPaths = [[nodeData.value]];
        }

        nodeData.setOptimizedPath(allPaths);

        return nodeData.optimizedPath;
    }

    async computeByIndex(rowIndex, colIndex, path, prevNode = null) {

        if (rowIndex == null || colIndex == null) {
            return path;
        }

        const currentNode = this.indexedData[rowIndex][colIndex];

        // if (prevNode && currentNode.isEqual(prevNode.rowIndex, prevNode.colIndex)) {
        //     return path;
        // }

        // if (currentNode.value) {
        //     path.push(currentNode.value);
        // }

        if (currentNode.rowIndex >= 0 && currentNode.colIndex >= 0) {
            const nextPath = await this.computeByNode(currentNode);
            return [...path, ...nextPath];
        }

        await setImmediatePromise();

        return path;
    }
};

module.exports = Skiing;
