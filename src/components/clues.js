import './clues.css';

import React, { Component } from 'react';

export default class Clues extends Component{
  render() {
    const {
      clues,
      isClueSelected,
      isClueHalfSelected,
      isClueFilled,
      scrollToClue,
      selectClue,
    } = this.props;
    return (
      <div className='clues'>
        {
          // Clues component
          ['across', 'down'].map((dir, i) => (
            <div key={i} className='clues--list'>
              <div className='clues--list--title'>
                {dir.toUpperCase()}
              </div>

              <div
                className={'clues--list--scroll ' + dir}
                ref={'clues--list--'+dir}>
                {
                  clues[dir].map((clue, i) => clue && (
                    <div key={i}
                      className={
                        (isClueSelected(dir, i)
                          ?  'selected '
                          : ' ')
                          + (isClueHalfSelected(dir, i) ?
                            'half-selected '
                            : ' ')
                          + (isClueFilled(dir, i)
                            ? 'complete '
                            : ' ')
                          + 'clues--list--scroll--clue'}
                          ref={
                            (isClueSelected(dir, i) ||
                              isClueHalfSelected(dir, i))
                              ? scrollToClue.bind(this, dir, i)
                              : null}
                              onClick={selectClue.bind(this, dir, i)}>
                              <div className='clues--list--scroll--clue--number'>
                                {i}
                              </div>
                              <div className='clues--list--scroll--clue--text'>
                                {clue}
                              </div>
                            </div>
                  ))
                }
              </div>
            </div>
          ))
        }
      </div>
    );
  }
}

