import './css/upload.css';

import actions from '../actions';
import FileUploader from './FileUploader';

import React, { Component } from 'react';

export default class Upload extends Component {
  constructor() {
    super();
    this.state = { puzzle: null };
  }

  success = (puzzle) => {
    this.setState({ puzzle });
  }

  create = () => {
    const { puzzle } = this.state;
    actions.createPuzzle(puzzle, puzzle => {
      this.setState({ puzzle: null });
    });
  }

  fail = () => {
  }

  renderSuccessMessage() {
    const { info } = this.state.puzzle || {};
    const { title } = info || {};
    if (title) {
      return (
        <div className='upload--success'>
          <span className='upload--success--title'>
            {title}
          </span>
        </div>
      );
    }
  }

  renderButton() {
    const { info } = this.state.puzzle || {};
    const { type } = info || {};
    if (type) {
      return (
        <button
          className='upload--button'
          onClick={this.create}
        >
          {`Add to the ${type} repository`}
        </button>
      );
    }
  }

  render() {
    return (
      <div className='upload'>
        <div className='upload--main'>
          <div className='upload--main--upload'>
            <div className='upload--main--upload--title'>
              Import
            </div>
            <FileUploader
              success={this.success}
              fail={this.fail}
            />
            {this.renderSuccessMessage()}
            {this.renderButton()}
          </div>
        </div>
      </div>
    );
  }
};
