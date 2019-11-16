import {
  Account,
  Battle,
  Compose,
  Composition,
  Game,
  GameV2,
  Play,
  Replay,
  ReplaySolo,
  ReplayV2,
  Replays,
  Room,
  Solo,
  WelcomeV2,
} from './pages/index';
import {isMobile} from './jsUtils';
import Testing from './pages/Testing';
import classnames from 'classnames';
import ReactDOM from 'react-dom';
import React from 'react';

import {BrowserRouter as Router, Route} from 'react-router-dom';
import GlobalContext from './GlobalContext';

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
          <Route exact path="/" component={WelcomeV2} />
          <Route exact path="/game/:gid" component={Game} />
          <Route exact path="/room/:rid" component={Room} />
          <Route exact path="/room/:rid/:gid" component={Room} />
          <Route exact path="/replay/:gid" component={Replay} />
          <Route exact path="/replay/solo/:uid/:pid" component={ReplaySolo} />
          <Route exact path="/beta/replay/:gid" component={ReplayV2} />
          <Route exact path="/replays/:pid" component={Replays} />
          <Route exact path="/replays" component={Replays} />
          <Route exact path="/game/solo/:pid" component={Solo} />
          <Route exact path="/beta" component={WelcomeV2} />
          <Route exact path="/beta/game/:gid" component={GameV2} />
          <Route exact path="/beta/battle/:bid" component={Battle} />
          <Route exact path="/beta/play/:pid" component={Play} />
          <Route path="/puzzle/:pid" component={Solo} />
          <Route path="/account" component={Account} />
          <Route exact path="/compose" component={Compose} />
          <Route exact path="/composition/:cid" component={Composition} />
          <Route exact path="/secret_testing" component={Testing} />
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
