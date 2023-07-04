import React, {Component} from 'react';
import _ from 'lodash';
import Flex from 'react-flexview';
import {MdRadioButtonUnchecked, MdCheckCircle} from 'react-icons/md';
import {GiCrossedSwords} from 'react-icons/gi';
import {Link} from 'react-router-dom';

interface EntryPuzzle {
  pid: string;
  status: 'started' | 'solved';
}

export interface EntryProps {
  info: {
    type: string;
  };
  title: string;
  author: string;
  representativeId: string;
  numSolves?: number;
  aggregateStatus: 'started' | 'solved' | undefined;
  fencing?: boolean;
  puzzles: EntryPuzzle[];
}

export default class Entry extends Component<EntryProps> {
  get size() {
    const {type} = this.props.info;
    if (type === 'Daily Puzzle') {
      return 'Standard';
    }
    if (type === 'Mini Puzzle') {
      return 'Mini';
    }
    return 'Puzzle'; // shouldn't get here???
  }

  render() {
    const {title, author, representativeId, aggregateStatus, puzzles, fencing, numSolves} = this.props;
    const displayName = _.compact([author.trim(), this.size]).join(' | ');

    // we link parts of the entry to avoid nesting <a> elements
    const linkify = (content: any, style: {color?: string} = {}) => (
      <Link
        to={`/beta/play/${representativeId}${fencing ? '?fencing=1' : ''}`}
        style={{textDecoration: 'none', overflow: 'hidden', ...style}}
      >
        {content}
      </Link>
    );
    return (
      <Flex className="entry" column>
        <Flex className="entry--top--left">
          {linkify(
            <Flex grow={0}>
              <p
                style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}
                title={displayName}
              >
                {displayName}
              </p>
            </Flex>
          )}
          <Flex>
            {puzzles.map((p) => {
              return (
                <span key={p.pid}>
                  {p.status === 'started' && (
                    <Link
                      to={`/beta/play/${p.pid}${fencing ? '?fencing=1' : ''}`}
                      style={{textDecoration: 'none', color: 'initial'}}
                    >
                      <MdRadioButtonUnchecked className="entry--icon" />
                    </Link>
                  )}
                  {p.status === 'solved' && (
                    <Link
                      to={`/beta/play/${p.pid}${fencing ? '?fencing=1' : ''}`}
                      style={{textDecoration: 'none', color: 'initial'}}
                    >
                      <MdCheckCircle className="entry--icon" />
                    </Link>
                  )}
                  {p.status !== 'started' && p.status !== 'solved' && fencing && (
                    <Link
                      to={`/beta/play/${p.pid}${fencing ? '?fencing=1' : ''}`}
                      style={{textDecoration: 'none', color: 'initial'}}
                    >
                      <GiCrossedSwords className="entry--icon fencing" />
                    </Link>
                  )}
                </span>
              );
            })}
          </Flex>
        </Flex>
        {linkify(
          <>
            <Flex className="entry--main">
              <Flex grow={0}>
                <p style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}} title={title}>
                  {title}
                </p>
              </Flex>
            </Flex>
            <Flex className="entry--details">
              <p>
                Solved {numSolves} {numSolves === 1 ? 'time' : 'times'}
              </p>
            </Flex>
          </>,
          {color: 'initial'}
        )}
      </Flex>
    );
  }
}
