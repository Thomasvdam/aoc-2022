const { getInput } = require("../setup");

function processLine(line) {
  const [valvePart, tunnelPart] = line.split("; ");
  const { label, rateRaw } = valvePart.match(
    /(?<label>[A-Z]{2}) has flow rate=(?<rateRaw>\d+)/
  ).groups;
  const tunnels = tunnelPart.match(/[A-Z]{2}/g);
  return {
    label,
    opened: false,
    rate: parseInt(rateRaw, 10),
    tunnels,
  };
}

function buildGraph(valves, startLabel) {
  const collection = new Map(valves.map((valve) => [valve.label, valve]));
  for (const valve of collection.values()) {
    valve.tunnels = valve.tunnels.map((tunnel) => collection.get(tunnel));
  }

  return collection.get(startLabel);
}

function getNodeValue(node, depth = 6) {
  const baseScore = !node.opened ? node.rate : 0;
  if (depth === 0) return baseScore;
  const connectedScore = node.tunnels
    .map(
      (connectedNode) => getNodeValue(connectedNode, depth - 1) / [12 / depth]
    )
    .reduce((acc, connectedValue) => acc + connectedValue);
  return baseScore + connectedScore;
}

function byValueDescending(a, b) {
  return b.value - a.value;
}

function getOptions(node) {
  return [
    ...(!node.opened ? [{ action: "open", value: getNodeValue(node) }] : []),
    ...node.tunnels.map((connectedNode) => ({
      action: "move",
      value: getNodeValue(connectedNode),
      destination: connectedNode,
    })),
  ].sort(byValueDescending);
}

function simulate(startNode, ticks) {
  let currentNode = startNode;
  const openValves = [];
  let releasedPressure = 0;
  for (let tick = 0; tick < ticks; tick++) {
    releasedPressure += openValves.reduce((acc, valve) => acc + valve.rate, 0);
    const options = getOptions(currentNode);
    const choice = options[0];
    if (choice.action === "open") {
      currentNode.opened = true;
      openValves.push(currentNode);
    } else {
      currentNode = choice.destination;
    }
  }

  return releasedPressure;
}

function getCostFromTo(from, to, visited = new Set()) {
  if (from === to) return 1;
  visited.add(from);
  const lowestCost = from.tunnels
    .map((tunnel) => {
      if (visited.has(tunnel)) return Infinity;
      return 1 + getCostFromTo(tunnel, to, new Set(visited.values()));
    })
    .reduce((acc, next) => (acc < next ? acc : next), Infinity);
  return lowestCost;
}

function buildWeightedGraph(valves, startLabel) {
  const valvesOfInterest = valves.filter(
    (valve) => valve.rate > 0 || valve.label === startLabel
  );

  const valvesMap = new Map(valves.map((valve) => [valve.label, valve]));
  for (const valve of valvesMap.values()) {
    valve.tunnels = valve.tunnels.map((tunnel) => valvesMap.get(tunnel));
  }

  valvesOfInterest.forEach((valve) => {
    valve.directTunnels = valvesOfInterest
      .map((connectedValve) => {
        return {
          destination: connectedValve,
          cost: getCostFromTo(
            valvesMap.get(valve.label),
            valvesMap.get(connectedValve.label)
          ),
          value: connectedValve.rate,
        };
      })
      .sort((a, b) => b.value / b.cost - a.value / a.cost);
  });

  valvesOfInterest.forEach((valve) => delete valve.tunnels);
  return valvesOfInterest.find((valve) => valve.label === startLabel);
}

function getPaths(node, credits, visited = [], paths = new Map()) {
  node.directTunnels.forEach((tunnel) => {
    if (credits < tunnel.cost) return;
    if (visited.includes(tunnel.destination.label)) return;
    if (tunnel.value === 0) return;
    const newVisited = visited.concat(tunnel.destination.label);
    const oldPathString = visited.join(",");
    const newPathString = newVisited.join(",");
    const remainingCredits = credits - tunnel.cost;
    paths.set(
      newPathString,
      (paths.get(oldPathString) || 0) + tunnel.value * remainingCredits
    );

    getPaths(tunnel.destination, remainingCredits, newVisited, paths);
  });

  return paths;
}

function getFromPathsList(pathsList, pathString) {
  for (const paths of pathsList) {
    if (paths.has(pathString)) return paths.get(pathString);
  }

  return 0;
}

let counter = 0;
function getTwoPaths(
  [nodeA, nodeB],
  [creditsA, creditsB],
  visited = [],
  paths = [new Map(), new Map(), new Map(), new Map(), new Map(), new Map()]
) {
  const pathToWrite = paths[counter % paths.length];
  counter++;
  const scopedVisited = visited.map((label) => label);
  if (nodeA === nodeB) {
    for (let index = 0; index < nodeA.directTunnels.length - 1; index++) {
      const firstTunnel = nodeA.directTunnels[index];
      if (creditsA < firstTunnel.cost) continue;
      if (scopedVisited.includes(firstTunnel.destination.label)) continue;
      if (firstTunnel.value === 0) continue;
      for (
        let innerIndex = index + 1;
        innerIndex < nodeA.directTunnels.length;
        innerIndex++
      ) {
        const secondTunnel = nodeA.directTunnels[innerIndex];
        if (creditsB < secondTunnel.cost) continue;
        if (scopedVisited.includes(secondTunnel.destination.label)) continue;
        if (secondTunnel.value === 0) continue;

        const newVisited = scopedVisited.concat([
          firstTunnel.destination.label,
          secondTunnel.destination.label,
        ]);
        const oldPathString = visited.join(",");
        const newPathString = newVisited.join(",");
        const remainingCreditsA = creditsA - firstTunnel.cost;
        const remainingCreditsB = creditsB - secondTunnel.cost;
        const oldValue = getFromPathsList(paths, newPathString);
        const newValue =
          getFromPathsList(paths, oldPathString) +
          (firstTunnel.value * remainingCreditsA +
            secondTunnel.value * remainingCreditsB);
        if (newValue > oldValue) {
          pathToWrite.set(newPathString, newValue);
        }
        getTwoPaths(
          [firstTunnel.destination, secondTunnel.destination],
          [remainingCreditsA, remainingCreditsB],
          newVisited,
          paths
        );
      }
    }
  } else {
    for (let index = 0; index < nodeA.directTunnels.length; index++) {
      const firstTunnel = nodeA.directTunnels[index];
      if (creditsA < firstTunnel.cost) continue;
      if (scopedVisited.includes(firstTunnel.destination.label)) continue;
      if (firstTunnel.value === 0) continue;
      // Dumb heuristic to prevent the problem space from spiralling out of control.
      let handbrake = false;
      for (
        let innerIndex = 0;
        innerIndex < nodeB.directTunnels.length;
        innerIndex++
      ) {
        const secondTunnel = nodeB.directTunnels[innerIndex];
        if (creditsB < secondTunnel.cost) continue;
        if (firstTunnel.destination === secondTunnel.destination) continue;
        if (scopedVisited.includes(secondTunnel.destination.label)) continue;
        if (secondTunnel.value === 0) continue;

        const newVisited = scopedVisited.concat([
          firstTunnel.destination.label,
          secondTunnel.destination.label,
        ]);
        const oldPathString = visited.join(",");
        const newPathString = newVisited.join(",");
        const remainingCreditsA = creditsA - firstTunnel.cost;
        const remainingCreditsB = creditsB - secondTunnel.cost;
        const oldValue = getFromPathsList(paths, newPathString);
        const newValue =
          getFromPathsList(paths, oldPathString) +
          (firstTunnel.value * remainingCreditsA +
            secondTunnel.value * remainingCreditsB);
        if (newValue > oldValue) {
          pathToWrite.set(newPathString, newValue);
        }
        getTwoPaths(
          [firstTunnel.destination, secondTunnel.destination],
          [remainingCreditsA, remainingCreditsB],
          newVisited,
          paths
        );

        if (handbrake) break;
        handbrake = true;
        
      }
    }
  }

  return paths;
}

function partTwo(startNode) {
  const pathsList = getTwoPaths([startNode, startNode], [26, 26]);
  let bestPath = 0;
  for (const paths of pathsList) {
    for (const [pathString, pathReleasedPressure] of paths.entries()) {
      if (bestPath >= pathReleasedPressure) continue;
      bestPath = pathReleasedPressure;
    }
  }
  return bestPath;
}

getInput((rawData) => {
  const data = rawData.split("\n").map(processLine);
  const startNode = buildGraph(data, "AA");
  const releasedPressure = simulate(startNode, 30);
  console.log(`[PART 1]: ${releasedPressure}`);

  const data2 = rawData.split("\n").map(processLine);
  const weightedGraphStart = buildWeightedGraph(data2, "AA");
  const paths = getPaths(weightedGraphStart, 30);
  let bestPath = 0;
  for (const [pathString, pathReleasedPressure] of paths.entries()) {
    if (bestPath >= pathReleasedPressure) continue;
    bestPath = pathReleasedPressure;
  }
  console.log(`[PART 1]: Better solution ${bestPath}`);

  const partTwoAnswer = partTwo(weightedGraphStart);
  console.log(`[PART 2]: ${partTwoAnswer}`);
});
