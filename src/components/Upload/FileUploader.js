import './css/fileUploader.css';

import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import {MdFileUpload} from 'react-icons/md';
import swal from '@sweetalert/with-react';

import {hasShape} from '../../lib/jsUtils';
import PUZtoJSON from '../../lib/converter/PUZtoJSON';
import iPUZtoJSON from '../../lib/converter/iPUZtoJSON';
import fileTypeGuesser from '../../lib/fileTypeGuesser';

class InvalidFileTypeError extends Error {
  constructor(fileType) {
    const title = `Invalid .${fileType} file`;
    super(title);
    this.errorType = 'InvalidFileTypeError';
    this.errorTitle = title;
    this.errorText = `The uploaded file is not a valid .${fileType} file.`;
    this.errorIcon = 'warning';
  }
}

class UnknownFileTypeError extends Error {
  constructor(fileType) {
    const title = `Unknown file type: .${fileType}`;
    super(title);
    this.errorType = 'UnknownFileTypeError';
    this.errorTitle = title;
    this.errorText = 'The uploaded file could not be recognized';
    this.errorIcon = 'warning';
  }
}

class UnsupportedFileTypeError extends Error {
  constructor(fileType) {
    const title = `Unsupported file type: .${fileType}`;
    super(title);
    this.errorType = 'UnsupportedFileTypeError';
    this.errorTitle = title;
    this.errorText = 'The uploaded file is not currently supported';
    this.errorIcon = 'warning';
  }
}

export default class FileUploader extends Component {
  validPuzzle(puzzle) {
    const shape = {
      info: {
        title: '',
        type: '',
        author: '',
      },
      grid: [['']],
      // circles: {} is optional
      clues: {
        across: {},
        down: {},
      },
    };
    return hasShape(puzzle, shape);
  }

  convertPUZ(buffer) {
    const raw = PUZtoJSON(buffer);

    const {grid: rawGrid, info, circles, shades, across, down} = raw;

    const {title, author, description} = info;

    const grid = rawGrid.map((row) => row.map(({solution}) => solution || '.'));
    const type = grid.length > 10 ? 'Daily Puzzle' : 'Mini Puzzle';

    const result = {
      grid,
      circles,
      shades,
      info: {
        type,
        title,
        author,
        description,
      },
      clues: {across, down},
    };
    return result;
  }

  convertIPUZ(readerResult) {
    const {grid, info, circles, shades, across, down} = iPUZtoJSON(readerResult);

    const result = {
      grid,
      circles,
      shades,
      info,
      clues: {across, down},
    };

    return result;
  }

  attemptPuzzleConversion(readerResult, fileType) {
    if (fileType === 'puz') {
      return this.convertPUZ(readerResult);
    } else if (fileType === 'ipuz') {
      return this.convertIPUZ(readerResult);
    } else if (fileType === 'jpz') {
      throw new UnsupportedFileTypeError(fileType);
    } else {
      const guessedFileType = fileTypeGuesser(readerResult);
      if (!guessedFileType) {
        throw new UnknownFileTypeError(fileType);
      } else {
        return this.attemptPuzzleConversion(readerResult, guessedFileType);
      }
    }
  }

  onDrop(acceptedFiles) {
    const file = acceptedFiles[0];
    const fileType = file.name.split('.').pop();
    const reader = new FileReader();
    const {success, fail} = this.props;
    reader.addEventListener('loadend', () => {
      try {
        const puzzle = this.attemptPuzzleConversion(reader.result, fileType);
        if (this.validPuzzle(puzzle)) {
          success(puzzle);
        } else {
          fail();
        }
      } catch (e) {
        let defaultTitle = 'Something went wrong';
        let defaultText = `The error message was: ${e.message}`;
        let defaultIcon = 'warning';

        if (e?.errorTitle) defaultTitle = e.errorTitle;
        if (e?.errorText) defaultText = e.errorText;
        if (e?.errorIcon) defaultIcon = e.errorIcon;

        swal({
          title: defaultTitle,
          text: defaultText,
          icon: defaultIcon,
          buttons: 'OK',
          dangerMode: true,
        });
      }
      window.URL.revokeObjectURL(acceptedFiles[0].preview);
    });
    reader.readAsArrayBuffer(file);
  }

  render() {
    const {v2} = this.props;
    return (
      <Dropzone
        className="file-uploader"
        onDrop={this.onDrop.bind(this)}
        activeStyle={{
          outline: '3px solid var(--main-blue)',
          outlineOffset: '-10px',
        }}
      >
        <div className={`file-uploader--wrapper ${v2 ? 'v2' : ''}`}>
          <div className="file-uploader--box">
            <MdFileUpload className="file-uploader--box--icon" />
            Import .puz or .ipuz file
          </div>
        </div>
      </Dropzone>
    );
  }
}
