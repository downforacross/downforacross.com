import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {RouteComponentProps} from 'react-router';

import {Fencing} from '../components/Fencing/Fencing';

const FencingWrapper: React.FC<RouteComponentProps<{gid: string}>> = (props) => {
  const gid = props.match.params.gid;

  return <Fencing gid={gid} />;
};
export default FencingWrapper;
