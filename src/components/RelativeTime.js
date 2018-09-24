import './css/RelativeTime.css';
import {getTime} from '../actions';

import React from 'react';
import moment from 'moment';

export default ({date}) => {
  const now = getTime();
  const diffStr = moment(date).from(moment(now));
  const datestr = moment(date).format('L LTS');
  return (
    <span className="relative-time" title={datestr}>
      {diffStr}
    </span>
  );
};
