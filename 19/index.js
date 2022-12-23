const { getInput } = require("../setup");

const blueprintIdPattern = /Blueprint (?<blueprintId>\d+): /;
const robotTypePattern = /Each (?<type>\w+) robot/;
const robotCostPattern = /(\d+ \w+)/g;

const RESOURCE_MAPPING = {
  ore: 0,
  clay: 1,
  obsidian: 2,
  geode: 3,
};

function processLine(line) {
  const { blueprintId } = line.match(blueprintIdPattern).groups;
  const robotInstructionsStrings = line
    .replace(blueprintIdPattern, "")
    .split(".")
    .filter(Boolean);

  const recipes = robotInstructionsStrings
    .map((robotInstructionsString) => {
      const { type } = robotInstructionsString.match(robotTypePattern).groups;

      const cost = robotInstructionsString.match(robotCostPattern).reduce(
        (acc, costString) => {
          const [amount, resource] = costString.split(" ");
          acc[RESOURCE_MAPPING[resource]] = parseInt(amount, 10);
          return acc;
        },
        [0, 0, 0, 0]
      );
      return { type, cost };
    })
    .sort((a, b) => RESOURCE_MAPPING[b.type] - RESOURCE_MAPPING[a.type]);

  return {
    id: parseInt(blueprintId, 10),
    recipes,
  };
}

function createInitalState() {
  return [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
  ];
}

function incrementResources(state) {
  return [
    state[0].map((val, index) => val + state[1][index]),
    state[1].map((val) => val),
  ];
}

function buildBot(state, recipe) {
  const typeIndex = RESOURCE_MAPPING[recipe.type];
  state[1][typeIndex] += 1;
  state[0] = state[0].map((val, index) => val - recipe.cost[index]);
}

function canBuildBot(state, recipe) {
  return state[0].every((val, index) => val >= recipe[index]);
}

function savingMakesSense(state, recipes) {
  const notAvailableNow = recipes.filter(
    (recipe) => !canBuildBot(state, recipe.cost)
  );
  return notAvailableNow.some((recipe) =>
    recipe.cost.every((cost, index) => cost === 0 || state[1][index] > 0)
  );
}

function getOptions(state, recipes) {
  const options = recipes.filter((recipe) => canBuildBot(state, recipe.cost));
  if (savingMakesSense(state, recipes)) options.push(null);
  // Arbitrary heuristic
  return options.slice(0, 2);
}

function getSuperOptimisticPotentialExtraScore(minutes) {
  let score = 0;
  for (let round = 0; round < minutes; round++) {
    score += round;
  }
  return score;
}

function scoreState(state, minutes) {
  return (
    state[0][RESOURCE_MAPPING.geode] +
    state[1][RESOURCE_MAPPING.geode] * minutes
  );
}

function hashState(state) {
  return state.map((part) => part.join(",")).join("-");
}

function getBestResultForBlueprint(blueprint, minutes) {
  const initialState = createInitalState();
  const visitedStates = new Map();
  let maxScore = 0;

  function executeMinute(state, action, minute) {
    const newState = incrementResources(state);
    if (action) buildBot(newState, action);

    if (minute === 1) {
      return newState[0][RESOURCE_MAPPING.geode];
    }

    const stateHash = hashState(newState);
    const score = scoreState(newState, minute);
    const optimisticEstimate = getSuperOptimisticPotentialExtraScore(minute);
    if (visitedStates.get(stateHash) > score) return 0;
    visitedStates.set(stateHash, score);
    if (score + optimisticEstimate < maxScore) return 0;
    maxScore = score > maxScore ? score : maxScore;

    const options = getOptions(newState, blueprint.recipes);
    return options.flatMap((option) =>
      executeMinute(newState, option, minute - 1)
    );
  }

  const initialOptions = getOptions(initialState, blueprint.recipes);
  const results = initialOptions.flatMap((option) =>
    executeMinute(initialState, option, minutes)
  );
  const highest = results.reduce((acc, next) => (next > acc ? next : acc), 0);

  return highest;
}

getInput((rawData) => {
  const blueprints = rawData.split("\n").map(processLine);
  const bestResults = blueprints.map((blueprint) => {
    const result = getBestResultForBlueprint(blueprint, 24);
    return { id: blueprint.id, result };
  });
  const partOne = bestResults.reduce(
    (acc, result) => acc + result.id * result.result,
    0
  );
  console.log(`[PART 1]: ${partOne}`);

  const bestResultsLonger = blueprints.slice(0, 3).map((blueprint) => {
    const result = getBestResultForBlueprint(blueprint, 32);
    return { id: blueprint.id, result };
  });
  const partTwo = bestResultsLonger
    .map((result) => result.result)
    .reduce((acc, next) => acc * next);
  console.log(`[PART 2]: ${partTwo}`);
});
