const { getInput } = require("../setup");

function generateRock(no, height) {
  const newHeight = height + 3;
  const index = no % 5;
  if (index === 0) {
    return {
      rock: [
        [2, newHeight],
        [3, newHeight],
        [4, newHeight],
        [5, newHeight],
      ],
      newMaxHeight: newHeight,
    };
  } else if (index === 1) {
    return {
      rock: [
        [2, newHeight + 1],
        [3, newHeight],
        [3, newHeight + 1],
        [3, newHeight + 2],
        [4, newHeight + 1],
      ],
      newMaxHeight: newHeight + 2,
    };
  } else if (index === 2) {
    return {
      rock: [
        [2, newHeight],
        [3, newHeight],
        [4, newHeight],
        [4, newHeight + 1],
        [4, newHeight + 2],
      ],
      newMaxHeight: newHeight + 2,
    };
  } else if (index === 3) {
    return {
      rock: [
        [2, newHeight],
        [2, newHeight + 1],
        [2, newHeight + 2],
        [2, newHeight + 3],
      ],
      newMaxHeight: newHeight + 3,
    };
  } else if (index === 4) {
    return {
      rock: [
        [2, newHeight],
        [3, newHeight],
        [2, newHeight + 1],
        [3, newHeight + 1],
      ],
      newMaxHeight: newHeight + 1,
    };
  }
}

function moveRock(width, rock, direction) {
  if (direction === "<" && rock[0][0] > 0) {
    return rock.map(([x, y]) => [x - 1, y]);
  } else if (direction === ">" && rock[rock.length - 1][0] < width - 1) {
    return rock.map(([x, y]) => [x + 1, y]);
  } else if (direction === "v") {
    return rock.map(([x, y]) => [x, y - 1]);
  }

  return rock;
}

function rockCollides(grid, rock) {
  return rock.some(([x, y]) => {
    return y === -1 || grid[y][x];
  });
}

function processLine(line) {
  return line.split("");
}

function addRow(width, grid) {
  grid.push(Array(width).fill(false));
}

function pruneGrid(width, grid) {
  const gridSize = grid.length;
  const newGrid = [];

  let closedLtr = -1;

  for (let y = gridSize - 1; y >= 0; y--) {
    const line = grid[y];
    newGrid.push(line);

    let closing = false;
    line.forEach((pos, index) => {
      if (index < closedLtr) return;
      if (pos) {
        if (closedLtr === index - 1 || closedLtr === index) {
          closedLtr = index;
          closing = true;
        }
      } else {
        if (closing) return;
        if (index > closedLtr) closedLtr = -1;
      }
    });
    if (!closing) closedLtr = -1;

    if (closedLtr === 6) break;
  }

  return {
    newGrid: newGrid.reverse(),
    delta: gridSize - newGrid.length,
  };
}

function hashState(grid, jetsIndex, rockIndex) {
  const gridString = grid
    .map((row) => {
      return row.map((pos) => (pos ? "." : "#")).join("");
    })
    .join("");
  return `${rockIndex},${jetsIndex},${gridString}`;
}

function simulate(width, jets, limit) {
  let rocks = 0;
  let jetsPointer = 0;

  let maxHeight = 0;
  let heightAdjustment = 0;
  let grid = [];
  const statesMap = new Map();
  addRow(width, grid);

  while (rocks < limit) {
    let { rock, newMaxHeight } = generateRock(
      rocks,
      maxHeight - heightAdjustment
    );
    const delta = newMaxHeight + 1 - grid.length;
    for (let i = 0; i <= delta; i++) {
      addRow(width, grid);
    }

    while (true) {
      const jet = jets[jetsPointer % jets.length];
      jetsPointer++;

      const shiftedRock = moveRock(width, rock, jet);
      if (!rockCollides(grid, shiftedRock)) {
        rock = shiftedRock;
      }

      const droppedRock = moveRock(width, rock, "v");
      if (rockCollides(grid, droppedRock)) {
        rock.forEach(([x, y]) => (grid[y][x] = true));
        break;
      }
      rock = droppedRock;
    }
    maxHeight =
      heightAdjustment +
      grid.reduceRight((acc, line, index) => {
        if (acc) return acc;
        if (line.some((val) => val)) return index + 1;
      }, 0);

    const pruneResult = pruneGrid(width, grid);
    grid = pruneResult.newGrid;
    heightAdjustment += pruneResult.delta;

    const hash = hashState(grid, jetsPointer % jets.length, rocks % 5);
    if (statesMap.has(hash)) {
      const { rocks: cycleStartRocks, maxHeight: cycleStartHeight } =
        statesMap.get(hash);

      const cycleLength = rocks - cycleStartRocks;
      const cycleDelta = maxHeight - cycleStartHeight;

      const remainingRocks = limit - rocks;
      const cyclesToSkip = Math.floor(remainingRocks / cycleLength);

      heightAdjustment += cyclesToSkip * cycleDelta;
      maxHeight += cyclesToSkip * cycleDelta;
      rocks += cyclesToSkip * cycleLength;
    }
    statesMap.set(hash, { rocks, maxHeight });

    rocks++;
  }

  return maxHeight;
}

getInput((rawData) => {
  const jets = rawData.split("\n").map(processLine)[0];
  const partOne = simulate(7, jets, 2022);
  console.log(`[PART 1]: ${partOne}`);

  const partTwo = simulate(7, jets, 1_000_000_000_000);
  console.log(`[PART 2]: ${partTwo}`);
});
