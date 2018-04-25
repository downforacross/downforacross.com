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

export default function Nav(props) {
  if (props.mobile) return null; // no nav for mobile

  return (
    <div className='nav'>
      <div className='nav--left'>
        <Link to='/'>
          Down for a Cross
        </Link>
      </div>
      <LogIn user={getUser()}/>
    </div>
  );
}
