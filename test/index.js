const Skiing = require('../');
const path = require('path');

var argv = require('minimist')(process.argv.slice(2));

const skiing = new Skiing();

const FILE_PATH = path.resolve(__dirname, './map.txt');

let DATA_URL = 'http://s3-ap-southeast-1.amazonaws.com/geeks.redmart.com/coding-problems/map.txt';

if (argv.DATA_URL) {
    console.log('Reading data from user defined data URL. :)');
    console.log('URL: ', argv.DATA_URL);

    DATA_URL = argv.DATA_URL;
}

(async function findPath() {

    console.time('SKI');
    const deepPath = await skiing.computeFromUrl(DATA_URL);
    // const deepPath = await skiing.computeFromFile(FILE_PATH);

    console.timeEnd('SKI');

    console.log('Path Length: ', deepPath.length, ', Path: ', deepPath);

    const dropSize = deepPath.length;
    const largestDrop = deepPath[0] - deepPath[deepPath.length - 1];

    console.log('Size of drop ', dropSize, ', Largest drop: ', largestDrop);
})();
