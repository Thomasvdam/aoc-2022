const { getInput } = require("../setup");

const FACINGS = ["right", "down", "left", "up"];

function getNewFacing(current, direction) {
  const currentIndex = FACINGS.findIndex((facing) => facing === current);
  let nextIndex =
    (currentIndex + (direction === "right" ? 1 : -1)) % FACINGS.length;
  if (nextIndex < 0) nextIndex = FACINGS.length - 1;
  return FACINGS[nextIndex];
}

function processInstructionsLine(line) {
  let current = "";
  return line.split("").reduce((acc, char, index) => {
    if (char === "R" || char === "L") {
      if (current) {
        acc.push({ dir: "forw", amount: parseInt(current, 10) });
        current = "";
      }
      acc.push({ dir: char === "R" ? "right" : "left", amount: 0 });
    } else {
      current += char;
      if (index === line.length - 1) {
        acc.push({ dir: "forw", amount: parseInt(current, 10) });
        current = "";
      }
    }
    return acc;
  }, []);
}

function getNeighbour(nodeGrid, getCoords) {
  let iteration = 1;
  while (true) {
    const [x, y] = getCoords(iteration);

    const neighbour = nodeGrid[y][x];
    if (neighbour) {
      return neighbour.wall ? null : neighbour;
    }
    iteration++;
  }
}

function getLeftNeighbour(max, x, y) {
  return (iteration) => {
    const delta = iteration * -1;
    let newX = x + delta;
    if (newX < 0) newX = max + newX;
    return [newX, y];
  };
}
function getRightNeighbour(max, x, y) {
  return (iteration) => {
    const delta = iteration * 1;
    let newX = x + delta;
    if (newX >= max) newX = newX - max;
    return [newX, y];
  };
}
function getDownNeighbour(max, x, y) {
  return (iteration) => {
    const delta = iteration * 1;
    let newY = y + delta;
    if (newY >= max) newY = newY - max;
    return [x, newY];
  };
}
function getUpNeighbour(max, x, y) {
  return (iteration) => {
    const delta = iteration * -1;
    let newY = y + delta;
    if (newY < 0) newY = max + newY;
    return [x, newY];
  };
}

function connectNodesMap(nodeGrid) {
  const maxWidth = nodeGrid[0].length;
  const maxHeight = nodeGrid.length;
  nodeGrid.forEach((row, y) => {
    row.forEach((node, x) => {
      if (!node) return;
      node.left = getNeighbour(nodeGrid, getLeftNeighbour(maxWidth, x, y));
      node.right = getNeighbour(nodeGrid, getRightNeighbour(maxWidth, x, y));
      node.up = getNeighbour(nodeGrid, getUpNeighbour(maxHeight, x, y));
      node.down = getNeighbour(nodeGrid, getDownNeighbour(maxHeight, x, y));
    });
  });
}

function isEdgeNode(node) {
  return !node.left || !node.right || !node.up || !node.down;
}

/**
 * Won't work for 1x1x1 cubes.
 */
function isCornerNode(node) {
  return FACINGS.reduce((acc, facing) => acc + (node[facing] ? 1 : 0), 0) === 2;
}

const DELTAS = [-1, 1];
function getAdjacentEdgeNode(edgeNodes, node) {
  const { row, column } = node;
  for (const delta of DELTAS) {
    const nodeString = `${column},${row + delta}`;
    if (edgeNodes.has(nodeString)) return edgeNodes.get(nodeString);
  }
  for (const delta of DELTAS) {
    const nodeString = `${column + delta},${row}`;
    if (edgeNodes.has(nodeString)) return edgeNodes.get(nodeString);
  }
  return null;
}
function getDiagonal(edgeNodes, node) {
  const { row, column } = node;
  for (const deltaRow of DELTAS) {
    for (const deltaColumn of DELTAS) {
      const nodeString = `${column + deltaColumn},${row + deltaRow}`;
      if (edgeNodes.has(nodeString)) return edgeNodes.get(nodeString);
    }
  }

  return null;
}

function findInnerCornerPair(edgeNodes) {
  for (const node of edgeNodes.values()) {
    const diagonal = getDiagonal(edgeNodes, node);
    if (!diagonal) continue;
    if (
      FACINGS.some(
        (facing) => diagonal[facing] && isCornerNode(diagonal[facing]?.newNode)
      )
    ) {
      continue;
    }
    return [node, diagonal];
  }
}

function getEdgeDir(node) {
  return FACINGS.find((facing) => !node[facing]);
}

function getOppositeDir(dir) {
  switch (dir) {
    case "right":
      return "left";
    case "left":
      return "right";
    case "up":
      return "down";
    case "down":
      return "up";
  }
  throw new Error(`What are you doing, ${dir} is not a valid value`);
}

/**
 * Won't work for all cube unfoldings, but works for the example and actual input.
 */
function connectEdges(edgeNodes, a, b) {
  let dirA = getEdgeDir(a);
  let dirB = getEdgeDir(b);
  let currentA = a;
  let currentB = b;

  while (currentA && currentB) {
    const aIsCorner = isCornerNode(currentA);
    const bIsCorner = isCornerNode(currentB);
    currentA[dirA] = { newDir: getOppositeDir(dirB), newNode: currentB };
    currentB[dirB] = { newDir: getOppositeDir(dirA), newNode: currentA };
    if (!isEdgeNode(currentA))
      edgeNodes.delete(`${currentA.column},${currentA.row}`);
    if (!isEdgeNode(currentB))
      edgeNodes.delete(`${currentB.column},${currentB.row}`);

    if (aIsCorner && bIsCorner) {
      return;
    }

    if (aIsCorner) dirA = getEdgeDir(currentA);
    else currentA = getAdjacentEdgeNode(edgeNodes, currentA);

    if (bIsCorner) dirB = getEdgeDir(currentB);
    else currentB = getAdjacentEdgeNode(edgeNodes, currentB);
  }
}

function connectNodesCube(nodeGrid) {
  const edgeNodes = new Map();
  nodeGrid.forEach((row, y) => {
    row.forEach((node, x) => {
      if (!node) return;
      node.left = nodeGrid[y][x - 1] ?? null;
      node.right = nodeGrid[y][x + 1] ?? null;
      node.up = nodeGrid[y - 1]?.[x] ?? null;
      node.down = nodeGrid[y + 1]?.[x] ?? null;
      if (isEdgeNode(node)) edgeNodes.set(`${node.column},${node.row}`, node);
      FACINGS.forEach((facing) => {
        if (!node[facing]) return;
        const destination = node[facing];
        node[facing] = {
          newDir: facing,
          newNode: destination,
        };
      });
    });
  });

  while (edgeNodes.size) {
    const [a, b] = findInnerCornerPair(edgeNodes);
    connectEdges(edgeNodes, a, b);
  }

  // Horribly inefficient but I just want to get this over with;
  nodeGrid.forEach((row) => {
    row.forEach((node) => {
      if (!node) return;
      FACINGS.forEach((facing) => {
        if (!node[facing].newNode.wall) return;
        node[facing] = null;
      });
    });
  });
}

function buildNode(char, x, y) {
  if (char === " ") return null;
  return {
    row: y + 1,
    column: x + 1,
    left: null,
    right: null,
    up: null,
    down: null,
    wall: char === "#",
  };
}

function buildMap(lines) {
  const charGrid = lines.split("\n").map((line) => line.split(""));
  let startNode = null;
  const nodeGrid = charGrid.map((row, y) => {
    return row.map((char, x) => {
      const node = buildNode(char, x, y);
      if (!startNode && node) startNode = node;
      return node;
    });
  });

  return [startNode, nodeGrid];
}

function executeInstructions(startFacing, startNode, instructions) {
  let currentPosition = startNode;
  let currentFacing = startFacing;
  currentPosition.lastFacing = currentFacing;
  instructions.forEach(({ dir, amount }) => {
    if (dir === "forw") {
      for (let step = 0; step < amount; step++) {
        currentPosition = currentPosition[currentFacing] ?? currentPosition;
        currentPosition.lastFacing = currentFacing;
      }
    } else {
      currentFacing = getNewFacing(currentFacing, dir);
      currentPosition.lastFacing = currentFacing;
    }
  });

  return currentPosition;
}

function executeInstructionsCube(startFacing, startNode, instructions) {
  let currentPosition = startNode;
  let currentFacing = startFacing;
  currentPosition.lastFacing = currentFacing;
  instructions.forEach(({ dir, amount }) => {
    if (dir === "forw") {
      for (let step = 0; step < amount; step++) {
        const move = currentPosition[currentFacing];
        if (!move) break;

        currentPosition = move.newNode;
        currentFacing = move.newDir;
        currentPosition.lastFacing = currentFacing;
      }
    } else {
      currentFacing = getNewFacing(currentFacing, dir);
      currentPosition.lastFacing = currentFacing;
    }
  });

  return currentPosition;
}
function getNodeChar(node) {
  if (!node) return " ";
  if (node.wall) return "#";
  if (!node.lastFacing) return ".";
  switch (node.lastFacing) {
    case "right":
      return ">";
    case "left":
      return "<";
    case "up":
      return "^";
    case "down":
      return "v";
    default:
      throw new Error("What am I doing?");
  }
}

function printGrid(nodeGrid) {
  process.stdout.write("\n");
  nodeGrid.forEach((row) => {
    row.forEach((node) => {
      const char = getNodeChar(node);
      process.stdout.write(char);
    });
    process.stdout.write("\n");
  });
}

function getPassword(node) {
  return (
    node.row * 1000 +
    node.column * 4 +
    FACINGS.findIndex((facing) => facing === node.lastFacing)
  );
}

getInput((rawData) => {
  const [mapLines, instructionsLine] = rawData.split("\n\n");
  const instructions = processInstructionsLine(instructionsLine);
  const [startNode, nodeGrid] = buildMap(mapLines);
  connectNodesMap(nodeGrid);
  const endNode = executeInstructions("right", startNode, instructions);
  const partOne = getPassword(endNode);
  console.log(`[PART 1]: ${partOne}`);

  const [startNode2, nodeGrid2] = buildMap(mapLines);
  connectNodesCube(nodeGrid2);
  const endNode2 = executeInstructionsCube("right", startNode2, instructions);
  const partTwo = getPassword(endNode2);
  console.log(`[PART 2]: ${partTwo}`);
});
