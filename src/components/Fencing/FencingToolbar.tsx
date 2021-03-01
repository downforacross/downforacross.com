import React from 'react';
import {ToolbarActions} from './useToolbarActions';

export const FencingToolbar: React.FC<{toolbarActions: ToolbarActions}> = (props) => {
  return (
    <div>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          props.toolbarActions.revealCell();
        }}
      >
        Reveal Cell
      </button>
    </div>
  );
};
