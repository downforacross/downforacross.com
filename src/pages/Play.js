import React, {Component} from 'react';
import _ from 'lodash';
import querystring from 'querystring';
import Timestamp from 'react-timestamp';
import {Link} from 'react-router-dom';

import Nav from '../components/common/Nav';
import actions from '../actions';
import {getUser, GameModel, PuzzleModel, BattleModel} from '../store';
import redirect from '../lib/redirect';

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
      this.user.listUserHistory().then((userHistory) => {
        this.setState({userHistory});
      });
    });

    if (this.query.mode === 'battle') {
      this.createAndJoinBattle();
    }
  }

  get beta() {
    return !!this.query.beta;
  }

  get pid() {
    return Number(this.props.match.params.pid);
  }

  get query() {
    return querystring.parse(this.props.location.search.slice(1));
  }

  componentDidUpdate() {
    if (this.query.mode === 'battle') {
      return;
    }

    const {games} = this;
    const shouldAutocreate = !this.state.creating && (!games || (games && games.length === 0));
    if (shouldAutocreate) {
      this.create();
      return;
    }
    const shouldAutojoin = games && games.length > 0 && !this.state.creating;
    if (shouldAutojoin) {
      const {gid} = games[0];
      const {v2} = games[0];
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
    const {userHistory} = this.state;
    if (!userHistory) {
      return null;
    }

    return _.keys(userHistory)
      .filter((gid) => userHistory[gid].pid === this.pid)
      .map((gid) => ({
        ...userHistory[gid],
        gid,
      }));
  }

  create() {
    this.setState({
      creating: true,
    });
    actions.getNextGid((gid) => {
      const game = new GameModel(`/game/${gid}`);
      const puzzle = new PuzzleModel(`/puzzle/${this.pid}`);
      puzzle.attach();
      puzzle.once('ready', async () => {
        const rawGame = puzzle.toGame();
        await Promise.all([
          game.initialize(rawGame, {beta: this.props.beta}),
          this.user.joinGame(gid, {
            pid: this.pid,
            solved: false,
            v2: true,
          }),
        ]);
        redirect(`/beta/game/${gid}`);
      });
    });
  }

  createAndJoinBattle() {
    actions.getNextBid((bid) => {
      const battle = new BattleModel(`/battle/${bid}`);
      battle.initialize(this.pid, bid);
      battle.once('ready', () => {
        redirect(`/beta/battle/${bid}`);
      });
    });
  }

  renderMain() {
    if (this.state.creating) {
      return <div style={{padding: 20}}>Creating game...</div>;
    }

    if (!this.games) {
      return <div style={{padding: 20}}>Loading...</div>;
    }

    return (
      <div style={{padding: 20}}>
        Your Games
        <table>
          <tbody>
            {_.map(this.games, ({gid, time, solved}, i) => (
              <tr key={gid}>
                <td>
                  <Timestamp time={time} />
                </td>
                <td>
                  <Link to={`/game/${gid}`}>
                    Game
                    {gid}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Nav v2 />
        {this.renderMain()}
      </div>
    );
  }
}
