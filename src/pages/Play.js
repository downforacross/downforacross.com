import React, {Component} from 'react';
import _ from 'lodash';
import querystring from 'querystring';
import Timestamp from 'react-timestamp';
import {Link} from 'react-router-dom';

import Nav from '../components/common/Nav';
import actions from '../actions';
import {getUser, BattleModel} from '../store';
import redirect from '../lib/redirect';
import {createGame} from '../api/create_game';

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

  get pid() {
    return Number(this.props.match.params.pid);
  }

  get query() {
    return querystring.parse(this.props.location.search.slice(1));
  }

  get is_fencing() {
    return !!this.query.fencing;
  }

  get is_new() {
    return !!this.query.new;
  }

  componentDidUpdate() {
    if (this.query.mode === 'battle') {
      return;
    }

    const {games} = this;
    const shouldAutocreate = !this.state.creating && (!games || (games && games.length === 0) || this.is_new);
    if (shouldAutocreate) {
      this.create();
      return;
    }
    const shouldAutojoin = games && games.length > 0 && !this.state.creating;
    if (shouldAutojoin) {
      const {gid} = games[0];
      const {v2} = games[0];
      const href = v2 ? (this.is_fencing ? `/fencing/${gid}` : `/beta/game/${gid}`) : `/game/${gid}`;

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
    actions.getNextGid(async (gid) => {
      await createGame({gid, pid: this.pid});
      await this.user.joinGame(gid, {
        pid: this.pid,
        solved: false,
        v2: true,
      });
      redirect(this.is_fencing ? `/fencing/${gid}` : `/beta/game/${gid}`);
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
            {_.map(this.games, ({gid, time}) => (
              <tr key={gid}>
                <td>
                  <Timestamp time={time} />
                </td>
                <td>
                  <Link to={`/game/${gid}`}>Game {gid}</Link>
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
