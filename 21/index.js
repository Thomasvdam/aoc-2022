const { getInput } = require("../setup");

function processLine(line) {
  const [monkeyId, rest] = line.split(": ");
  const isNumberMonkey = rest.match(/\d+/);
  if (isNumberMonkey) return { id: monkeyId, number: parseInt(rest, 10) };
  const [a, operator, b] = rest.split(" ");
  return { id: monkeyId, a, operator, b };
}

function getMonkeyResult(monkey) {
  switch (monkey.operator) {
    case "+":
      return monkey.a + monkey.b;
    case "-":
      return monkey.a - monkey.b;
    case "/":
      return monkey.a / monkey.b;
    case "*":
      return monkey.a * monkey.b;
    case "=":
      return monkey.a - monkey.b;
    default:
      throw new Error(`Unsupported operator ${monkey.operator}`);
  }
}

function buildMap(monkeys) {
  const monkeyMap = new Map(
    monkeys
      .filter((monkey) => Number.isInteger(monkey.number))
      .map((monkey) => {
        return [monkey.id, monkey.number];
      })
  );

  const unresolvedMonkeys = new Set(
    monkeys.filter((monkey) => !Number.isFinite(monkey.number))
  );

  while (unresolvedMonkeys.size) {
    for (const monkey of unresolvedMonkeys.values()) {
      monkey.a = monkeyMap.get(monkey.a) ?? monkey.a;
      monkey.b = monkeyMap.get(monkey.b) ?? monkey.b;
      if (Number.isInteger(monkey.a) && Number.isInteger(monkey.b)) {
        monkeyMap.set(monkey.id, getMonkeyResult(monkey));
        unresolvedMonkeys.delete(monkey);
      }
    }
  }

  return monkeyMap;
}

function monkeyCanBeResolved(monkey, variableId) {
  return (
    (Number.isInteger(monkey.a) && monkey.b === variableId) ||
    (Number.isInteger(monkey.b) && monkey.a === variableId) ||
    (Number.isInteger(monkey.a) && typeof monkey.b === "function") ||
    (Number.isInteger(monkey.b) && typeof monkey.a === "function")
  );
}

function resolveMonkey(monkey, variableId) {
  return (x) => {
    if (Number.isInteger(monkey.a) && monkey.b === variableId) {
      return getMonkeyResult({ ...monkey, b: x });
    } else if (Number.isInteger(monkey.b) && monkey.a === variableId) {
      return getMonkeyResult({ ...monkey, a: x });
    } else if (Number.isInteger(monkey.a) && typeof monkey.b === "function") {
      return getMonkeyResult({ ...monkey, b: monkey.b(x) });
    } else if (Number.isInteger(monkey.b) && typeof monkey.a === "function") {
      return getMonkeyResult({ ...monkey, a: monkey.a(x) });
    }
  };
}

function buildEquations(monkeys, variableId) {
  const monkeyMap = new Map(
    monkeys
      .filter(
        (monkey) => Number.isInteger(monkey.number) && monkey.id !== variableId
      )
      .map((monkey) => {
        return [monkey.id, monkey.number];
      })
  );

  const unresolvedMonkeys = new Set(
    monkeys.filter((monkey) => !Number.isFinite(monkey.number))
  );

  while (unresolvedMonkeys.size) {
    for (const monkey of unresolvedMonkeys.values()) {
      monkey.a = monkeyMap.get(monkey.a) ?? monkey.a;
      monkey.b = monkeyMap.get(monkey.b) ?? monkey.b;
      if (Number.isInteger(monkey.a) && Number.isInteger(monkey.b)) {
        monkeyMap.set(monkey.id, getMonkeyResult(monkey));
        unresolvedMonkeys.delete(monkey);
      } else if (monkeyCanBeResolved(monkey, variableId)) {
        monkeyMap.set(monkey.id, resolveMonkey(monkey, variableId));
        unresolvedMonkeys.delete(monkey);
      }
    }
  }

  return monkeyMap;
}

function getPartTwo(rootEquation) {
  let x = 0;
  while (rootEquation(x) !== 0) {
    const result = rootEquation(x);
    const resultOne = rootEquation(x + 1);
    const deltaPerStep = Math.abs(Math.abs(resultOne) - Math.abs(result));
    const totalDelta = Math.abs(0 - Math.abs(result));
    x = x + (-1 * Math.sign(0 - result) * Math.floor(totalDelta / deltaPerStep));
  }
  return x;
}

getInput((rawData) => {
  const monkeys = rawData.split("\n").map(processLine);
  const monkeyMap = buildMap(monkeys.map((monkey) => ({ ...monkey })));
  console.log(`[PART 1]: ${monkeyMap.get("root")}`);

  const monkeyMapEquations = buildEquations(
    monkeys.map((monkey) => ({
      ...monkey,
      operator: monkey.id === "root" ? "=" : monkey.operator,
    })),
    "humn"
  );
  const rootEquation = monkeyMapEquations.get("root");
  const partTwo = getPartTwo(rootEquation);
  console.log(`[PART 2]: ${partTwo}`);
});
