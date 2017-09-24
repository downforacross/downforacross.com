function getExtension(bytes, code) {
  // struct byte format is 4S H H
  let i = 0, j = 0;
  for(i = 0; i < bytes.length; i += 1) {
    if (j === code.length) break;
    if (bytes[i] === code.charCodeAt(j)) {
      j += 1;
    } else {
      j = 0;
    }
  }
  if (j === code.length) { // we found the code
    const length = bytes[i] * 256 + bytes[i + 1];
    i += 4; // skip the H H
    return Array.from(bytes).slice(i, i + length);
  }
}

function getRebus(bytes) {
  const grbs = 'GRBS';
  const rtbl = 'RTBL';

  const table = getExtension(bytes, grbs);
  if (!table) {
    return;
  }
  const solbytes = getExtension(bytes, rtbl);
  var enc = new TextDecoder('ISO-8859-1');
  const solstring = enc.decode(new Uint8Array(solbytes));
  if (!solstring) {
    return;
  }
  const sols = {};
  solstring.split(';').forEach(s => {
    let tokens = s.split(':');
    if (tokens.length === 2) {
      let [key, val] = tokens;
      sols[parseInt(key.trim(), 10)] = val;
    }
  });
  // dict string format is k1:v1;k2:v2;...;kn:vn;

  return { table, sols };
}

function getCircles(bytes) {
  const circles = [];
  const gext = 'GEXT';
  const markups = getExtension(bytes, gext);
  if (markups) {
    markups.forEach((byte, i) => {
      if (byte & 128) {
        circles.push(i);
      }
    });
  }
  return circles;
}

function addRebusToGrid(grid, rebus) {
  return grid.map((row, i) =>
    row.map((cell, j) => {
      let idx = i * row.length + j;
      if (rebus.table[idx]) {
        return {
          ...cell,
          solution: rebus.sols[rebus.table[idx] - 1]
        }
      }
      return cell;
    })
  );
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

  const rebus = getRebus(bytes);
  const circles = getCircles(bytes);
  if (rebus) {
    retval.grid = addRebusToGrid(retval.grid, rebus);
  }
  retval.circles = circles;

  return retval;
}

