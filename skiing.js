const request = require('request');
const debug = require('debug');

const ElevationData = require('./elevation-data')

const log = debug('SKII');
const DATA_URL = 'http://s3-ap-southeast-1.amazonaws.com/geeks.redmart.com/coding-problems/map.txt';
const LINE_DELIMITER = '\n';
const ITEM_DELIMITER = / /g;

class Skiing {
    constructor() {
        this.indexedData = null;
    }

    computeFromUrl() {
        const skiData = this.downloadData(DATA_URL);

        this.indexNodes(skiData);
        this.compute();
    }

    downloadData(url) {

        log('Trying to download input data');

        request(url, (err, res, body) => {
            if (err) {
                log('Unable to download data', err);
                return;
            }

            if (res && res.statusCode != '200') {
                log('Unable to download data', body);
                return;
            }

            log('Input data has been downloaded');

            const rawData = body.split(LINE_DELIMITER);

            if (rawData.length == 0) {
                log('Invalid data', body);
                return;
            }

            const headerInfo = rawData.shift().split(ITEM_DELIMITER);
            const rows = headerInfo[0];
            const columns = headerInfo[1];

            const parsedData = [];
            for (let i = 0; i < rows; i++) {
                parsedData[i] = rawData[i].split(ITEM_DELIMITER);
            }

            return parsedData;
        });
    }

    indexNodes(skiData) {

        for (let rowIndex = 0; rowIndex < skiData.length; rowIndex++) {
            this.indexedData[rowIndex] = [];

            for (let colIndex = 0; colIndex < skiData[rowIndex].length; colIndex++) {
                const currentSki = skiData[rowIndex];

                const cheapestNode = [
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
                        colIndex: dex === 0 ? null : colIndex - 1,
                        direction: 'WEST'
                    },
                ].reduce((current, previous) => {
                    /// Should be less than current node & biggest between them
                    return current.value < currentSki[colIndex] &&
                        current.value > previous.value ? current : previous;
                });

                cheapestNode = {
                    ...cheapestNode,
                    currentValue: currentSki[colIndex]
                };

                const elevationData = new ElevationData(cheapestNode);
                this.indexedData[rowIndex].push(elevationData);
            }
        }
    }

    compute() {
        for (let rowIndex = 0; rowIndex < this.indexedData.length; rowIndex++) {
            for (let colIndex = 0; colIndex < this.indexedData[rowIndex].length; colIndex++) {
                const currentNode = this.indexedData[rowIndex][colIndex];
                const path = this.computeByIndex(rowIndex, colIndex, []);

                currentNode.setPath(path);
            }
        }

        const longestNodes = [];

        for (let rowIndex = 0; rowIndex < this.indexedData.length; rowIndex++) {
            const longestNode = this.indexedData[rowIndex].reduce((current, previous) => {
                return current.pathLength > previous.pathLength;
            });

            longestNodes.push(longestNode);
        }

        const verticalLongestNode = longestNodes.reduce((current, previous) => {
            return current.pathLength > previous.pathLength;
        });

        return verticalLongestNode;
    }

    computeByIndex(rowIndex, colIndex, path) {
        const currentNode = this.indexedData[rowIndex][colIndex];
        if (currentNode.value) {
            path.push(currentNode);
        }

        if (currentNode.rowIndex && currentNode.colIndex) {
            return this.computeByIndex(currentNode.rowIndex, currentNode.colIndex, path);
        }

        return path;
    }
};

module.exports = Skiing;
