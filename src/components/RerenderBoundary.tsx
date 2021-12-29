import React from 'react';
import {usePrevious} from 'react-use';

const RerenderBoundary: React.FC<{name: string; hash: string}> = (props) => {
  const prevChildren = React.useRef<React.ReactNode>(props.children);
  const prevHash = usePrevious(props.hash);
  if (prevHash !== props.hash) {
    prevChildren.current = props.children;
    console.debug('rerendering', props.name);
  }

  return <>{prevChildren.current}</>;
};

export default RerenderBoundary;
