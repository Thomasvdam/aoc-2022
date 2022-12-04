const { getInput } = require("../setup");

const itemsList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const priorityMap = itemsList.split("").reduce((acc, item, index) => {
  acc.set(item, index + 1);
  return acc;
}, new Map());

function processLine(line) {
  return line.split("");
}

function compartmentalise(itemList) {
  const compartmentSize = itemList.length / 2;
  return [itemList.slice(0, compartmentSize), itemList.slice(compartmentSize)];
}

function getInterSection(itemLists) {
  const sets = itemLists.slice(1).map((itemList) => new Set(itemList));
  const intersection = itemLists[0].find((item) =>
    sets.every((set) => set.has(item))
  );
  return intersection;
}

function getPriorityValue(item) {
  return priorityMap.get(item);
}

getInput((rawData) => {
  const data = rawData.split("\n").map(processLine);
  const compartmentIntersections = data
    .map(compartmentalise)
    .map(getInterSection);
  const priorities = compartmentIntersections.map(getPriorityValue);
  const partOne = priorities.reduce((acc, next) => acc + next);
  console.log(`[PART 1]: ${partOne}`);

  const groups = [];
  for (let i = 0; i < data.length; i += 3) {
    const chunk = data.slice(i, i + 3);
    groups.push(chunk);
  }
  const groupIntersections = groups.map(getInterSection);
  const partTwo = groupIntersections
    .map(getPriorityValue)
    .reduce((acc, next) => acc + next);
  console.log(`[PART 2]: ${partTwo}`);
});
