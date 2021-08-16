import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {Redirect, RouteComponentProps} from 'react-router';
import {v4 as uuidv4} from 'uuid';
import {ModernArt} from '../components/ModernArt/ModernArt';

const ModernArtWrapper: React.FC<RouteComponentProps<{gid: string}>> = (props) => {
  const gid = props.match.params.gid;

  if (!gid) {
    return <Redirect to={`/${uuidv4()}`} />;
  }
  return <ModernArt gid={gid} />;
};
export default ModernArtWrapper;
