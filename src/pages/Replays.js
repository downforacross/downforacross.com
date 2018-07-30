import './css/replays.css';

import { Helmet } from 'react-helmet';
import _ from 'lodash';
import React, {Component} from 'react';
import Flex from 'react-flexview';

import HistoryWrapper from '../utils/historyWrapper';
import Nav from '../components/Nav';
import { PuzzleModel } from '../store';
import { db } from '../actions';
import Timestamp from 'react-timestamp';
// const Timestamp = require('react-timestamp');


const TimeFormatter = ({millis}) => (
  millis
  ? (
    <span>
      {Math.floor(millis/60000)}m {Math.floor(millis/1000) % 60}s
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

// I guess this function can live here for now
// TODO have participants be accessible from the game store
// TODO usernames???
function getChatters(game) {
  if (!game) return [];
  if (game.chat) {
    const messages = game.chat.messages;
    let chatters = [];
    _.values(messages).forEach(msg => {
      chatters.push(msg.sender);
    });
    return Array.from(new Set(chatters));
  } else if (game.events) {
    let chatters = [];
    _.values(game.events).forEach(event => {
      if (event.type === 'chat') {
        chatters.push(event.params.sender);
      }
    });
    return Array.from(new Set(chatters));
  }
  return [];
}


export default class Replays extends Component {
  constructor() {
    super();
    this.state = {
      games: {},
      soloPlayers: [],
      puzInfo: {},
    };
    this.puzzle = null;
  }

  get pid() {
    return parseInt(this.props.match.params.pid);
  }

  processGame(rawGame, gid) {
    if (rawGame.events) {
      const events = _.values(rawGame.events);
      const historyWrapper = new HistoryWrapper(events);
      const game = historyWrapper.getSnapshot();
      const startTime = historyWrapper.createEvent.timestamp / 1000;
      console.log(startTime);
      return ({
        gid,
        v2: true,
        startTime,
        solved: game.solved,
        time: game.clock.totalTime,
        chatters: getChatters(rawGame),
        active: !game.clock.paused,
      });
    } else {
      return ({
        gid,
        v2: false,
        solved: rawGame.solved,
        startTime: rawGame.startTime / 1000,
        time: getTime(rawGame),
        chatters: getChatters(rawGame),
        active: true,
      });
    }
  }

  componentDidMount() {
    this.puzzle = new PuzzleModel(`/puzzle/${this.pid}`, this.pid);
    this.puzzle.attach();
    this.puzzle.on('ready', () => {
      this.setState({
        puzInfo: this.puzzle.info,
      });
    });

    // go through the list of all the games
    // callback: if this is its pid, append its gid to the games list
    this.puzzle.listGames(rawGames => {
      const games = _.map(_.keys(rawGames), gid => this.processGame(rawGames[gid], gid));
      this.setState({
        games,
      });
    });

    // TODO: go through the list of solo games
    // callback: if this is its pid, append it to the list of solo players
    //
    // function callback(something) {
    //     this.setState(prevState => ({
    //         soloPlayers: [...prevState.soloPlayers, [pid, time]],
    //         games: prevState.games,
    //     }))
    // }
  }

  renderHeader() {
    if (!this.state.puzInfo || this.state.error) {
      return null;
    }
    return (
      <div className='header'>
        <div className='header--title'>
          {this.state.puzInfo.title}
        </div>

        <div className='header--subtitle'>
          Replays / currently playing games
        </div>
      </div>
    );
  }

  linkToGame(gid, {v2, active, solved}) {
    return <a href={(v2 ? '/beta' : '') + '/game/' + gid}>{solved ? 'done' : active ? 'still playing' : 'paused'}</a>
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
    const list1Items = _.values(games).map(({ gid, solved, startTime, time, chatters, v2, active }) => (
        <tr key={gid}>
          <td><a href={'/replay/' + gid}>Game #{gid}{v2 ? '(beta)' : ''}</a></td>
          <td><Timestamp time={startTime}/></td>
          <td><TimeFormatter millis={time}/></td>
          <td>{this.linkToGame(gid, {v2, active, solved})}</td>
          <td>{chatters.join(", ")}</td>
        </tr>
      )
    );
    const players = this.state.soloPlayers;
    const list2Items = players.map(({id, solved, time}) =>
      <tr>
        <td><a href={`/replay/solo/${id}/${this.pid}`}>Play by player #{id}</a></td>
        <td>Not implemented</td>
        <td><TimeFormatter millis={time}/></td>
        <td>{solved ? 'done' : 'not done'}</td>
        <td>Solo by user {id}</td>
      </tr>
    );

    return (
      <table className={'main-table'}>
        <tbody>
          <tr><th>Game</th><th>Start time</th><th>Duration</th><th>Progress</th><th>Participants</th></tr>
          {list1Items}
          {list2Items}
        </tbody>
      </table>
    );
  }

  getPuzzleTitle() {
    if (!this.puzzle || !this.puzzle.info) return '';
    return this.puzzle.info.title;
  }

  render() {
    console.log(this.pid, this.getPuzzleTitle());
    return (
      <Flex column className='replays'>
        <Nav mobile={false} v2/>
        <Helmet>
          <title>{`Replays ${this.pid}: ${this.getPuzzleTitle()}`}</title>
        </Helmet>
        <div
          style={{
            paddingLeft: 30,
            paddingTop: 20,
            paddingBottom: 20,
          }}>
          {this.renderHeader()}
          <div
            style={{
              padding: 20,
            }}>
            {this.renderList()}
          </div>
        </div>
      </Flex>
    );
  }
}
