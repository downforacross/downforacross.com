import './css/create.css';
import React, {Component} from 'react';

export default class Create extends Component {
  constructor() {
    super();
    this.state = {
      dims: {
        r: 5,
        c: 5,
      },
      pattern: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    };
    this.paintColor = undefined;
    this.painted = {};
  }

  handleClick() {
    this.props.onCreate &&
      this.props.onCreate({
        dims: this.state.dims,
        pattern: this.state.pattern,
      });
  }

  resizePattern() {
    const newPattern = [];
    const oldPattern = this.state.pattern;
    for (let i = 0; i < this.state.dims.r; i += 1) {
      newPattern[i] = [];
      for (let j = 0; j < this.state.dims.c; j += 1) {
        newPattern[i][j] = (oldPattern[i] || [])[j] || 0;
      }
    }

    this.setState({
      pattern: newPattern,
    });
  }

  flipPattern(r, c) {
    this.setState((prevState) => {
      const pattern = JSON.parse(JSON.stringify(prevState.pattern));
      pattern[r][c] = 1 - pattern[r][c];
      return {pattern};
    });
  }

  paint(r, c, val) {
    if (this.state.pattern[r][c] === val) return;

    this.painted[`${r}_${c}`] = true;
    this.flipPattern(r, c);
  }

  resetPaint() {
    this.paintColor = undefined;
    this.painted = {};
  }

  updateDimsDelta(dr, dc) {
    this.updateDims(this.state.dims.r + dr, this.state.dims.c + dc);
  }

  updateDims(r, c) {
    this.setState(
      {
        dims: {
          r: Math.min(Math.max(1, r), 25),
          c: Math.min(Math.max(1, c), 25),
        },
      },
      () => {
        this.resizePattern();
      }
    );
  }

  render() {
    const size = 180 / Math.max(this.state.dims.r, this.state.dims.c);
    return (
      <div className="create">
        <div className="create--options">
          <div className="create--options--height">
            <button onClick={this.updateDimsDelta.bind(this, -1, 0)}> - </button>
            <div className="create--options--label">Height:</div>
            <input
              value={this.state.dims.r}
              onChange={(e) =>
                this.updateDims(Number(e.target.value) || this.state.dims.r, this.state.dims.c)}
            />
            <button onClick={this.updateDimsDelta.bind(this, +1, 0)}> + </button>
          </div>
          <div className="create--options--width">
            <button onClick={this.updateDimsDelta.bind(this, 0, -1)}> - </button>
            <div className="create--options--label">Width:</div>
            <input
              value={this.state.dims.c}
              onChange={(e) =>
                this.updateDims(this.state.dims.r, Number(e.target.value) || this.state.dims.c)}
            />
            <button onClick={this.updateDimsDelta.bind(this, 0, +1)}> + </button>
          </div>
        </div>

        <div className="create--pattern">
          <table className="create--pattern--grid">
            <tbody>
              {this.state.pattern.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={`${r}_${c}`}
                      className="create--pattern--grid--cell--wrapper"
                      style={{
                        width: size,
                        height: size,
                      }}
                    >
                      <div
                        onMouseMove={(e) => {
                          if (e.buttons === 1) {
                            if (this.paintColor === undefined) {
                              this.paintColor = 1 - this.state.pattern[r][c];
                            }
                            this.paint(r, c, this.paintColor);
                          }
                        }}
                        onMouseDown={() => {
                          this.resetPaint();
                        }}
                        onClick={() => {
                          if (!this.painted[`${r}_${c}`]) {
                            this.flipPattern(r, c);
                          }
                          this.resetPaint();
                        }}
                        onDrag={(e) => e.preventDefault()}
                        className={`${cell === 0 ? 'white ' : 'black '}create--pattern--grid--cell`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="create--btn" onClick={this.handleClick.bind(this)}>
          Create
        </button>
      </div>
    );
  }
}
