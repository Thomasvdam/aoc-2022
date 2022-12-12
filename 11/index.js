const { getInput } = require("../setup");

function getOperatorFunction(operator) {
  if (operator === "+") return (a, b) => a + b;
  if (operator === "*") return (a, b) => a * b;
  throw new Error(`Unsupported operator ${operator}`);
}

function getOperation(operator, value) {
  const operatorFunction = getOperatorFunction(operator);
  if (value === "old") return (old) => operatorFunction(old, old);
  const staticValue = parseInt(value, 10);
  return (old) => operatorFunction(old, staticValue);
}

function getTest(divisor, trueLine, falseLine) {
  const trueTarget = parseInt(trueLine.match(/(\d+)/)[1], 10);
  const falseTarget = parseInt(falseLine.match(/(\d+)/)[1], 10);

  return (worryLevel) =>
    worryLevel % divisor === 0 ? trueTarget : falseTarget;
}

function processBlock(block) {
  const [_, startingLine, operationLine, testLine, trueLine, falseLine] =
    block.split("\n");

  const startingItemsRaw = startingLine.match(/(\d+,?)+/g);
  const items = startingItemsRaw.map((num) =>
    parseInt(num.replace(",", ""), 10)
  );

  const operationRaw = operationLine.match(/old (.) (.+)/);
  const [__, operator, value] = operationRaw;
  const operation = getOperation(operator, value);

  const divisor = parseInt(testLine.match(/(\d+)/)[1], 10);
  const test = getTest(divisor, trueLine, falseLine);
  return {
    items,
    operation,
    test,
    divisor,
    inspected: 0,
  };
}

function playRound(state) {
  state.forEach((monkey) => {
    while (monkey.items.length) {
      const item = monkey.items.shift();
      const inspectedItem = monkey.operation(item);
      monkey.inspected++;
      const intactItem = Math.floor(inspectedItem / 3);
      const target = monkey.test(intactItem);
      state[target].items.push(intactItem);
    }
  });
}

function playRoundWorried(state, gcf) {
  state.forEach((monkey) => {
    while (monkey.items.length) {
      const item = monkey.items.shift();
      const inspectedItem = monkey.operation(item);
      monkey.inspected++;
      const intactItem = inspectedItem % gcf;
      const target = monkey.test(intactItem);
      state[target].items.push(intactItem);
    }
  });
}

function getMonkeyBusiness(state) {
  const [first, second] = state
    .map((monkey) => monkey.inspected)
    .sort((a, b) => b - a);

  return first * second;
}

getInput((rawData) => {
  const state = rawData.split("\n\n").map(processBlock);
  for (let index = 0; index < 20; index++) {
    playRound(state);
  }
  const partOne = getMonkeyBusiness(state);
  console.log(`[PART 1]: ${partOne}`);

  const state2 = rawData.split("\n\n").map(processBlock);
  const greatestCommonFactor = state
    .map((monkey) => monkey.divisor)
    .reduce((acc, next) => acc * next);
  for (let index = 0; index < 10000; index++) {
    playRoundWorried(state2, greatestCommonFactor);
  }
  const partTwo = getMonkeyBusiness(state2);
  console.log(`[PART 2]: ${partTwo}`);
});
