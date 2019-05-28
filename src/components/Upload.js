import './css/upload.css';

import actions from '../actions';
import FileUploader from './FileUploader';

import React, {Component} from 'react';

export default class Upload extends Component {
  constructor() {
    super();
    this.state = {
      puzzle: null,
      recentlyCreatedPuzzleId: null,
    };
  }

  success = (puzzle) => {
    this.setState({
      puzzle: {...puzzle},
      recentlyCreatedPuzzleId: null,
    });
  };

  create = (isPrivate = false) => {
    const {puzzle} = this.state;
    if (isPrivate) {
      puzzle.private = true;
    }
    actions.createPuzzle(puzzle, (pid) => {
      this.setState({puzzle: null});
      this.props.onCreate && this.props.onCreate();
      if (isPrivate) {
        this.setState({
          recentlyCreatedPuzzleId: pid,
        });
      }
    });
  };

  fail = () => {};

  renderSuccessMessage() {
    const {info} = this.state.puzzle || {};
    const {title} = info || {};
    if (title) {
      return (
        <div className="upload--success">
          <span className="upload--success--title">{title}</span>
        </div>
      );
    }
  }

  renderButton() {
    const {v2} = this.props;
    const {info} = this.state.puzzle || {};
    const {type} = info || {};
    if (type) {
      return (
        <div>
          <button className={'upload--button ' + (v2 ? 'v2' : '')} onClick={(e) => this.create(false)}>
            {`Add puzzle to the public ${type} repository`}
          </button>
          <button className={'upload--button ' + (v2 ? 'v2' : '')} onClick={(e) => this.create(true)}>
            {`Create puzzle but keep it unlisted (accessible by URL only)`}
          </button>
        </div>
      );
    }
  }

  renderRecentlyCreatedPuzzleMessage() {
    if (!this.state.recentlyCreatedPuzzleId) {
      return;
    }

    const url = `${window.location.host}/beta/play/${this.state.recentlyCreatedPuzzleId}`;

    return (
      <p style={{marginTop: 10, marginBottom: 10}}>
        Successfully created an unlisted puzzle. You may now visit the link{' '}
        <a href={url} style={{wordBreak: 'break-all'}}>
          {url}
        </a>{' '}
        to play the new puzzle.
      </p>
    );
  }

  render() {
    const {v2} = this.props;
    return (
      <div className="upload">
        <div className="upload--main">
          <div className="upload--main--upload">
            <FileUploader success={this.success} fail={this.fail} v2={v2} />
            {this.renderSuccessMessage()}
            {this.renderButton()}
            {this.renderRecentlyCreatedPuzzleMessage()}
          </div>
        </div>
      </div>
    );
  }
}
