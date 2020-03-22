import './css/fileUploader.css';

import React, {Component} from 'react';
import Dropzone from 'react-dropzone';

import {hasShape} from '../../lib/jsUtils';
import PUZtoJSON from '../../lib/converter/PUZtoJSON';

export default class FileUploader extends Component {
  validPuzzle(puzzle) {
    let shape = {
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
      info: {type, title, author, description},
      clues: {across, down},
    };
    return result;
  }

  onDrop(acceptedFiles) {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    const {success, fail} = this.props;
    reader.addEventListener('loadend', () => {
      let puzzle = this.convertPUZ(reader.result);
      if (this.validPuzzle(puzzle)) {
        success(puzzle);
      } else {
        fail();
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
          outline: '3px solid black',
          outlineOffset: '-10px',
        }}
      >
        <div className={'file-uploader--wrapper ' + (v2 ? 'v2' : '')}>
          <div className="file-uploader--box">
            <svg
              className="file-uploader--box--icon"
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="43"
              viewBox="0 0 50 43"
            >
              <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z" />
            </svg>
            Import .puz file
          </div>
        </div>
      </Dropzone>
    );
  }
}
