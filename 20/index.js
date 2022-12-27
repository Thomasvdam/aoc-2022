const { getInput } = require("../setup");

function processLine(line) {
  return {
    prev: null,
    next: null,
    val: parseInt(line, 10),
  };
}

function connectList(list) {
  list.forEach((node, index) => {
    const next = list[index + 1] ?? list[0];
    node.next = next;
    next.prev = node;
  });
}

function moveNode(listLength, node) {
  const direction = node.val > 0 ? "next" : "prev";
  const correction = direction === "prev" ? 1 : 0;
  const iterations = (Math.abs(node.val) % (listLength - 1)) + correction;
  if (node.val === 0 || iterations === 0) return;
  let target = node[direction];

  // Prevent skipping over itself.
  node.prev.next = node.next;
  node.next.prev = node.prev;

  for (let index = 1; index < iterations; index++) {
    target = target[direction];
  }

  node.next = target.next;
  target.next.prev = node;

  target.next = node;
  node.prev = target;
}

function printList(startNode) {
  let current = startNode;
  while (current.val !== 0) {
    current = current.next;
  }

  let printStart = current;
  do {
    process.stdout.write(`${current.val},`);
    current = current.next;
  } while (current !== printStart);
  process.stdout.write("\n");
}

function getCoordinates(startNode) {
  let current = startNode;
  while (current.val !== 0) {
    current = current.next;
  }

  const coordinates = [];
  for (let index = 1; index < 3001; index++) {
    current = current.next;
    if (index % 1000 === 0) coordinates.push(current.val);
  }

  return coordinates;
}

getInput((rawData) => {
  const list = rawData.split("\n").map(processLine);
  const listLength = list.length;
  const keyedList = list.map((node) => ({
    ...node,
    val: node.val * 811589153,
  }));

  connectList(list);
  connectList(keyedList);

  list.forEach((node) => moveNode(listLength, node));
  const coordinates = getCoordinates(list[0]);
  const partOne = coordinates.reduce((acc, next) => acc + next);
  console.log(`[PART 1]: ${partOne}`);

  for (let round = 0; round < 10; round++) {
    keyedList.forEach((node) => moveNode(listLength, node));
  }
  const coordinatesTwo = getCoordinates(keyedList[0]);
  const partTwo = coordinatesTwo.reduce((acc, next) => acc + next);
  console.log(`[PART 2]: ${partTwo}`);
});
