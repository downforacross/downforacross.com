import React, { Component } from 'react';
import _ from 'lodash';
import Timestamp from 'react-timestamp';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import actions from '../actions';
import { getUser, GameModel, PuzzleModel } from '../store';
import redirect from '../redirect';

export default class Play extends Component {
  constructor() {
    super();
    this.state = {
      userHistory: null,
      creating: false,
    };
  }

  componentDidMount() {
    this.user = getUser();
    this.user.onAuth(() => {
      this.user.listUserHistory().then(userHistory => {
        this.setState({ userHistory });
      });
    });
  }

  get pid() {
    return parseInt(this.props.match.params.pid);
  }
  componentDidUpdate() {
    const games = this.games;
    const shouldAutocreate = (games && games.length === 0 && !this.state.creating);
    if (shouldAutocreate) {
      this.create();
      return;
    }
    const shouldAutojoin = (games && games.length > 0 && !this.state.creating);
    if (shouldAutojoin) {
      const gid = games[0].gid;
      const v2 = games[0].v2;
      const href = v2 ? `/beta/game/${gid}` : `/game/${gid}`;

      if (games.length > 1) {
        setTimeout(() => {
          redirect(href, `Redirecting to game ${gid}`);
        }, 0);
      } else {
          redirect(href, null);
      }
    }
  }

  get games() {
    const { userHistory } = this.state;
    if (!userHistory) {
      return null;
    }

    return _.keys(userHistory)
      .filter(gid => (
        userHistory[gid].pid === this.pid
      ))
      .map(gid => ({
        ...userHistory[gid],
        gid,
      }));
  }

  create() {
    this.setState({
      creating: true,
    });
    actions.getNextGid(gid => {
      const game = new GameModel(`/game/${gid}`);
      const puzzle = new PuzzleModel(`/puzzle/${this.pid}`);
      puzzle.attach();
      puzzle.on('ready', () => {
        const rawGame = puzzle.toGame();
        game.initialize(rawGame);
        const redirect = url => {
          this.props.history.push(url);
        };
        this.user.joinGame(gid, {
          pid: this.pid,
          solved: false,
          v2: true,
        }).then(() => {
          redirect(`/beta/game/${gid}`);
        });
      });
    });
  }

  renderMain() {
    if (!this.games) {
      return (
        <div style={{padding: 20}}>
          Loading...
        </div>
      );
    }

    if (this.state.creating) {
      return (
        <div style={{padding: 20}}>
          Creating game...
        </div>
      );
    }

    return (
      <div style={{padding: 20}}>
        Your Games
        <table><tbody>
            {_.map(this.games, ({gid, time, solved}, i) => (
              <tr key={gid}>
                <td><Timestamp time={time}/></td>
                <td><Link to={`/game/${gid}`}>Game {gid}</Link></td>
              </tr>
            ))}
        </tbody></table>
      </div>
    );
  }

  render() {

    return (
      <div>
        <Nav v2/>
        { this.renderMain() }
      </div>
    );
  }
}
