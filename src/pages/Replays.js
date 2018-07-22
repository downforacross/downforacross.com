import './css/replays.css';

import _ from 'lodash';
import React, {Component} from 'react';
import Flex from 'react-flexview';
import Nav from '../components/Nav';
import { PuzzleModel } from '../store';
import { db } from '../actions';

const Timestamp = require('react-timestamp');


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
    console.log(game.events);
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
  }

  get pid() {
    return this.props.match.params.pid;
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
      const games = _.map(_.keys(rawGames), gid => ({
        gid,
        solved: rawGames[gid].solved,
        startTime: rawGames[gid].startTime / 1000,
        time: getTime(rawGames[gid]),
        chatters: getChatters(rawGames[gid]),
      }));
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
    console.log(this.state.puzInfo);
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

  linkToGame(gid){
    return <a href={'/game/' + gid}>still playing</a>
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
    let list1Items = [];

    Object.values(games).forEach(({gid, solved, startTime, time, chatters}) => {
      list1Items.push(
        <tr key={gid}>
          <td><a href={'/replay/' + gid}>Game #{gid}</a></td>
          <td><Timestamp time={startTime}/></td>
          <td><TimeFormatter millis={time}/></td>
          <td>{solved ? 'done' : this.linkToGame(gid)}</td>
          <td>{chatters.join(", ")}</td>
        </tr>
      );
    });

    const players = this.state.soloPlayers;
    const list2Items = players.map(({id, solved, time}) =>
      <tr>
        <td><a href={'/replay/solo/' + id + '/' + this.pid}>Play by player #{id}</a></td>
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


  render() {
    return (
      <Flex column className='replays'>
        <Nav mobile={false}/>
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
