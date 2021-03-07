import React, {Component} from 'react';
import ReactConfetti from 'react-confetti';

export default class Confetti extends Component {
  constructor() {
    super();
    this.state = {
      done: false,
      numberOfPieces: 200,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        numberOfPieces: 0,
      });
    }, this.props.duration || 7000);
  }

  render() {
    if (this.state.done) return null;
    return (
      <ReactConfetti
        numberOfPieces={this.state.numberOfPieces}
        onConfettiComplete={() => this.setState({done: true})}
      />
    );
  }
}
