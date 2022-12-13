const { getInput } = require("../setup");

function processChar(char) {
  if (char === "S") return { start: true, height: 0 };
  if (char === "E") return { finish: true, height: 25 };
  return {
    height: char.codePointAt() - "a".codePointAt(),
  };
}

function processLine(line) {
  return line.split("").map(processChar);
}

function getNeighbours(grid, x, y) {
  const up = grid[y - 1]?.[x];
  const down = grid[y + 1]?.[x];
  const left = grid[y][x - 1];
  const right = grid[y][x + 1];
  return [
    { dir: "^", node: up },
    { dir: "v", node: down },
    { dir: "<", node: left },
    { dir: ">", node: right },
  ].filter((neighbour) => !!neighbour.node);
}

function getPaths(tile, neighbours) {
  const eligbleNeighbours = neighbours.filter(
    ({ node }) => node.height - tile.height <= 1
  );

  return eligbleNeighbours.map((nDir) => ({
    dir: nDir.dir,
    score: nDir.node.height - tile.height,
    destination: nDir.node,
  }));
}

function buildNetwork(grid) {
  grid.forEach((row, y) => {
    row.forEach((tile, x) => {
      const neighbours = getNeighbours(grid, x, y);
      tile.paths = getPaths(tile, neighbours);
    });
  });
}

function getStartingNode(grid) {
  for (const row of grid) {
    for (const tile of row) {
      if (tile.start) return tile;
    }
  }
  throw new Error("Unable to find starting tile");
}

function getStartingNodes(grid) {
  const startingTiles = [];
  for (const row of grid) {
    for (const tile of row) {
      if (tile.height === 0) startingTiles.push(tile);
    }
  }
  return startingTiles;
}

function getAssumedLowestCostNode(options, assumedCostMap) {
  let lowestCostNode;
  let lowestCost = Infinity;
  for (const [option] of options.entries()) {
    const optionCost = assumedCostMap.get(option);
    if (optionCost <= lowestCost) {
      lowestCost = optionCost;
      lowestCostNode = option;
    }
  }

  return lowestCostNode;
}

function constructPath(visited, end) {
  const pathReversed = [end];
  let current = end;
  while (visited.has(current)) {
    current = visited.get(current);
    pathReversed.push(current);
  }

  return pathReversed.reverse();
}

function findPath(startingNode) {
  const options = new Set([startingNode]);
  const visited = new Map();
  const costMap = new Map([[startingNode, 0]]);
  const assumedCostMap = new Map([[startingNode, 0]]);

  while (options.size) {
    const current = getAssumedLowestCostNode(options, assumedCostMap);
    if (current.finish) {
      return constructPath(visited, current);
    }
    options.delete(current);
    current.paths.forEach((path) => {
      const tentativeScore = -1 * path.score + costMap.get(current) + 1;
      if (tentativeScore < (costMap.get(path.destination) ?? Infinity)) {
        visited.set(path.destination, current);
        costMap.set(path.destination, tentativeScore);
        assumedCostMap.set(path.destination, tentativeScore);
        options.add(path.destination);
      }
    });
  }

  return null;
}

function printGridAndPath(grid, path) {
  const pathSet = new Set(path);
  const aCode = "a".codePointAt();
  grid.forEach((row) => {
    const rowLine = row
      .map((node) => {
        if (node.start) return "S";
        if (node.finish) return "E";
        if (pathSet.has(node))
          return (
            "\x1b[31m" + String.fromCodePoint(node.height + aCode) + "\x1b[0m"
          );
        return String.fromCodePoint(node.height + aCode);
      })
      .join("");
    console.log(rowLine);
  });
}

getInput((rawData) => {
  const grid = rawData.split("\n").map(processLine);
  buildNetwork(grid);
  const startingNode = getStartingNode(grid);
  const path = findPath(startingNode);
  // Steps are the edges between visited nodes, not all the nodes
  const totalSteps = path.length - 1;
  console.log(`[PART 1]: ${totalSteps}`);
  printGridAndPath(grid, path);
  console.log("");

  const startingNodes = getStartingNodes(grid);
  const paths = startingNodes
    .map((startingNodePart2) => findPath(startingNodePart2))
    .filter(Boolean)
    .sort((a, b) => a.length - b.length);
  const shortestPath = paths[0];
  const totalStepsShortestPath = shortestPath.length - 1;
  console.log(`[PART 2]: ${totalStepsShortestPath}`);
  printGridAndPath(grid, shortestPath);
});
