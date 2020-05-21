import React, {Component} from 'react';
import _ from 'lodash';
import Flex from 'react-flexview';
import {MdRadioButtonUnchecked, MdCheckCircle} from 'react-icons/md';
import {Link} from 'react-router-dom';

export default class Entry extends Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
    };
  }

  handleClick = (e) => {
    /*
    this.setState({
      expanded: !this.state.expanded,
    });
    this.props.onPlay(this.props.pid);
    */
  };

  handleMouseLeave = (e) => {
    this.setState({
      expanded: false,
    });
  };

  get size() {
    const {info = {}} = this.props;
    const {type} = info;
    if (type === 'Daily Puzzle') {
      return 'Standard';
    } else if (type === 'Mini Puzzle') {
      return 'Mini';
    } else {
      return '';
    }
  }

  render() {
    const {title, author, pid, status, stats = {}} = this.props;
    const numSolvesOld = _.size(stats.solves);
    const numSolves = numSolvesOld + (stats.numSolves || 0);
    console.log({numSolves, numSolvesOld});
    return (
      <Link to={`/beta/play/${pid}`} style={{textDecoration: 'none', color: 'initial'}}>
        <Flex className="entry" column onClick={this.handleClick} onMouseLeave={this.handleMouseLeave}>
          <Flex className="entry--top--left">
            <Flex grow={0}>
              <p
                style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}
                title={`${author} | ${this.size}`}
              >
                {author} | {this.size}
              </p>
            </Flex>
            <Flex>
              {status === 'started' && <MdRadioButtonUnchecked className="entry--icon" />}
              {status === 'solved' && <MdCheckCircle className="entry--icon" />}
            </Flex>
          </Flex>
          <Flex className="entry--main">
            <Flex grow={0}>
              <p style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}} title={title}>
                {title}
              </p>
            </Flex>
          </Flex>
          <Flex className="entry--details">
            <p style={{fontSize: '75%', paddingLeft: 12}}>
              Solved {numSolves} {numSolves === 1 ? 'time' : 'times'}
            </p>
          </Flex>
        </Flex>
      </Link>
    );
  }
}
