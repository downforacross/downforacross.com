function getRebus() {
}

function getCircles(bytes) {
  const circles = [];
  const gext = 'GEXT';
  let i = 0, j = 0;
  for(i = 0; i < bytes.length; i += 1) {
    if (j == gext.length) break;
    if (bytes[i] == gext.charCodeAt(j)) {
      j += 1;
    }
  }
  if (j == gext.length) { // we found circles!
    const length = bytes[i] * 256 + bytes[i + 1];
    i += 4; // skip the H H
    for (let k = 0; k < length; k += 1) {
      if (bytes[i + k] & 128) {
        circles.push(k);
      }
    }
  }
  return circles;
  // format is 4S H H
}

export default function PUZtoJSON(buffer) {
  var retval = {
    metadata: {},
    grid: [],
    across: [],
    down: [],
    ncells: 0
  };
  var bytes = new Uint8Array(buffer);

  retval.ncol = bytes[44];
  retval.nrow = bytes[45];
  if (!(bytes[50] === 0 && bytes[51] === 0))
    return "Cannot open scrambled PUZ file";

  var n = 1;
  var acrossN = [];
  var downN = [];
  var i;
  for (i=0; i<retval.nrow; i++) {
    retval.grid[i] = [];
    for (var j=0; j<retval.ncol; j++) {
      var letter = String.fromCharCode(bytes[52 + i*retval.ncol + j]);
      if (letter !== ".") {
        retval.ncells += 1;
        retval.grid[i][j] = { solution: letter };
        if (j === 0 || retval.grid[i][j-1].type === "block") {
          retval.grid[i][j].number = n++;
          retval.grid[i][j].across = retval.grid[i][j].number;
          acrossN.push(retval.grid[i][j].number);
        } else {
          retval.grid[i][j].across = retval.grid[i][j-1].across;
        }
        if (i===0 || retval.grid[i-1][j].type === "block") {
          if (!retval.grid[i][j].number)
            retval.grid[i][j].number = n++;
          retval.grid[i][j].down = retval.grid[i][j].number;
          downN.push(retval.grid[i][j].number);
        } else {
          retval.grid[i][j].down = retval.grid[i-1][j].down;
        }
      } else {
        retval.grid[i][j] = { type: "block" };
      }
    }
  }

  var ibyte = 52 + retval.ncol * retval.nrow * 2 - 1;
  function readString() {
    var retval = "";
    var b = bytes[++ibyte];
    while (b !== 0 && ibyte < bytes.length) {
      retval += String.fromCharCode(b);
      b = bytes[++ibyte];
    }
    return retval;
  }

  retval.metadata["title"] = readString();
  retval.metadata["creator"] = readString();
  retval.metadata["copyright"] = readString();

  for (i=1; i<n; i++) {
    if (acrossN[0] === i) {
      retval.across[i] = readString();
      acrossN.splice(0, 1);
    }
    if (downN[0] === i) {
      retval.down[i] = readString();
      downN.splice(0, 1);
    }
  }

  retval.metadata["description"] = readString();

  const rebus = getRebus();
  const circles = getCircles(bytes);
  if (rebus) {
    // todo
  }
  retval.circles = circles;

  return retval;
}


