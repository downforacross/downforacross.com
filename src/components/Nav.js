import './css/nav.css';

import { Link } from 'react-router-dom';
import { logIn, getUser, logOut } from '../auth';

import React  from 'react';

function LogIn({ user }) {
  if (user) {
    return (
      <div className='nav--right'>
        <Link to='/account'
          className='nav--right'>
          Account
        </Link>
      </div>
    );
  } else {
    return (
      <div className='nav--right'>
        <div className='nav--login'
          onClick={logIn}>
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
