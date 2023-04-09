function convertCluesArray(initialCluesArray) {
  const finalCluesArray = [];

  for (let i = 0; i < initialCluesArray.length; i++) {
    let item = initialCluesArray[i];
    let number, stringClue;
    if (Array.isArray(item)) {
      number = parseInt(item[0]);
      stringClue = item[1];
    } else {
      number = parseInt(item.number);
      stringClue = item.clue;
    }
    finalCluesArray[parseInt(number)] = stringClue;
  }

  return finalCluesArray;
}

export default function iPUZtoJSON(readerResult) {
  const jsonFromReader = JSON.parse(new TextDecoder().decode(readerResult));
  const grid = jsonFromReader.solution.map((row) =>
    row.map((cell) => (cell === null || cell === '#' ? '.' : cell))
  );
  const info = {
    type: grid.length > 10 ? 'Daily Puzzle' : 'Mini Puzzle',
    title: jsonFromReader.title || '',
    author: jsonFromReader.author || '',
    description: jsonFromReader.description || '',
  };
  const circles = [];
  const shades = [];

  jsonFromReader.puzzle.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (typeof cell === 'object' && cell?.style?.shapebg && cell.style.shapebg === 'circle') {
        circles.push(rowIndex * row.length + cellIndex);
      }
    });
  });

  let across = [];
  let down = [];

  Object.entries(jsonFromReader.clues).forEach(([direction, clues]) => {
    if (direction === 'Across') {
      across = convertCluesArray(clues);
    } else if (direction === 'Down') {
      down = convertCluesArray(clues);
    }
  });

  return {
    grid,
    info,
    circles,
    shades,
    across,
    down,
  };
}
