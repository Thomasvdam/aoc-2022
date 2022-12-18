const { getInput } = require("../setup");

const COORD_PATTERN = /x=(?<x>-?\d+), y=(?<y>-?\d+)/;

function parseCoords(stringToParse) {
  const { x, y } = stringToParse.match(COORD_PATTERN).groups;
  return {
    x: parseInt(x, 10),
    y: parseInt(y, 10),
  };
}

function processLine(line) {
  const [sensorPart, beaconPart] = line.split(":");
  return {
    sensor: parseCoords(sensorPart),
    beacon: parseCoords(beaconPart),
  };
}

function addRadius(reading) {
  const deltaX = Math.abs(reading.sensor.x - reading.beacon.x);
  const deltaY = Math.abs(reading.sensor.y - reading.beacon.y);
  reading.radius = deltaX + deltaY;
  reading.maxY = reading.sensor.y + reading.radius;
  reading.minY = reading.sensor.y - reading.radius;
  reading.maxX = reading.sensor.x + reading.radius;
  reading.minX = reading.sensor.x - reading.radius;
}

function intersectsYvalue(reading, yTarget) {
  return reading.minY <= yTarget && yTarget <= reading.maxY;
}

function getCoveredPositionsForYvalue(readings, yTarget) {
  const coveredPositions = new Set();
  readings.forEach((reading) => {
    const {
      radius,
      sensor: { x, y },
    } = reading;
    const widthAtY = radius - Math.abs(y - yTarget);
    for (let xPos = x - widthAtY; xPos <= x + widthAtY; xPos++) {
      if (
        readings.find(
          (reading) => reading.beacon.x === xPos && reading.beacon.y === yTarget
        )
      ) {
        continue;
      }
      coveredPositions.add(xPos);
    }
  });

  return coveredPositions;
}

function getCoordsInLine(aX, aY, bX, bY, searchSpace) {
  const [min, max] = searchSpace;
  const coords = new Set();
  const deltaX = bX - aX;
  const deltaY = bY - aY;
  let yPos = aY;
  let xPos = aX;
  for (let index = 0; index <= Math.abs(deltaX); index++) {
    if (xPos < min || xPos > max || yPos < min || yPos > max) continue;
    coords.add(`${xPos},${yPos}`);
    yPos += Math.sign(deltaY);
    xPos += Math.sign(deltaX);
  }
  return coords;
}

// Super dumb but before I finished a smarter method it had already completed...
function getIntersection(lineA, lineB, searchSpace) {
  const coordsA = getCoordsInLine(...lineA, searchSpace);
  const coordsB = getCoordsInLine(...lineB, searchSpace);
  for (const coords of coordsA.values()) {
    if (coordsB.has(coords)) return coords;
  }
  return null;
}

function getPerimeterLines(reading) {
  const ltrUpUpper = [
    reading.minX - 1,
    reading.sensor.y,
    reading.sensor.x,
    reading.minY - 1,
  ];
  const ltrUpLower = [
    reading.sensor.x,
    reading.maxY + 1,
    reading.maxX + 1,
    reading.sensor.y,
  ];
  const ltrDownUpper = [
    reading.sensor.x,
    reading.minY - 1,
    reading.maxX + 1,
    reading.sensor.y,
  ];
  const ltrDownLower = [
    reading.minX - 1,
    reading.sensor.y,
    reading.sensor.x,
    reading.maxY + 1,
  ];

  return {
    ltrUpUpper,
    ltrUpLower,
    ltrDownUpper,
    ltrDownLower,
  };
}

function getIntersections(perimeterLinesA, perimeterLinesB, searchSpace) {
  return [
    getIntersection(
      perimeterLinesA.ltrUpUpper,
      perimeterLinesB.ltrDownUpper,
      searchSpace
    ),
    getIntersection(
      perimeterLinesA.ltrUpUpper,
      perimeterLinesB.ltrDownLower,
      searchSpace
    ),
    getIntersection(
      perimeterLinesA.ltrUpLower,
      perimeterLinesB.ltrDownUpper,
      searchSpace
    ),
    getIntersection(
      perimeterLinesA.ltrUpLower,
      perimeterLinesB.ltrDownLower,
      searchSpace
    ),
  ].filter(Boolean);
}

function isPositionCovered(readings, x, y) {
  return readings.some((reading) => {
    const {
      sensor: { x: sensorX, y: sensorY },
    } = reading;

    const deltaX = Math.abs(sensorX - x);
    const deltaY = Math.abs(sensorY - y);
    const distance = deltaX + deltaY;
    return distance <= reading.radius;
  });
}

function findUnconveredPosition(readings, searchSpace) {
  const boundaryIntersections = readings.reduce((acc, reading, index) => {
    const perimeterLinesA =
      reading.perimeterLines || getPerimeterLines(reading);
    const remainingReadings = readings.slice(index + 1);
    remainingReadings.forEach((comparisonReading) => {
      const perimeterLinesB =
        comparisonReading.perimeterLines ||
        getPerimeterLines(comparisonReading);
      comparisonReading.perimeterLines = perimeterLinesB;
      const intersections = getIntersections(
        perimeterLinesA,
        perimeterLinesB,
        searchSpace
      );
      intersections.forEach((intersection) => acc.add(intersection));
    });
    return acc;
  }, new Set());

  for (const intersection of boundaryIntersections.values()) {
    const [x, y] = intersection.split(",").map((raw) => parseInt(raw, 10));

    if (!isPositionCovered(readings, x, y)) {
      return { x, y };
    }
  }

  throw new Error("No position found, fix your code!");
}

function getTuningFrequency(position) {
  return position.x * 4000000 + position.y;
}

getInput((rawData) => {
  const readings = rawData.split("\n").map(processLine);
  readings.map(addRadius);
  //   const partOneTarget = 10;
  const partOneTarget = 2000000;
  const intersectingReadings = readings.filter((reading) =>
    intersectsYvalue(reading, partOneTarget)
  );
  const coveredPositions = getCoveredPositionsForYvalue(
    intersectingReadings,
    partOneTarget
  );
  console.log(`[PART 1]: ${coveredPositions.size}`);

  //   const partTwoSearchSpace = [0, 20];
  const partTwoSearchSpace = [0, 4_000_000];
  const beacon = findUnconveredPosition(readings, partTwoSearchSpace);
  const tuningFrquency = getTuningFrequency(beacon);
  console.log(`[PART 2]: ${tuningFrquency}`);
});
