const { getInput } = require("../setup");

const INSTR_NOOP = "noop";
const INSTR_START_ADD = "start_add";
const INSRT_COMPL_ADD = "compl_add";

function processLine(line) {
  if (line === "noop") return [{ instruction: INSTR_NOOP }];
  const [_, valueRaw] = line.split(" ");
  const value = parseInt(valueRaw, 10);
  return [
    {
      instruction: INSTR_START_ADD,
      value,
    },
    {
      instruction: INSRT_COMPL_ADD,
      value,
    },
  ];
}

function executeInstructions(instructions, pois) {
  let cycle = 0;
  let state = 1;
  const measurements = [];
  instructions.forEach((set) => {
    set.forEach((instruction) => {
      cycle++;
      if (pois.has(cycle)) {
        measurements.push(cycle * state);
      }
      if (instruction.instruction === INSRT_COMPL_ADD) {
        state += instruction.value;
      }
    });
  });

  return measurements;
}

function getPixels(instructions) {
  let cycle = 0;
  let state = 1;
  const pixels = [];
  instructions.forEach((set) => {
    set.forEach((instruction) => {
      cycle++;
      const delta = Math.abs(state - ((cycle - 1) % 40));
      pixels.push(delta < 2);
      if (instruction.instruction === INSRT_COMPL_ADD) {
        state += instruction.value;
      }
    });
  });

  return pixels;
}

getInput((rawData) => {
  const instructions = rawData.split("\n").map(processLine);
  const measurements = executeInstructions(
    instructions,
    new Set([20, 60, 100, 140, 180, 220])
  );
  const total = measurements.reduce((acc, next) => acc + next);
  console.log(`[PART 1]: ${total}`);

  console.log('[PART 2]:');
  const pixels = getPixels(instructions);
  pixels.forEach((pixel, index) => {
    if (index % 40 === 0) process.stdout.write("\n");
    process.stdout.write(pixel ? "#" : ".");
  });
});
