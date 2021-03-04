import './css/fileUploader.css';

import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import {MdFileUpload} from 'react-icons/md';
import swal from '@sweetalert/with-react';

import {hasShape} from '../../lib/jsUtils';
import PUZtoJSON from '../../lib/converter/PUZtoJSON';

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

  onDrop(acceptedFiles) {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    const {success, fail} = this.props;
    reader.addEventListener('loadend', () => {
      try {
        const puzzle = this.convertPUZ(reader.result);
        if (this.validPuzzle(puzzle)) {
          success(puzzle);
        } else {
          fail();
        }
      } catch (e) {
        swal({
          title: `Invalid .puz file`,
          text: `The uploaded file is not a valid .puz file.`,
          icon: 'warning',
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
            Import .puz file
          </div>
        </div>
      </Dropzone>
    );
  }
}
