const { getInput } = require("../setup");

/** Clockwise starting N */
const NEIGHBOUR_DELTAS = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];
const DIRECTION_MAP = {
  N: 0,
  NE: 1,
  E: 2,
  SE: 3,
  S: 4,
  SW: 5,
  W: 6,
  NW: 7,
};

function checkDirectionsEmpty(neighbours, directions) {
  return directions.every((direction) => {
    return !neighbours[DIRECTION_MAP[direction]];
  });
}

const MOVES = [
  (neighbours) =>
    checkDirectionsEmpty(neighbours, ["N", "NE", "NW"]) ? "N" : null,
  (neighbours) =>
    checkDirectionsEmpty(neighbours, ["S", "SE", "SW"]) ? "S" : null,
  (neighbours) =>
    checkDirectionsEmpty(neighbours, ["W", "NW", "SW"]) ? "W" : null,
  (neighbours) =>
    checkDirectionsEmpty(neighbours, ["E", "NE", "SE"]) ? "E" : null,
];

function processLine(line) {
  return line.split("").map((char) => char === "#");
}

function buildState(data) {
  const state = new Set();
  data.forEach((row, y) => {
    row.forEach((hasElf, x) => {
      if (!hasElf) return;
      state.add(coordsToElf([x, y]));
    });
  });

  return state;
}

function coordsToElf([x, y]) {
  return `${x},${y}`;
}

function elfToCoords(elf) {
  return elf.split(",").map((num) => parseInt(num, 10));
}

function getNeighbours(state, elf) {
  const [x, y] = elfToCoords(elf);
  return NEIGHBOUR_DELTAS.map(([deltaX, deltaY]) =>
    state.has(`${x + deltaX},${y + deltaY}`)
  );
}

function executeRound(state, moveOrder) {
  const proposedMoves = new Map();

  for (elf of state.values()) {
    const neighbours = getNeighbours(state, elf);
    if (neighbours.every((neighbour) => !neighbour)) continue;

    const getMove = moveOrder.find((look) => look(neighbours));
    if (!getMove) continue;
    const [deltaX, deltaY] =
      NEIGHBOUR_DELTAS[DIRECTION_MAP[getMove(neighbours)]];
    const [x, y] = elfToCoords(elf);
    const proposedMove = coordsToElf([x + deltaX, y + deltaY]);

    if (proposedMoves.has(proposedMove)) {
      proposedMoves.set(proposedMove, null);
    } else {
      proposedMoves.set(proposedMove, elf);
    }
  }

  let moved = false;
  for ([destination, elf] of proposedMoves.entries()) {
    if (!elf) continue;
    state.delete(elf);
    state.add(destination);
    moved = true;
  }

  return moved;
}

function simulateRounds(state, moveOrder, rounds) {
  for (let round = 0; round < rounds; round++) {
    executeRound(state, moveOrder);
    const move = moveOrder.shift();
    moveOrder.push(move);
  }
}

function finishSimulation(state, moveOrder) {
  let round = 1;
  while (executeRound(state, moveOrder)) {
    const move = moveOrder.shift();
    moveOrder.push(move);
    round++;
  }

  return round;
}

function getDimensions(state) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const elf of state) {
    const [x, y] = elfToCoords(elf);
    minX = Math.min(x, minX);
    maxX = Math.max(x, maxX);
    minY = Math.min(y, minY);
    maxY = Math.max(y, maxY);
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  return [width, height, minX, minY, maxX, maxY];
}

function countEmptyPlots(state) {
  const [width, height] = getDimensions(state);
  return width * height - state.size;
}

function printPlot(state) {
  const [width, height, minX, minY, maxX, maxY] = getDimensions(state);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const char = state.has(coordsToElf([x, y])) ? "#" : ".";
      process.stdout.write(char);
    }
    process.stdout.write("\n");
  }
}

getInput((rawData) => {
  const data = rawData.split("\n").map(processLine);
  const state = buildState(data);
  simulateRounds(
    state,
    MOVES.map((look) => look),
    10
  );
  const partOne = countEmptyPlots(state);
  console.log(`[PART 1]: ${partOne}`);

  const state2 = buildState(data);
  const partTwo = finishSimulation(
    state2,
    MOVES.map((look) => look)
  );
  console.log(`[PART 2]: ${partTwo}`);
});
