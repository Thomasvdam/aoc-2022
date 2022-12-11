const { getInput } = require("../setup");

function processLine(line) {
  return line.split("").map((num) => {
    const height = parseInt(num, 10);
    return {
      visible: false,
      height,
    };
  });
}

function flipArray(array) {
  return array.reduceRight((acc, element) => {
    acc.push(element);
    return acc;
  }, []);
}

function markVisibleLine(line) {
  let highest = line[0].height;
  for (let index = 0; index < line.length; index++) {
    const tree = line[index];
    if (index === 0) {
      tree.visible = true;
      continue;
    }
    const hidden = tree.height <= highest;
    tree.visible = tree.visible || !hidden;
    highest = Math.max(tree.height, highest);
  }
}

function markVisible(grid) {
  grid.forEach((row) => {
    markVisibleLine(row);
    const rtlLine = flipArray(row);
    markVisibleLine(rtlLine);
  });

  const width = grid[0].length;
  for (let col = 0; col < width; col++) {
    const topToBottomCol = grid.map((row) => row[col]);
    markVisibleLine(topToBottomCol);
    const bottoToTopCol = flipArray(topToBottomCol);
    markVisibleLine(bottoToTopCol);
  }
}

function getVisible(grid) {
  return grid.reduce((acc, row) => {
    return (
      acc +
      row.reduce((rowAcc, tree) => {
        return rowAcc + (tree.visible ? 1 : 0);
      }, 0)
    );
  }, 0);
}

function getViewDistance(line, height) {
  let index;
  for (index = 1; index < line.length; index++) {
    const tree = line[index];
    if (tree.height >= height) return index;
  }
  return index - 1;
}

function getCardinalViewDistances(grid, x, y) {
  const height = grid[y][x].height;
  const rtlRow = grid[y].slice(x);
  const ltrRow = flipArray(grid[y].slice(0, x + 1));
  const col = [];
  for (let index = 0; index < grid.length; index++) {
    const tree = grid[index][x];
    col.push(tree);
  }
  const bttCol = col.slice(y);
  const ttbCol = flipArray(col.slice(0, y + 1));

  return [
    getViewDistance(rtlRow, height),
    getViewDistance(ltrRow, height),
    getViewDistance(bttCol, height),
    getViewDistance(ttbCol, height),
  ];
}

function getScenicScore(grid, x, y) {
  const maxX = grid[0].length - 1;
  const maxY = grid.length - 1;
  if (x === 0 || y === 0 || x === maxX || y === maxY) {
    return 0;
  }
  return getCardinalViewDistances(grid, x, y).reduce(
    (acc, score) => acc * score
  );
}

function setScenicScore(grid) {
  let highscore = 0;
  grid.forEach((row, y) => {
    row.forEach((tree, x) => {
      tree.scenicScore = getScenicScore(grid, x, y);
      highscore = Math.max(highscore, tree.scenicScore);
    });
  });
  return highscore;
}

getInput((rawData) => {
  const grid = rawData.split("\n").map(processLine);
  markVisible(grid);
  const visible = getVisible(grid);
  console.log(`[PART 1]: ${visible}`);

  const scenicHighScore = setScenicScore(grid);
  console.log(`[PART 2]: ${scenicHighScore}`);
});
