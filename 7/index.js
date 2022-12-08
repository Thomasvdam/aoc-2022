const { getInput } = require("../setup");

const commandPattern = /\$ (?<command>\w+) ?(?<args>.*)/;
const entryPattern = /(?<first>\w+) (?<second>.*)/;

function createDirectory(parent = null) {
  return { size: 0, files: [], directories: {}, "..": parent };
}

function calculateSize(directory) {
  const subDirectories = Object.values(directory.directories);
  subDirectories.forEach((subDirectory) => {
    calculateSize(subDirectory);
  });
  const totalFileSize = directory.files.reduce((acc, file) => {
    return acc + file.size;
  }, 0);
  const totalSubdirectorySize = subDirectories.reduce((acc, subDirectory) => {
    return acc + subDirectory.size;
  }, 0);
  directory.size = totalFileSize + totalSubdirectorySize;
}

function buildFileSystem(rawData) {
  const root = createDirectory();
  let pointer = root;
  rawData.split("\n").map((line) => {
    const commandMatches = line.match(commandPattern);
    if (commandMatches?.groups) {
      const { command, args } = commandMatches.groups;
      if (command === "ls") return;
      if (args === "/") {
        pointer = root;
      } else if (args === "..") {
        pointer = pointer[".."];
      } else {
        pointer = pointer.directories[args];
      }
      return;
    }

    const { first, second } = line.match(entryPattern).groups;
    if (first === "dir") {
      pointer.directories[second] = createDirectory(pointer);
    } else {
      pointer.files.push({ name: second, size: parseInt(first, 10) });
    }
  });
  calculateSize(root);
  return root;
}

function getDirectoriesMatching(directory, callback) {
  const subDirectories = Object.values(directory.directories);
  const matchingDirectories = subDirectories
    .flatMap((subDirectory) => {
      return getDirectoriesMatching(subDirectory, callback);
    })
    .filter(Boolean);

  if (callback(directory.size)) {
    matchingDirectories.push(directory);
  }
  return matchingDirectories;
}

getInput((rawData) => {
  const root = buildFileSystem(rawData);
  const partOneDirs = getDirectoriesMatching(root, (size) => size <= 100000);
  const partOne = partOneDirs.reduce((acc, dir) => acc + dir.size, 0);
  console.log(`[PART 1]: ${partOne}`);

  const target = 30000000 - (70000000 - root.size);
  const partTwoDirs = getDirectoriesMatching(root, (size) => size >= target);
  partTwoDirs.sort((a, b) => b.size - a.size);
  const dirToRemove = partTwoDirs.pop();
  console.log(`[PART 2]: ${dirToRemove.size}`);
});
