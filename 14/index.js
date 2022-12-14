const { getInput } = require("../setup");

function processLine(line) {
  return line.split(" -> ").map((coordsRaw) => {
    const coords = coordsRaw.split(",");
    return coords.map((coord) => parseInt(coord, 10));
  });
}

function getLineCoords(start, end) {
  const [startX, startY] = start;
  const [endX, endY] = end;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  const coords = [];
  for (let x = 0; x < Math.abs(deltaX) + 1; x++) {
    const xCoord = startX + Math.sign(deltaX) * x;
    for (let y = 0; y < Math.abs(deltaY) + 1; y++) {
      const yCoord = startY + Math.sign(deltaY) * y;
      coords.push([xCoord, yCoord]);
    }
  }

  return coords;
}

function createStartingState(lines) {
  const state = {
    sandSource: [500, 0],
    xCoords: new Set([500]),
    yCoords: new Set([0]),
    walls: new Set(),
    sand: new Set(),
  };
  lines.forEach((line) => {
    for (let point = 0; point < line.length - 1; point++) {
      const coords = getLineCoords(line[point], line[point + 1]);
      coords.forEach(([x, y]) => {
        state.xCoords.add(x);
        state.yCoords.add(y);
        state.walls.add(`${x},${y}`);
      });
    }
  });
  return state;
}

function sortAscending(a, b) {
  return a - b;
}

function getMinMaxCorrected(array, correction) {
  const sortedArray = array.sort(sortAscending);
  const min = sortedArray[0];
  const max = sortedArray[sortedArray.length - 1];
  return [min - correction, max - correction];
}

function getPrintable(state, coordsString) {
  if (state.walls.has(coordsString)) return "#";
  if (state.sand.has(coordsString)) return "o";
  return " ";
}

function convertToGrid(state) {
  const xCorrection = state.sandSource[0];
  const yCorrection = state.sandSource[1];
  const [minX, maxX] = getMinMaxCorrected(
    Array.from(state.xCoords),
    xCorrection
  );
  const [minY, maxY] = getMinMaxCorrected(
    Array.from(state.yCoords),
    yCorrection
  );

  const grid = [];
  for (let y = minY; y <= maxY; y++) {
    const row = [];
    for (let x = minX; x <= maxX; x++) {
      const coordsString = `${x + xCorrection},${y + yCorrection}`;
      if (y === 0 && x === 0) {
        row.push("+");
        state.sandSource = [x - minX, y - minY];
        continue;
      }
      const char = getPrintable(state, coordsString);
      row.push(char);
    }
    grid.push(row);
  }

  state.grid = grid;
  return state;
}

function convertToFlooredGrid(state) {
  const xCorrection = state.sandSource[0];
  const yCorrection = state.sandSource[1];
  const [minY, maxY] = getMinMaxCorrected(
    Array.from(state.yCoords),
    yCorrection
  );
  const maxWidth = (maxY + 2) * 2 + 1;
  const halfWidth = Math.floor(maxWidth / 2);
  const minX = 0 - halfWidth;
  const maxX = halfWidth;

  const grid = [];
  for (let y = minY; y <= maxY; y++) {
    const row = [];
    for (let x = minX; x <= maxX; x++) {
      const coordsString = `${x + xCorrection},${y + yCorrection}`;
      if (y === 0 && x === 0) {
        row.push("+");
        state.sandSource = [x - minX, y - minY];
        continue;
      }
      const char = getPrintable(state, coordsString);
      row.push(char);
    }
    grid.push(row);
  }

  grid.push(Array(maxWidth).fill(" "));
  grid.push(Array(maxWidth).fill("#"));

  state.grid = grid;
  return state;
}

function drawGrid(grid) {
  grid.forEach((row) => {
    row.forEach((char) => {
      process.stdout.write(char);
    });
    process.stdout.write("\n");
  });
}

function isTraversable(spot) {
  return spot === " " || spot === undefined;
}

function addSand(state) {
  const { grid } = state;
  let [x, y] = state.sandSource;
  const gridWidth = state.grid[0].length;
  const gridHeight = state.grid.length;
  while (x >= 0 && x < gridWidth && y < gridHeight) {
    if (isTraversable(grid[y + 1]?.[x])) {
      y++;
      continue;
    } else if (isTraversable(grid[y + 1]?.[x - 1])) {
      y++;
      x--;
      continue;
    } else if (isTraversable(grid[y + 1]?.[x + 1])) {
      y++;
      x++;
      continue;
    }
    const prevTile = grid[y][x];
    grid[y][x] = "o";
    state.sand.add(`${x},${y}`);
    return prevTile !== "+";
  }

  return false;
}

getInput((rawData) => {
  const data = rawData.split("\n").map(processLine);
  const state = createStartingState(data);
  convertToGrid(state);
  let inMotion = true;
  while (inMotion) {
    inMotion = addSand(state);
  }
  drawGrid(state.grid);
  console.log(`[PART 1]: ${state.sand.size}`);

  const state2 = createStartingState(data);
  convertToFlooredGrid(state2);
  let inMotion2 = true;
  while (inMotion2) {
    inMotion2 = addSand(state2);
  }
  drawGrid(state2.grid);
  console.log(`[PART 2]: ${state2.sand.size}`);
});
