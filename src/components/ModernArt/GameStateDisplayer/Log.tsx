import React from 'react';
import {makeStyles} from '@material-ui/core';
import {LogMessage} from '../events/types';

export const Log: React.FC<{log: LogMessage[]}> = (props) => {
  const classes = useStyles();
  return (
    <pre className={classes.log}>
      {props.log.map((message) => (
        <div className={classes.logMessage}>
          {'>'} {message.hhmm} {message.text}
        </div>
      ))}
    </pre>
  );
};

const useStyles = makeStyles({
  log: {},
  logMessage: {},
});
