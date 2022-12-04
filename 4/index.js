const { getInput } = require("../setup");

function processLine(line) {
  return line
    .split(",")
    .map((range) => range.split("-").map((number) => parseInt(number, 10)));
}

function sortRangesBySize(a, b) {
  const [startA, endA] = a;
  const [startB, endB] = b;
  const sizeA = endA - startA;
  const sizeB = endB - startB;
  return sizeA - sizeB;
}

function rangesContain([a, b]) {
  const [startA, endA] = a;
  const [startB, endB] = b;
  return startA >= startB && endA <= endB;
}

function sortRangesByStart(a, b) {
    return a[0] - b[0];
}

function rangesOverlap([a, b]) {
  const [_, endA] = a;
  const [startB] = b;
  return endA >= startB;
}

getInput((rawData) => {
  const data = rawData.split("\n").map(processLine);
  const sortedBySize = data.map((ranges) => ranges.sort(sortRangesBySize));
  const containedRanges = sortedBySize.filter(rangesContain);
  console.log(`[PART 1]: ${containedRanges.length}`);

  const sortedByStart = data.map((ranges) => ranges.sort(sortRangesByStart)); 
  const overlappingRanges = sortedByStart.filter(rangesOverlap);
  console.log(`[PART 2]: ${overlappingRanges.length}`);
});
