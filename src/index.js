import {
  Welcome, Room, Compose, Solo, Upload
} from './pages/index';

import ReactDOM from 'react-dom';
import React from 'react';

import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'

import './style.css';

ReactDOM.render(
  <Router>
    <div className='router-wrapper'>
      <Route exact path="/" component={Welcome}/>
      <Route exact path="/game/:gid" component={Room}/>
      <Route exact path="/game/solo/:pid" component={Solo}/>
      <Route path="/puzzle/:pid" component={Solo}/>
      <Route exact path="/upload" component={Upload}/>
      <Route exact path="/compose" component={Compose}/>
    </div>
  </Router>,
  document.getElementById('root')
);

