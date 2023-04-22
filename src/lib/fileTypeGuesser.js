export default function fileTypeGuesser(readerResult) {
  let isJSON = true;
  let parsedJson;

  try {
    parsedJson = JSON.parse(new TextDecoder().decode(readerResult));
  } catch (e) {
    if (e.message.toLowerCase().includes('is not valid json')) {
      isJSON = false;
    }
  }

  if (isJSON && parsedJson?.version && parsedJson?.version.startsWith('http://ipuz.org')) {
    return 'ipuz';
  }

  const puzMagicHeader = '4143524f535326444f574e00';

  const otherMagicHeaders = {
    '504b0304': {
      mime: 'application/zip',
      fileTypeGuess: 'jpz',
    },
    '3c3f786d': {
      mime: 'text/xml',
      fileTypeGuess: 'jpz',
    },
  };

  const arr = new Uint8Array(readerResult).subarray(0, 14);
  let foundPuzHeader = '';
  let magicHeader = '';

  for (let i = 0; i < arr.length; i++) {
    if (i > 1 && i <= 14) {
      foundPuzHeader += arr[i].toString(16).padStart(2, '0');
    }
    if (i < 4) {
      magicHeader += arr[i].toString(16).padStart(2, '0');
    }
  }

  if (foundPuzHeader === puzMagicHeader) {
    return 'puz';
  } else {
    return otherMagicHeaders[magicHeader]?.fileTypeGuess;
  }
}
