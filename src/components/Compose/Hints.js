import './css/hints.css';
import React, {Component} from 'react';

import {evaluate, findMatches, getPatterns, precompute} from './lib/hintUtils';

export default class Hints extends Component {
  constructor() {
    super();
    this.state = {
      list: [],
      hidden: true,
    };
    this.scores = {};
  }

  componentDidUpdate() {
    if (!this.hidden) {
      this.startComputing();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.num !== nextProps.num ||
      this.props.direction !== nextProps.direction ||
      nextState.list !== this.state.list ||
      nextState.pattern !== this.state.pattern ||
      nextState.hidden !== this.state.hidden
    );
  }

  componentDidMount() {
    precompute(3);
    precompute(4);
    precompute(5);
  }

  startComputing2() {
    if (this.computing2) return;
    this.computing2 = true;
    const limit = 100; // don't work too hard
    const doWork = (done_cbk, more_cbk) => {
      // call cbk if there's more work to be done
      let cnt = 0;
      for (const word of this.state.list) {
        // eslint-disable-next-line no-continue
        if (word in this.scores) continue;
        this.scores[word] = evaluate(this.props.grid, this.props.direction, this.props.num, word);
        cnt += 1;
        if (cnt >= limit) {
          break;
        }
      }
      this.state.list.sort((a, b) => -((this.scores[a] || -10000) - (this.scores[b] || -10000)));
      this.forceUpdate();
      if (cnt >= limit) {
        more_cbk(); // not done
      } else {
        done_cbk();
      }
    };

    const loop = (cbk) => {
      requestIdleCallback(() => {
        doWork(cbk, () => {
          loop(cbk);
        });
      });
    };

    loop(() => {
      this.computing2 = false;
    });
  }

  startComputing() {
    if (this.computing) {
      return;
    }
    this.computing = true;
    requestIdleCallback(() => {
      findMatches(this.pattern, (matches) => {
        this.setState({
          list: matches,
        });
        this.scores = {}; // reset
        this.startComputing2();
        this.computing = false;
      });
    });
  }

  get pattern() {
    return getPatterns(this.props.grid)[this.props.direction][this.props.num];
  }

  getScore(word) {
    return this.scores[word] && this.scores[word].toFixed(2);
  }

  render() {
    return (
      <div className="hints">
        <div
          className="hints--pattern"
          onClick={() => {
            this.setState((prevState) => ({
              hidden: !prevState.hidden,
            }));
          }}
        >
          <span style={{float: 'left'}}>
            Pattern:
            {this.pattern}
          </span>
          <span style={{float: 'right'}}>
            Matches:
            {this.state.list.length}
          </span>
        </div>
        {!this.state.hidden ? (
          <div className="hints--matches">
            {this.state.list && this.state.list.length > 0 ? (
              <div className="hints--matches--entries">
                {this.state.list.slice(0, 100).map((word, i) => (
                  <div key={i} className="hints--matches--entry">
                    <div className="hints--matches--entry--word">{word}</div>
                    <div className="hints--matches--entry--score">{this.getScore(word) || ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              'No matches'
            )}
          </div>
        ) : null}
      </div>
    );
  }
}
