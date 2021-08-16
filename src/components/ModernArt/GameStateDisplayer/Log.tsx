import React, {useRef, useState} from 'react';
import {useUpdateEffect} from 'react-use';
import {makeStyles} from '@material-ui/core';
import {LogMessage} from '../events/types';
import {FaArrowDown} from 'react-icons/fa';

export const Log: React.FC<{log: LogMessage[]}> = (props) => {
  const classes = useStyles();
  const logRef = useRef<HTMLPreElement>(null);
  const [fullyScrolled, setIsFullyScrolled] = useState(true);
  const checkScroll = () => {
    if (!logRef.current) return;
    setIsFullyScrolled(
      logRef.current.scrollTop >= logRef.current.scrollHeight - logRef.current.getBoundingClientRect().height
    );
  };
  useUpdateEffect(() => {
    if (!logRef.current) return;
    if (fullyScrolled) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [props.log]);
  return (
    <div className="flex-col">
      <div className={classes.container}>
        <pre ref={logRef} className={classes.log} onScroll={checkScroll}>
          {props.log.map((message) => (
            <div className={classes.logMessage}>
              {'>'} {message.hhmm} {message.text}
            </div>
          ))}
        </pre>
      </div>
      {!fullyScrolled && (
        <svg className="animate-bounce w-6 h-6">
          {' '}
          <FaArrowDown />{' '}
        </svg>
      )}
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    position: 'relative',
  },
  log: {
    overflow: 'auto',
    maxHeight: 400,
  },
  logMessage: {
    fontSize: 'small',
  },
  notFullyScrolledMessage: {
    position: 'absolute',
    bottom: 0,
    background: 'rgba(0, 0, 0, 70%)',
    color: 'white',
    width: '100%',
    padding: 4,
    textAlign: 'center',
  },
});
