import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {RouteComponentProps} from 'react-router';

import {ModernArt} from '../components/ModernArt/ModernArt';

const ModernArtWrapper: React.FC<RouteComponentProps<{gid: string}>> = (props) => {
  const gid = props.match.params.gid;

  return <ModernArt gid={gid} />;
};
export default ModernArtWrapper;
