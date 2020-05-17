import React, {Component} from 'react';
import Confetti from 'react-confetti';

export default class extends Component {
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
    }, 7000);
  }

  render() {
    if (this.state.done) return null;
    return (
      <Confetti
        numberOfPieces={this.state.numberOfPieces}
        onConfettiComplete={() => this.setState({done: true})}
      />
    );
  }
}
