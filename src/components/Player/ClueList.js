import React from 'react';
import {MdClose} from 'react-icons/md';
import Clue from './ClueText';
import './css/clueList.css';

export default class ClueList extends React.Component {
  handleClueClick = (direction, number) => {
    this.props.onSelectClue(direction, number);
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  renderClueSection(direction, clues = {}, clueLengths) {
    const title = direction === 'across' ? 'Across' : 'Down';
    const {selected} = this.props;
    const isSelectedDirection = selected.direction === direction;

    return (
      <div className="mobile-grid-controls--clue-section">
        <div className="mobile-grid-controls--clue-section-header">{title}</div>
        {Object.keys(clues).map((number) => {
          const isSelected = isSelectedDirection && selected.number === number;
          const clueText = clues[number];
          const clueLength = clueLengths && clueLengths[direction] && clueLengths[direction][number];
          const lengthText = clueLength ? ` (${clueLength})` : '';

          return (
            <div
              key={`${direction}-${number}`}
              className={`mobile-grid-controls--clue-item ${isSelected ? 'active' : ''}`}
              onClick={() => this.handleClueClick(direction, number)}
            >
              <div className="mobile-grid-controls--clue-item-number">{number}</div>
              <div className="mobile-grid-controls--clue-item-text">
                <Clue text={`${clueText}${lengthText}`} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const {clues, clueLengths, onClose} = this.props;

    return (
      <div className="mobile-grid-controls--clue-list-overlay">
        <div className="mobile-grid-controls--clue-list-header">
          <div className="mobile-grid-controls--clue-list-title">Clues</div>
          <div className="mobile-grid-controls--clue-list-close" onClick={onClose}>
            <MdClose />
          </div>
        </div>
        <div className="mobile-grid-controls--clue-list-content">
          {this.renderClueSection('across', clues.across, clueLengths)}
          {this.renderClueSection('down', clues.down, clueLengths)}
        </div>
      </div>
    );
  }
}
