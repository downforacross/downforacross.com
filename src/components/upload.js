import './css/upload.css';

import actions from '../actions';
import FileUploader from './fileUploader';

import React, { Component } from 'react';

export default class Upload extends Component {
  constructor() {
    super();
    this.state = {
      puzzle: null,
      convertedPuzzle: null,
    };
    this._success = this.success.bind(this);
    this._fail = this.fail.bind(this);
    this._create = this.create.bind(this);
  }

  success(convertedPuzzle) {
    console.log(convertedPuzzle);
    this.setState({
      puzzle: null,
      convertedPuzzle,
    });
  }

  create() {
    const { convertedPuzzle } = this.state;
    actions.createPuzzle(convertedPuzzle, puzzle => {
      this.setState({
        convertedPuzzle: null,
        puzzle,
      });
    });
  }

  fail() {
    this.setState({ puzzle: null });
  }

  renderSuccessMessage() {
    const { info } = this.state.convertedPuzzle || {};
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
    const { info } = this.state.convertedPuzzle || {};
    const { type } = info || {};
    if (type) {
      return (
        <button
          className='upload--button'
          onClick={this._create}
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
              success={this._success}
              fail={this._fail}
            />
            {this.renderSuccessMessage()}
            {this.renderButton()}
          </div>
        </div>
      </div>
    );
  }
};
