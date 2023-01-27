const { getInput } = require('../setup');

function processLine(line) {
    return line;
}

getInput(rawData => {
    const data = rawData.split('\n').map(processLine);
});
