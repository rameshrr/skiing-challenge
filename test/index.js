const Skiing = require('../');
const path = require('path');

var argv = require('minimist')(process.argv.slice(2));

const skiing = new Skiing();

const FILE_PATH = path.resolve(__dirname, './map.txt');
// const FILE_PATH = path.resolve(__dirname, './map.sample.txt');

let DATA_URL = '';

if (argv.DATA_URL) {
    console.log('Reading data from user defined data URL. :)');
    console.log('URL: ', argv.DATA_URL);

    DATA_URL = argv.DATA_URL;
}

(async function findPath() {

    console.time('SKI');

    let deepPath = [];
    if (argv.DATA_URL) {
        deepPath = await skiing.computeFromUrl(DATA_URL);
    } else {
        deepPath = await skiing.computeFromFile(FILE_PATH);
    }

    console.timeEnd('SKI');

    console.log('Path Length: ', deepPath.length, ', Path: ', deepPath.toString());

    const dropSize = deepPath.length;
    const largestDrop = deepPath[0] - deepPath[deepPath.length - 1];

    console.log('Size of drop ', dropSize, ', Largest drop: ', largestDrop);
})();
