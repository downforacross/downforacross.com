import './css/nav.css';

import {Link} from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import React, {useContext} from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import classnames from 'classnames';
import swal from '@sweetalert/with-react';
import GlobalContext from '../../lib/GlobalContext';
import {getUser} from '../../store/user';

function LogIn({user, style}) {
  if (!user.attached) {
    return null;
  }
  if (user.fb) {
    // for now return a simple "logged in"
    return (
      <div className="nav--right" style={style}>
        Logged in
      </div>
    );
    /*
    return (
      <div className='nav--right'>
        <Link to='/account'
          className='nav--right'>
          Account
        </Link>
      </div>
    );
    */
  }
  return (
    <div className="nav--right" style={style}>
      <div
        className="nav--login"
        onClick={() => {
          user.logIn();
        }}
      >
        Log in
      </div>
    </div>
  );
}

function showInfo() {
  swal({
    title: 'downforacross.com',
    icon: 'info',
    content: (
      <div className="swal-text swal-text--no-margin">
        <p>
          Down for a Cross is an online website for sharing crosswords and playing collaboratively with
          friends in real time. Join the&nbsp;
          <a href="https://discord.gg/KjPHFw8" target="_blank" rel="noreferrer">
            community Discord
          </a>
          &nbsp;for more discussion.
        </p>
        <hr className="info--hr" />
        <p>
          Down for a Cross is open to contributions from developers of any level or experience. For more
          information or to report any issues, check out the project on&nbsp;
          <a href="https://github.com/downforacross/downforacross.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </div>
    ),
  });
}

function darkModePreferenceText(darkModePreference) {
  switch (darkModePreference) {
    case '1':
      return 'On';
    case '2':
      return 'System default';
    case '0':
    default:
      return 'Off';
  }
}

export default function Nav({hidden, v2, canLogin, mobile, linkStyle, divRef}) {
  const {darkModePreference, toggleMolesterMoons} = useContext(GlobalContext);
  if (hidden) return null; // no nav for mobile
  const user = getUser();
  const fencing = window.location.href.includes('fencing');
  return (
    <div className={classnames('nav', {mobile})} ref={divRef}>
      <div className="nav--left" style={linkStyle}>
        <Link to={fencing ? '/fencing' : '/'}>Down for a Cross</Link>
      </div>
      <div className="nav--right">
        <div
          className="molester-moon"
          style={darkModePreference !== '0' ? {opacity: 1} : {}}
          onClick={toggleMolesterMoons}
        >
          Dark Mode (beta): {darkModePreferenceText(darkModePreference)}
        </div>
        <div className="nav--right stats">
          <a href="/stats">Your stats</a>
        </div>
        <div className="nav--info" onClick={showInfo}>
          <i className="fa fa-info-circle" />
        </div>
        {canLogin && <LogIn user={user} />}
      </div>
    </div>
  );
}
