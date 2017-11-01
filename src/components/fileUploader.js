import './fileUploader.css';

import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

import { hasShape } from '../jsUtils';
import PUZtoJSON from '../converter/PUZtoJSON';

export default class FileUploader extends Component {

  validPuzzle(puzzle) {
    let shape = {
      info: {
        title: '',
        type: '',
        author: '',
      },
      grid: [ [ '' ] ],
      // circles: {} is optional
      clues: {
        across: {
        },
        down: {
        },
      },
    };

    return hasShape(puzzle, shape);
  }

  convertPUZ(file) {
    const raw = PUZtoJSON(file);
    const grid = raw.grid.map(row =>
      row.map(({solution}) => solution || '.')
    );
    const type = grid.length > 10 ? 'Daily Puzzle' : 'Mini Puzzle';

    const result = {
      info: {
        title: raw.metadata.title,
        type: type,
        author: raw.metadata.creator,
      },
      grid: grid,
      circles: raw.circles,
      clues: {
        across: raw.across,
        down: raw.down,
      },
    };
    return result;
  }

  onDrop(acceptedFiles) {
    let file = acceptedFiles[0];
    var reader = new FileReader();
    reader.addEventListener("loadend", () => {
      let puzzle = this.convertPUZ(reader.result);
      if (this.validPuzzle(puzzle)) {
        this.props.setPuzzle(puzzle);
      } else {
        this.props.failUpload();
      }
      window.URL.revokeObjectURL(acceptedFiles[0].preview);
    });
    reader.readAsArrayBuffer(file);
  }

  render() {
    return (
      <Dropzone
        className='file-uploader'
        onDrop={this.onDrop.bind(this)}
        activeStyle={{
          outline: '3px solid black',
          outlineOffset: '-10px',
        }}
      >
        <div className='file-uploader--wrapper'>
          <div className='file-uploader--box'>
            <svg className='file-uploader--box--icon' xmlns="http://www.w3.org/2000/svg" width="50" height="43" viewBox="0 0 50 43">
              <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z">
              </path>
            </svg>
            Drop a .puz file here
          </div>
        </div>
      </Dropzone>
    );
  }
};
