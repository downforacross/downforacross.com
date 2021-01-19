import classnames from 'classnames';
import ReactDOM from 'react-dom';
import React from 'react';

import {BrowserRouter as Router, Route} from 'react-router-dom';
import {isMobile} from './lib/jsUtils';
import {
  Account,
  Battle,
  Compose,
  Composition,
  Game,
  Play,
  Replay,
  Replays,
  Welcome,
  Stats,
  Room,
} from './pages';
import GlobalContext from './lib/GlobalContext';

import './style.css';
import './dark.css';

const Root = () => {
  const initialValue = window.location.search.indexOf('dark') !== -1;
  const [darkMode, setDarkMode] = React.useState(initialValue);
  const toggleMolesterMoons = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <GlobalContext.Provider value={{toggleMolesterMoons}}>
        <div className={classnames('router-wrapper', {mobile: isMobile(), dark: darkMode})}>
          <Route exact path="/" component={Welcome} />
          <Route exact path="/stats" component={Stats} />
          <Route exact path="/game/:gid" component={Game} />
          <Route exact path="/room/:rid" component={Room} />
          <Route exact path="/replay/:gid" component={Replay} />
          <Route exact path="/beta/replay/:gid" component={Replay} />
          <Route exact path="/replays/:pid" component={Replays} />
          <Route exact path="/replays" component={Replays} />
          <Route exact path="/beta" component={Welcome} />
          <Route exact path="/beta/game/:gid" component={Game} />
          <Route exact path="/beta/battle/:bid" component={Battle} />
          <Route exact path="/beta/play/:pid" component={Play} />
          <Route path="/account" component={Account} />
          <Route exact path="/compose" component={Compose} />
          <Route exact path="/composition/:cid" component={Composition} />
          <Route
            exact
            path="/discord"
            component={() => {
              window.location.href = 'https://discord.gg/KjPHFw8';
              return null;
            }}
          />
        </div>
      </GlobalContext.Provider>
    </Router>
  );
};
/*
ReactDOM.render(
  <h4 style={{marginLeft: 10}}>down for a maintenance</h4>,
  document.getElementById('root')
);
*/
ReactDOM.render(<Root />, document.getElementById('root'));
