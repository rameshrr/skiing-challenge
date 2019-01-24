const Skiing = require('../');
const path = require('path');

const skiing = new Skiing();

const DATA_URL = 'http://s3-ap-southeast-1.amazonaws.com/geeks.redmart.com/coding-problems/map.txt';
const FILE_PATH = path.resolve(__dirname, './map.txt');

(async function findPath() {

    // const deepPath = await skiing.computeFromUrl(DATA_URL);
    const deepPath = await skiing.computeFromFile(FILE_PATH);

    console.log(deepPath.length, deepPath);
})();
