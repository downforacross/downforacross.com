import './css/nav.css';

import {Link} from 'react-router-dom';

import React from 'react';
import classnames from 'classnames';
import {getUser} from '../store/user';

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
  } else {
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
}

export default function Nav({hidden, v2, secret, mobile, textStyle, linkStyle, divRef}) {
  if (hidden) return null; // no nav for mobile

  return (
    <div className={classnames('nav', {mobile})} ref={divRef}>
      <div className="nav--left" style={linkStyle}>
        <Link to={v2 ? '/beta' : '/'}>Down for a Cross</Link>
      </div>
      <LogIn user={getUser()} style={textStyle} />
    </div>
  );
}
