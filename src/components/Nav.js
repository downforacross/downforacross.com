import './css/nav.css';

import { Link } from 'react-router-dom';

import React  from 'react';

export default function Nav(props) {
  if (props.mobile) return null; // no nav for mobile

  return (
    <div className='nav'>
      <div className='nav--left'>
        <Link to='/'>
          Down for a Cross
        </Link>
      </div>
      <div className='nav--right'>
        <a href='http://www.downfiveacross.com'>
          Old site
        </a>
      </div>
    </div>
  );
}
