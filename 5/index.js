const { getInput } = require("../setup");

const cratePattern = /\[(?<crate>\w)\]/;
const instructionPattern =
  /move (?<amount>\d+) from (?<from>\d+) to (?<to>\d+)/;

function toColumns(string = "") {
  const columns = [];
  for (let i = 0; i < string.length; i += 4) {
    const column = string.slice(i, i + 4);
    columns.push(column);
  }
  return columns;
}

function createState(rawState) {
  const upsideDown = rawState.split("\n").reverse().slice(1);
  const columns = upsideDown.map(toColumns);
  const state = columns[0].map(() => []);
  columns.forEach((row) => {
    row.forEach((place, index) => {
      const matches = place.match(cratePattern);
      if (matches?.groups.crate) {
        state[index].push(matches.groups.crate);
      }
    });
  });

  return state;
}

function parseInstructions(line = "") {
  const matches = line.match(instructionPattern);
  const { amount, from, to } = matches.groups;
  return { amount, from: from - 1, to: to - 1 };
}

function copyState(state) {
  return state.map((column) => column.map((crate) => crate));
}
function executeInstructions1(state, instructions) {
  const newState = copyState(state);
  instructions.forEach((instruction) => {
    const { amount, from, to } = instruction;
    for (let step = 0; step < amount; step++) {
      const element = newState[from].pop();
      newState[to].push(element);
    }
  });

  return newState;
}

function executeInstructions2(state, instructions) {
  const newState = copyState(state);
  instructions.forEach((instruction) => {
    const { amount, from, to } = instruction;
    const fromColumn = newState[from];
    const elements = fromColumn.splice(fromColumn.length - amount);
    newState[to].push(...elements);
  });

  return newState;
}

function getTopCrates(state) {
  return state.map((column) => column[column.length - 1]);
}

getInput((rawData) => {
  const [rawState, rawInstructions] = rawData.split("\n\n");
  const state = createState(rawState);
  const instructions = rawInstructions.split("\n").map(parseInstructions);

  const after1 = executeInstructions1(state, instructions);
  const topCrates1 = getTopCrates(after1);
  console.log(`[PART 1]: ${topCrates1.join("")}`);
  
  const after2 = executeInstructions2(state, instructions);
  const topCrates2 = getTopCrates(after2);
  console.log(`[PART 2]: ${topCrates2.join("")}`);
});
