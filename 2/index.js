const { getInput } = require('../setup');

const ROCK = 0;
const PAPER = 1;
const SCISSORS = 2;

const LOSS = 0;
const DRAW = 3;
const WIN = 6;

const mapping1 = {
    A: ROCK,
    B: PAPER,
    C: SCISSORS,
    X: ROCK,
    Y: PAPER,
    Z: SCISSORS,
};

function getResult(opponent, player) {
    if (opponent === player) return DRAW;
    const delta = opponent - player;
    if (delta === -1 || delta === 2) return WIN;
    return LOSS;
}

function getScore1([opponent, player]) {
    return getResult(opponent, player) + player + 1;
}

function processLine1(line) {
    return line.split(' ').map(action => mapping1[action]);
}

const mapping2 = {
    A: ROCK,
    B: PAPER,
    C: SCISSORS,
    X: LOSS,
    Y: DRAW,
    Z: WIN,
};

/**
 * 6 1 -> 2 
 * 6 2 -> 3 
 * 6 3 -> 1 
 * 0 1 -> 3
 * 0 2 -> 1
 * 0 3 -> 2
 */

function getMove(opponent, result) {
    if (result === DRAW) return opponent;
    if (result === WIN) return (opponent + 1) % 3;
    return (opponent + 2) % 3;
}

function getScore2([opponent, result]) {
    return getMove(opponent, result) + 1 + result;
}

function processLine2(line) {
    return line.split(' ').map(action => mapping2[action]);
}

getInput(rawData => {
    const data1 = rawData.split('\n').map(processLine1);
    const totalScore1 = data1.map(getScore1).reduce((acc, next) => acc + next);
    console.log(`[PART 1]: ${totalScore1}`);

    const data2 = rawData.split('\n').map(processLine2);
    const totalScore2 = data2.map(getScore2).reduce((acc, next) => acc + next);
    console.log(`[PART 2]: ${totalScore2}`);
});
