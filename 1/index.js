const { getInput } = require('../setup');

function processLine(line) {
    return parseInt(line, 10);
}

function processBlock(block) {
    return block.split('\n').map(processLine);
} 

getInput(rawData => {
    const data = rawData.split('\n\n').map(processBlock);

    const elfTotals = data.map(elf => elf.reduce((acc,next) => acc + next)).sort();
    const highest = elfTotals[elfTotals.length - 1];
    console.log(`[PART 1]: ${highest}`);

    const partTwo = elfTotals.slice(-3).reduce((acc, elf) => acc + elf);
    console.log('[DEBUG]: partTwo ::: ', partTwo);
});
