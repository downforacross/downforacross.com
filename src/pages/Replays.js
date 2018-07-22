import './css/replays.css';

import _ from 'lodash';
import React, {Component} from 'react';
import Flex from 'react-flexview';
import Nav from '../components/Nav';
import {db} from '../actions';
import { PuzzleModel } from '../store';

const TimeFormatter = ({millis}) => (
  millis
  ? (
    <span>
      {Math.floor(millis/60000)} minutes, {Math.floor(millis/1000) % 60} seconds
    </span>
  )
  : null
);

function getTime(game) {
  if (game.stopTime) {
    let t = game.stopTime - game.startTime;
    if (game.pauseTime) t += game.pauseTime;
    return t;
  }
}

export default class Replays extends Component {
  constructor() {
    super();
    this.state = {
      games: [],
      soloPlayers: [],
    };
  }

  componentDidMount() {
    const pid = this.pid;
    this.puzzle = new PuzzleModel(`/puzzle/${pid}`, pid);
    this.puzzle.attach();
    this.puzzle.on('ready', () => {
      this.setState({
        info: this.puzzle.info,
      });
    });

    this.puzzle.listGames(rawGames => {
      const games = _.map(_.keys(rawGames), gid => ({
        gid,
        solved: rawGames[gid].solved,
        time: getTime(rawGames[gid]),
      }))
      this.setState({
        games,
      });
    });
  }

  get pid() {
    return this.props.match.params.pid;
  }

  renderHeader() {
    if (!this.state.info) {
      return null;
    }
    const {title, author, type} = this.state.info;
    return (
      <div>
        <div className='header--title'>
          {title}
        </div>

        <div className='header--subtitle'>
          {
            type && (
              type + ' | '
              + 'By ' + author
            )
          }
        </div>
      </div>
    );
  }

  renderList() {
    if (this.state.error) {
      return (
        <div>
          Error loading replay
        </div>
      );
    }

    const games = this.state.games;
    const list1Items = games.map(({gid, solved, time}) =>
      <tr>
        <td><a href={'/replay/' + gid}>Game #{gid}</a></td>
        <td><TimeFormatter millis={time}/></td>
        <td>{solved ? 'done' : 'not done'}</td>
      </tr>
    );

    const players = this.state.soloPlayers;
    const list2Items = players.map(({id, solved, time}) =>
      <tr>
        <td><a href={'/replay/solo/' + id + '/' + this.pid}>Play by player #{id}</a></td>
        <td><TimeFormatter millis={time}/></td>
        <td>{solved ? 'done' : 'not done'}</td>
      </tr>
    );

    return (
      <table>
        <tr><th>Game</th><th>Time of game</th><th>Progress</th></tr>
        {list1Items}
        {list2Items}
      </table>
    );
  }


  render() {
    return (
      <Flex column className='replay'>
        <Nav/>
        <div
          style={{
            paddingLeft: 30,
            paddingTop: 20,
            paddingBottom: 20,
          }}>
          {this.renderHeader()}
        </div>
        <div
          style={{
            padding: 10,
            border: '1px solid #E2E2E2',
          }}>
          <div
            style={{
              // flex: 1,
            }}>
            {this.renderList()}
          </div>
        </div>
      </Flex>
    );
  }
}
