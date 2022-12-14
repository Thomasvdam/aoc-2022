const { getInput } = require("../setup");

function processPair(pair) {
  const [leftRaw, rightRaw] = pair.split("\n");
  return {
    left: eval(leftRaw),
    right: eval(rightRaw),
  };
}

function validatePair(left, right) {
  if (Number.isInteger(left) && Number.isInteger(right)) {
    return left - right;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    for (let index = 0; index < Math.max(left.length, right.length); index++) {
      const leftElement = left[index];
      const rightElement = right[index];
      if (leftElement === undefined) return -1;
      if (rightElement === undefined) return 1;
      const valid = validatePair(leftElement, rightElement);
      if (valid !== 0) return valid;
    }
    return 0;
  }

  if (Array.isArray(left)) return validatePair(left, [right]);
  return validatePair([left], right);
}

function validatePacketPair(pair) {
  pair.valid = validatePair(pair.left, pair.right) < +0;
}

getInput((rawData) => {
  const packetPairs = rawData.split("\n\n").map(processPair);
  packetPairs.map(validatePacketPair);
  const validSum = packetPairs
    .map((pair, index) => ({ valid: pair.valid, index: index + 1 }))
    .filter((pair) => pair.valid)
    .reduce((acc, next) => acc + next.index, 0);
  console.log(`[PART 1]: ${validSum}`);

  const dividerPacket1 = [[2]];
  const dividerPacket2 = [[6]];
  const dividerPackets = new Set([dividerPacket1, dividerPacket2]);
  const sortedPackets = rawData
    .split("\n")
    .filter(Boolean)
    .map((line) => eval(line))
    .concat([dividerPacket1], [dividerPacket2])
    .sort(validatePair)
    .map((packet, index) => {
      return {
        packet,
        index: index + 1,
      };
    });

  const decoderKey = sortedPackets
    .filter(({ packet }) => dividerPackets.has(packet))
    .map(({ index }) => index)
    .reduce((acc, next) => acc * next);
  console.log(`[PART 2]: ${decoderKey}`);
});
