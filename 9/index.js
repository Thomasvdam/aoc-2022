const { getInput } = require("../setup");

const DIRECTION_MAP = {
  R: [1, 0],
  L: [-1, 0],
  U: [0, 1],
  D: [0, -1],
};

function processLine(line) {
  const [dir, amount] = line.split(" ");
  return {
    dir,
    amount: parseInt(amount, 10),
  };
}

function getNextPosition(head, next) {
  const [headX, headY] = head;
  const [nextX, nextY] = next;

  const deltaX = headX - nextX;
  const absDeltaX = Math.abs(deltaX);
  const deltaY = headY - nextY;
  const absDeltaY = Math.abs(deltaY);

  if (absDeltaX < 2 && absDeltaY < 2) return next;

  if (absDeltaX === 0) {
    return [nextX, Math.sign(deltaY) + nextY];
  } else if (absDeltaY === 0) {
    return [Math.sign(deltaX) + nextX, nextY];
  }

  return [Math.sign(deltaX) + nextX, Math.sign(deltaY) + nextY];
}

function executeInstruction(state, direction) {
  const [xDelta, yDelta] = DIRECTION_MAP[direction];
  const [x, y] = state.rope[0];
  state.rope[0] = [x + xDelta, y + yDelta];
  for (let index = 0; index < state.rope.length - 1; index++) {
    const firstSegment = state.rope[index];
    const nextSegment = state.rope[index + 1];
    const nextSegmentUpdated = getNextPosition(firstSegment, nextSegment);
    state.rope[index + 1] = nextSegmentUpdated;
  }

  state.history.add(state.rope[state.rope.length - 1].join(","));
}

getInput((rawData) => {
  const steps = rawData.split("\n").map(processLine);
  const state = {
    rope: [[0, 0], [0, 0]],
    history: new Set(["0,0"]),
  };

  steps.forEach(({ dir, amount }) => {
    for (let step = 0; step < amount; step++) {
      executeInstruction(state, dir);
    }
  });
  console.log(`[PART 1]: ${state.history.size}`);

  const state2 = {
    rope: Array(10).fill([0,0]),
    history: new Set(["0,0"]),
  };
  steps.forEach(({ dir, amount }) => {
    for (let step = 0; step < amount; step++) {
      executeInstruction(state2, dir);
    }
  });
  console.log(`[PART 2]: ${state2.history.size}`);
});
