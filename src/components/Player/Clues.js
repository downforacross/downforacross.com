import './css/clues.css';
import React, {Component} from 'react';
import Clue from './ClueText';

export default class Clues extends Component {
  constructor() {
    super();
    this.state = {
      showClueLengths: false,
    };
    this._toggleShowClueLengths = this.toggleShowClueLengths.bind(this);
  }

  toggleShowClueLengths() {
    const {showClueLengths} = this.state;
    this.setState({showClueLengths: !showClueLengths});
  }

  render() {
    const {
      clues,
      clueLengths,
      isClueSelected,
      isClueHalfSelected,
      isClueFilled,
      scrollToClue,
      selectClue,
    } = this.props;
    const {showClueLengths} = this.state;

    return (
      <div className="clues">
        <div
          className="clues--secret"
          onClick={this._toggleShowClueLengths}
          title={showClueLengths ? '' : 'Show lengths'}
        />
        {
          // Clues component
          ['across', 'down'].map((dir, i) => (
            <div key={i} className="clues--list">
              <div className="clues--list--title">{dir.toUpperCase()}</div>

              <div className={`clues--list--scroll ${dir}`} ref={`clues--list--${dir}`}>
                {clues[dir].map(
                  (clue, i) =>
                    clue && (
                      <div
                        key={i}
                        className={`${
                          (isClueSelected(dir, i) ? 'selected ' : ' ') +
                          (isClueHalfSelected(dir, i) ? 'half-selected ' : ' ') +
                          (isClueFilled(dir, i) ? 'complete ' : ' ')
                        }clues--list--scroll--clue`}
                        ref={
                          isClueSelected(dir, i) || isClueHalfSelected(dir, i)
                            ? scrollToClue.bind(this, dir, i)
                            : null
                        }
                        onClick={selectClue.bind(this, dir, i)}
                      >
                        <div className="clues--list--scroll--clue--number">{i}</div>
                        <div className="clues--list--scroll--clue--text">
                          <Clue text={clue} />
                          {showClueLengths ? (
                            <span className="clues--list--scroll--clue--hint">
                              {'  '}
                              (
                              {clueLengths[dir][i]}
                              )
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          ))
        }
      </div>
    );
  }
}
