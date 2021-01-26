/* eslint no-plusplus: "off", no-bitwise: "off" */
function getExtension(bytes, code) {
  // struct byte format is 4S H H
  let i = 0;
  let j = 0;
  for (i = 0; i < bytes.length; i += 1) {
    if (j === code.length) break;
    if (bytes[i] === code.charCodeAt(j)) {
      j += 1;
    } else {
      j = 0;
    }
  }
  if (j === code.length) {
    // we found the code
    const length = bytes[i] * 256 + bytes[i + 1];
    i += 4; // skip the H H
    return Array.from(bytes).slice(i, i + length);
  }
  return null; // could not find
}

function getRebus(bytes) {
  const grbs = 'GRBS';
  const rtbl = 'RTBL';

  const table = getExtension(bytes, grbs);
  if (!table) {
    return; // no rebus
  }
  const solbytes = getExtension(bytes, rtbl);
  const enc = new TextDecoder('ISO-8859-1');
  const solstring = enc.decode(new Uint8Array(solbytes));
  if (!solstring) {
    return;
  }
  const sols = {};
  solstring.split(';').forEach((s) => {
    const tokens = s.split(':');
    if (tokens.length === 2) {
      const [key, val] = tokens;
      sols[Number(key.trim())] = val;
    }
  });
  // dict string format is k1:v1;k2:v2;...;kn:vn;

  return {table, sols};
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

function getShades(bytes) {
  const shades = [];
  const gext = 'GEXT';
  const markups = getExtension(bytes, gext);
  if (markups) {
    markups.forEach((byte, i) => {
      if (byte & 8) {
        shades.push(i);
      }
    });
  }
  return shades;
}

function addRebusToGrid(grid, rebus) {
  return grid.map((row, i) =>
    row.map((cell, j) => {
      const idx = i * row.length + j;
      if (rebus.table[idx]) {
        return {
          ...cell,
          solution: rebus.sols[rebus.table[idx] - 1],
        };
      }
      return cell;
    })
  );
}

export default function PUZtoJSON(buffer) {
  let grid = [];
  const info = {};
  const across = [];
  const down = [];
  const bytes = new Uint8Array(buffer);

  const ncol = bytes[44];
  const nrow = bytes[45];
  if (!(bytes[50] === 0 && bytes[51] === 0)) {
    throw new Error('Scrambled PUZ file');
  }

  for (let i = 0; i < nrow; i++) {
    grid[i] = [];

    for (let j = 0; j < ncol; j++) {
      const letter = String.fromCharCode(bytes[52 + i * ncol + j]);
      if (letter !== '.') {
        grid[i][j] = {
          type: 'white',
          solution: letter,
        };
      } else {
        grid[i][j] = {
          type: 'black',
        };
      }
    }
  }

  function isBlack(i, j) {
    return i < 0 || j < 0 || i >= nrow || j >= ncol || grid[i][j].type === 'black';
  }

  const isAcross = [];
  const isDown = [];
  let n = 0;
  for (let i = 0; i < nrow; i++) {
    for (let j = 0; j < ncol; j++) {
      if (grid[i][j].type === 'white') {
        const isAcrossStart = isBlack(i, j - 1) && !isBlack(i, j + 1);
        const isDownStart = isBlack(i - 1, j) && !isBlack(i + 1, j);

        if (isAcrossStart || isDownStart) {
          n += 1;
          isAcross[n] = isAcrossStart;
          isDown[n] = isDownStart;
        }
      }
    }
  }

  let ibyte = 52 + ncol * nrow * 2;
  function readString() {
    let result = '';
    let b = bytes[ibyte++];
    while (ibyte < bytes.length && b !== 0) {
      result += String.fromCharCode(b);
      b = bytes[ibyte++];
    }
    return result;
  }

  info.title = readString();
  info.author = readString();
  info.copyright = readString();

  for (let i = 1; i <= n; i++) {
    if (isAcross[i]) {
      across[i] = readString();
    }
    if (isDown[i]) {
      down[i] = readString();
    }
  }

  info.description = readString();

  const rebus = getRebus(bytes);
  const circles = getCircles(bytes);
  const shades = getShades(bytes);
  if (rebus) {
    grid = addRebusToGrid(grid, rebus);
  }

  return {
    grid,
    info,
    circles,
    shades,
    across,
    down,
  };
}
