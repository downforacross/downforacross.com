import GridControls from './GridControls';

export default class ListViewControls extends GridControls {
  actions = {
    left: this.moveToPreviousCell.bind(this),
    up: this.selectPreviousClue.bind(this),
    down: this.selectNextClue.bind(this),
    right: this.moveToNextCell.bind(this),
    forward: this.selectNextClue.bind(this),
    backward: this.selectPreviousClue.bind(this),
    home: this.moveToEdge(true).bind(this),
    end: this.moveToEdge(false).bind(this),
    backspace: this.backspace.bind(this),
    delete: this.delete.bind(this),
    tab: this.selectNextClue.bind(this),
    space: this.flipDirection.bind(this),
  };

  moveToNextCell() {
    const {r, c} = this.props.selected;
    const nextCell = this.grid.getNextCell(r, c, this.props.direction);
    if (nextCell) {
      this.setSelected(nextCell);
      return nextCell;
    }
    this.selectNextClue();
  }

  moveToPreviousCell() {
    const {r, c} = this.props.selected;
    const previousCell = this.grid.getPreviousCell(r, c, this.props.direction);
    if (previousCell) {
      this.setSelected(previousCell);
      return previousCell;
    }
    this.selectPreviousClue();
  }

  selectPreviousClue() {
    this.selectNextClue(true);
  }

  backspace(shouldStay: any): void {
    if (!this.delete() && !shouldStay) {
      const cell = this.moveToPreviousCell();
      if (cell) {
        this.props.updateGrid(cell.r, cell.c, '');
      }
    }
  }
}
