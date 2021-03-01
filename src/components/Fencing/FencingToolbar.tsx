import React from 'react';
import {ToolbarActions} from './useToolbarActions';

export const FencingToolbar: React.FC<{toolbarActions: ToolbarActions}> = (props) => {
  return (
    <div>
      <button onClick={props.toolbarActions.checkCell}>CHECK CELL</button>
    </div>
  );
};
