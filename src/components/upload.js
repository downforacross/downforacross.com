import './upload.css';

import actions from '../actions';
import FileUploader from './fileUploader';

import React, { Component } from 'react';

export default class Upload extends Component {
  constructor() {
    super();
    this.state = {
      uploaded: false,
      textbox: '',
      puzzle: null
    };
  }

  prevent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  handleTextboxInput(ev) {
    this.setState({ textbox: ev.target.value }, () => {
      let puzzle;
      try {
        puzzle = JSON.parse(this.state.textbox);
        this.setState({ puzzle: puzzle });
      } catch(e) {
        this.setState({ puzzle: null });
      }
    });
  }

  puzzleIsValid() {
    if (!this.state.puzzle) return false;
    // TODO more validation
    return true;
  }

  getPuzzle() {
    return this.state.puzzle;
  }

  setPuzzle(puzzle) {
    this.setState({
      puzzle: puzzle,
      uploaded: true
    });
  }

  failUpload() {
    this.setState({
      uploaded: true
    });
  }

  handleGoClick(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    if (this.puzzleIsValid()) {
      actions.createPuzzle(this.getPuzzle(), pid => {
        this.props.history.push(`/puzzle/${pid}`);
      });
    }
  }

  render() {
    return (
      <div className='upload'>
        <div className='upload--main'>
          <div className='upload--main--upload'>
            <div className='upload--main--upload--title'>
              Upload
            </div>
            <FileUploader
              failUpload={this.failUpload.bind(this)}
              setPuzzle={this.setPuzzle.bind(this)}
            />
          </div>
        </div>

        {
          (this.state.textbox || this.state.uploaded)
            ? (<div className='upload--preview'>
              Uploaded puzzle is <b>{this.puzzleIsValid() ? 'valid!' : 'invalid'}</b>
            </div>)
            : null
        }
        <button
          className='upload--go'
          onClick={this.handleGoClick.bind(this)}>
          Create Puzzle
        </button>
      </div>
    );
  }
};
