import './css/index.css';

import actions from '../../actions';
import FileUploader from './FileUploader';
import React, {Component} from 'react';
import {createNewPuzzle} from '../../api/puzzle';

export default class Upload extends Component {
  constructor() {
    super();
    this.state = {
      puzzle: null,
      recentUnlistedPid: null,
      unlistedCheckboxChecked: false,
    };
  }

  success = (puzzle) => {
    this.setState({
      puzzle: {...puzzle},
      recentUnlistedPid: null,
      unlistedCheckboxChecked: false,
    });
  };

  create = async () => {
    const isPublic = !this.state.unlistedCheckboxChecked;
    const puzzle = {
      ...this.state.puzzle,
      private: !isPublic,
    };
    // store in both firebase & pg
    actions.createPuzzle(puzzle, (pid) => {
      this.setState({puzzle: null});
      this.props.onCreate && this.props.onCreate();
      this.setState({
        recentUnlistedPid: isPublic ? undefined : pid,
      });

      createNewPuzzle(puzzle, pid, {
        isPublic,
      });
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

  handleChangeUnlistedCheckbox = (e) => {
    this.setState({
      unlistedCheckboxChecked: e.target.checked,
    });
  };

  renderButton() {
    const {v2} = this.props;
    const {info} = this.state.puzzle || {};
    const {type} = info || {};
    if (type) {
      return (
        <div>
          <label>
            <input
              type="checkbox"
              checked={this.state.unlistedCheckboxChecked}
              onChange={this.handleChangeUnlistedCheckbox}
            />{' '}
            Unlisted
          </label>
          <button className={'upload--button ' + (v2 ? 'v2' : '')} onClick={this.create}>
            {`Add puzzle to the ${type} repository`}
            {this.state.unlistedCheckboxChecked ? ' (unlisted)' : ''}
          </button>
        </div>
      );
    }
  }

  renderRecentlyCreatedPuzzleMessage() {
    if (!this.state.recentUnlistedPid) {
      return;
    }

    const url = `/beta/play/${this.state.recentUnlistedPid}`;

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
