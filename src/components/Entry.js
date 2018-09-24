import React, {Component} from 'react';
import Flex from 'react-flexview';
import FontAwesome from 'react-fontawesome';
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
    const {title, author, pid, status} = this.props;
    const faName = status === 'started' ? 'circle-o' : status === 'solved' ? 'check-circle' : '';
    return (
      <Link to={`/beta/play/${pid}`} style={{textDecoration: 'none', color: 'initial'}}>
        <Flex className="entryv2" column onClick={this.handleClick} onMouseLeave={this.handleMouseLeave}>
          <Flex className="entryv2--top--left">
            <Flex grow={0}>
              <p
                style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}
                title={`${author} | ${this.size}`}
              >
                {author} | {this.size}
              </p>
            </Flex>
            <Flex className="entryv2--icon">
              <FontAwesome name={faName} style={{color: '#6AA9F4'}} />
            </Flex>
          </Flex>
          <Flex className="entryv2--main">
            <Flex grow={0}>
              <p style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}} title={title}>
                {title}
              </p>
            </Flex>
          </Flex>
        </Flex>
      </Link>
    );
  }
}
