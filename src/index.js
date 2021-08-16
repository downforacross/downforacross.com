// eslint-disable-next-line import/no-extraneous-dependencies
import classnames from 'classnames';
import ReactDOM from 'react-dom';
import React from 'react';

import {BrowserRouter as Router, Route} from 'react-router-dom';
import {isMobile} from './lib/jsUtils';
import {ModernArt} from './pages';
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
          <Route exact path="/" component={ModernArt} />
          <Route exact path="/:gid" component={ModernArt} />
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
