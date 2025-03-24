// eslint-disable-next-line import/no-extraneous-dependencies
import classnames from 'classnames';
import ReactDOM from 'react-dom';
import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
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
  Room,
  Fencing,
  WrappedWelcome,
} from './pages';
import GlobalContext from './lib/GlobalContext';

import './style.css';
import './dark.css';
import './global.css';

const darkModeLocalStorageKey = 'dark_mode_preference';

const Root = () => {
  const urlDarkMode = window.location.search.indexOf('dark') !== -1;
  const savedDarkModePreference = (localStorage && localStorage.getItem(darkModeLocalStorageKey)) || '0';
  const [darkModePreference, setDarkModePreference] = React.useState(
    urlDarkMode ? '1' : savedDarkModePreference
  );

  const toggleMolesterMoons = () => {
    let newDarkModePreference;
    switch (darkModePreference) {
      case '0':
        newDarkModePreference = '1';
        break;
      case '1':
        newDarkModePreference = '2';
        break;
      case '2':
      default:
        newDarkModePreference = '0';
    }
    localStorage && localStorage.setItem(darkModeLocalStorageKey, newDarkModePreference);
    setDarkModePreference(newDarkModePreference);
  };

  const systemDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkMode = darkModePreference === '2' ? systemDarkMode : darkModePreference === '1';

  return (
    <Router>
      <GlobalContext.Provider value={{toggleMolesterMoons, darkModePreference}}>
        <div className={classnames('router-wrapper', {mobile: isMobile(), dark: darkMode})}>
          <Switch>
            <Route exact path="/" component={WrappedWelcome} />
            <Route exact path="/fencing">
              <WrappedWelcome fencing />
            </Route>
            {/* <Route exact path="/stats" component={Stats} /> */}
            <Route exact path="/game/:gid" component={Game} />
            <Route exact path="/embed/game/:gid" component={Game} />
            <Route exact path="/room/:rid" component={Room} />
            <Route exact path="/embed/room/:rid" component={Room} />
            <Route exact path="/replay/:gid" component={Replay} />
            <Route exact path="/beta/replay/:gid" component={Replay} />
            <Route exact path="/replays/:pid" component={Replays} />
            <Route exact path="/replays" component={Replays} />
            <Route exact path="/beta" component={WrappedWelcome} />
            <Route exact path="/beta/game/:gid" component={Game} />
            <Route exact path="/beta/battle/:bid" component={Battle} />
            <Route exact path="/beta/play/:pid" component={Play} />
            <Route path="/account" component={Account} />
            <Route exact path="/compose" component={Compose} />
            <Route exact path="/composition/:cid" component={Composition} />
            <Route exact path="/fencing/:gid" component={Fencing} />
            <Route exact path="/beta/fencing/:gid" component={Fencing} />
            <Route
              exact
              path="/discord"
              component={() => {
                window.location.href = 'https://discord.gg/KjPHFw8';
                return null;
              }}
            />
          </Switch>
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
