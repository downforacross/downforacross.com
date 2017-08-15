import './upload.css';

import actions, { db } from '../actions';
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
        try {
          eval(this.state.textbox);
          this.setState({ puzzle: puzzle });
        } catch(e) {
          this.setState({ puzzle: null });
        }
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
        <div className='upload--create'>
          <div className='upload--create--main'>
            <div className='upload--create--main--upload'>
              <div className='upload--create--main--upload--title'>
                Upload a .puz file here...
              </div>
              <FileUploader
                failUpload={this.failUpload.bind(this)}
                setPuzzle={this.setPuzzle.bind(this)}
              />
            </div>
            <div className='upload--create--main--paste'>
              <div className='upload--create--main--paste--title'>
                ... or paste a JSON here
              </div>
              <textarea
                placeholder='Type Here'
                className='upload--create--main--paste--textbox'
                onInput={this.handleTextboxInput.bind(this)}
                value={this.state.textbox}
              />
            </div>
          </div>

          {
            (this.state.textbox || this.state.uploaded)
              ? (<div className='upload--create--preview'>
                Uploaded puzzle is <b>{this.puzzleIsValid() ? 'valid!' : 'invalid'}</b>
              </div>)
              : null
          }
          <button
            className='upload--create--go'
            onClick={this.handleGoClick.bind(this)}>
            Create Puzzle
          </button>
        </div>
      </div>
    );
  }
};
