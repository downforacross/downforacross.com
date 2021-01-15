import React from 'react';
import {usePrevious} from 'react-use';

const RerenderBoundary: React.FC<{hash: string}> = (props) => {
  const prevChildren = React.useRef<React.ReactNode>(props.children);
  const prevHash = usePrevious(props.hash);
  if (prevHash !== props.hash) {
    prevChildren.current = props.children;
  }

  return <>{prevChildren.current}</>;
};

export default RerenderBoundary;
