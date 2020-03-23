export default class Caret {
  constructor(el) {
    this.el = el;
  }

  _getRange() {
    const {el} = this;
    if (!el) return;
    let start;
    let end;
    if (typeof window.getSelection !== 'undefined') {
      const {baseOffset, focusOffset} = window.getSelection();
      const start = Math.min(baseOffset, focusOffset);
      const end = Math.max(baseOffset, focusOffset);
      return {
        start,
        end,
      };
    }

    return {
      start,
      end,
    };
  }

  get startPosition() {
    const range = this._getRange();
    return range && range.start;
  }

  get endPosition() {
    const range = this._getRange();
    return range && range.end;
  }

  set startPosition(position) {
    const {el} = this;
    if (!el) return;
    if (position > el.length) {
      position = el.length;
    }
    if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      range.setStart(range.startContainer, position);
      range.setEnd(range.startContainer, position);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange !== 'undefined') {
      const textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
    }
  }
}
