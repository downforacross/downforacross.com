import './css/nav.css';

import {Link} from 'react-router-dom';
import React, {useContext} from 'react';
import classnames from 'classnames';
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

export default function Nav({hidden, v2, canLogin, secret, mobile, textStyle, linkStyle, divRef}) {
  const {toggleMolesterMoons} = useContext(GlobalContext);
  if (hidden) return null; // no nav for mobile
  const user = getUser();
  return (
    <div className={classnames('nav', {mobile})} ref={divRef}>
      <div className="nav--left" style={linkStyle}>
        <Link to={v2 ? '/beta' : '/'}>Down for a Cross</Link>
      </div>
      <div className="molester-moon" onClick={toggleMolesterMoons}>
        Dark Mode (beta)
      </div>
      {canLogin && (
        <div className="nav--right">
          <LogIn user={user} />
        </div>
      )}
    </div>
  );
}
