const { getInput } = require("../setup");

function processLine(line) {
  return line.split("");
}

function findMarkerEnd(buffer, markerSize) {
  for (let index = markerSize; index < buffer.length; index++) {
    const elements = buffer.slice(index - markerSize, index);
    const characters = new Set(elements);
    if (characters.size === markerSize) {
      return index;
    }
  }
  throw new Error("Unable to find marker buffer");
}

getInput((rawData) => {
  const data = rawData.split("\n").map(processLine)[0];
  const START_PACKET_MARKER_SIZE = 4;
  const endOfStartMarker = findMarkerEnd(data, START_PACKET_MARKER_SIZE);
  console.log(`[PART 1]: ${endOfStartMarker}`);

  const START_MESSAGE_MARKER_SIZE = 14;
  const endOfMessageMarker = findMarkerEnd(data, START_MESSAGE_MARKER_SIZE);
  console.log(`[PART 2]: ${endOfMessageMarker}`);
});
