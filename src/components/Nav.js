import './css/nav.css';

import { Link } from 'react-router-dom';

import React  from 'react';

export default function Nav() {
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
