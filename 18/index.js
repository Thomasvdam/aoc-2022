const { getInput } = require("../setup");

function processLine(line) {
  return line.split(",").map((rawDigit) => parseInt(rawDigit, 10));
}

function cubeToString(cube) {
  return cube.join(",");
}

function buildGridMap(cubes) {
  return new Map(
    cubes.map((cube) => {
      return [cubeToString(cube), cube];
    })
  );
}

function getNeighbourCubes(cube) {
  const neighbourDeltas = [1, -1];

  return neighbourDeltas.flatMap((delta) => {
    return cube.map((coord, index) => {
      const cubeCopy = Array.from(cube);
      cubeCopy[index] = coord + delta;
      return cubeCopy;
    });
  });
}

function countOpenSides(gridMap, cube) {
  const neighbouringCubes = getNeighbourCubes(cube).map((neighbour) =>
    cubeToString(neighbour)
  );

  const coveredSides = neighbouringCubes.reduce(
    (acc, cubeString) => (gridMap.has(cubeString) ? acc + 1 : acc),
    0
  );
  return 6 - coveredSides;
}

function isInGrid(grid, coords) {
  const [x, y, z] = coords;
  return typeof grid[x]?.[y]?.[z] === "boolean";
}

function buildSpace(cubes, gridMap) {
  const maxDimensions = cubes.reduce(
    (acc, cube) => {
      cube.forEach((val, index) => {
        if (val > acc[index]) acc[index] = val;
      });
      return acc;
    },
    [0, 0, 0]
  );

  const space = Array(maxDimensions[0] + 1)
    .fill(false)
    .map((_, x) =>
      Array(maxDimensions[1] + 1)
        .fill(false)
        .map((_, y) =>
          Array(maxDimensions[2] + 1)
            .fill(false)
            .map((_, z) => gridMap.has(cubeToString([x, y, z])))
        )
    );

  return space;
}

const OUTER_AIR_POCKET = Symbol("outer-air-pocket");

function getAirPockets(space) {
  const airPockets = new Set();

  space.forEach((xAxis, x) => {
    xAxis.forEach((yAxis, y) => {
      yAxis.forEach((isCube, z) => {
        if (isCube) return;
        const cubeString = cubeToString([x, y, z]);
        const neighbours = getNeighbourCubes([x, y, z])
          .filter((neigbour) => isInGrid(space, neigbour))
          .map((neigbour) => cubeToString(neigbour));
        const isOuterAir = neighbours.length !== 6;

        const connectedAirPockets = Array.from(airPockets.values()).filter(
          (airPocket) =>
            neighbours.some((neighbourString) => airPocket.has(neighbourString))
        );

        let pocket;
        if (connectedAirPockets.length === 0) {
          pocket = new Set();
          airPockets.add(pocket);
        } else if (connectedAirPockets.length === 1) {
          pocket = connectedAirPockets[0];
        } else {
          pocket = new Set(
            connectedAirPockets.flatMap((airPocket) =>
              Array.from(airPocket.values())
            )
          );
          airPockets.add(pocket);
          connectedAirPockets.forEach((airPocket) =>
            airPockets.delete(airPocket)
          );
        }
        pocket.add(cubeString);
        if (isOuterAir) pocket.add(OUTER_AIR_POCKET);
      });
    });
  });

  return airPockets;
}

function isInInnerAirPocket(airPockets, cubeString) {
  for (const airPocket of airPockets.values()) {
    if (airPocket.has(cubeString)) {
      return !airPocket.has(OUTER_AIR_POCKET);
    }
  }
  return false;
}

function countOuterOpenSides(gridMap, airPockets, cube) {
  const neighbouringCubes = getNeighbourCubes(cube).map((neighbour) =>
    cubeToString(neighbour)
  );

  const coveredSides = neighbouringCubes.reduce(
    (acc, cubeString) =>
      gridMap.has(cubeString) || isInInnerAirPocket(airPockets, cubeString)
        ? acc + 1
        : acc,
    0
  );
  return 6 - coveredSides;
}

getInput((rawData) => {
  const cubes = rawData.split("\n").map(processLine);
  const gridMap = buildGridMap(cubes);
  const totalOpenSides = Array.from(gridMap.values()).reduce(
    (acc, cube) => acc + countOpenSides(gridMap, cube),
    0
  );
  console.log(`[PART 1]: ${totalOpenSides}`);

  const space = buildSpace(cubes, gridMap);
  const airPockets = getAirPockets(space);
  const totalOuterOpenSides = Array.from(gridMap.values()).reduce(
    (acc, cube) => acc + countOuterOpenSides(gridMap, airPockets, cube),
    0
  );
  console.log(`[PART 2]: ${totalOuterOpenSides}`);
  // 3224 too high
});
