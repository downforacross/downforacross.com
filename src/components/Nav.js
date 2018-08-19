import './css/nav.css';

import { Link } from 'react-router-dom';

import React  from 'react';
import { getUser } from '../store/user';

function LogIn({ user }) {
  if (!user.attached) {
    return null;
  }
  if (user.fb) {
    // for now return a simple "logged in"
    return (
      <div className='nav--right'>
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
      <div className='nav--right'>
        <div className='nav--login'
          onClick={() => {
            user.logIn()
          }}>
          Log in
        </div>
      </div>
    );
  }
}

export default function Nav({hidden, v2, secret}) {
  if (hidden) return null; // no nav for mobile
  if (secret) {
    return (
      <div className='nav'>
        <div className='nav--left'>
          <Link to={'/'}>
            Down for a Cross
          </Link>
          {' '}
          <Link to={'/beta'}>
            <span className='nav--v2 secret'>(beta)</span>
          </Link>
        </div>
        <LogIn user={getUser()}/>
      </div>
    );
  }

  return (
    <div className='nav'>
      <div className='nav--left'>
        <Link to={v2 ? '/beta' : '/'}>
          Down for a Cross
          { v2 ? <span className='nav--v2'> (beta)</span> : null }
        </Link>
      </div>
      <LogIn user={getUser()}/>
    </div>
  );
}
