import {
  Welcome, Room, Puzzle, Compose, Solo, Upload
} from './containers/index';

import {Helmet} from "react-helmet";
import ReactDOM from 'react-dom';
import React from 'react';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import './style.css';

ReactDOM.render(
  <Router>
    <div className='router-wrapper'>
      <Helmet>
        <title>Down for Across</title>
        <meta property="og:title" content='Down for Across' />
      </Helmet>
      <Route exact path="/" component={Welcome}/>
      <Route exact path="/game/:gid" component={Room}/>
      <Route exact path="/game/solo/:pid" component={Solo}/>
      <Route path="/puzzle/:pid" component={Puzzle}/>
      <Route exact path="/upload" component={Upload}/>
      <Route exact path="/compose" component={Compose}/>
    </div>
  </Router>,
  document.getElementById('root')
);

