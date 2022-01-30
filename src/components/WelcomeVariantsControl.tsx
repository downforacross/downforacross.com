import {makeStyles} from '@material-ui/core';
import React from 'react';
import {Link} from 'react-router-dom';
import clsx from 'clsx';

export const WelcomeVariantsControl: React.FC<{
  fencing?: boolean;
}> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <span className={classes.title}>Variants</span>
      <Link to="/">
        <span
          className={clsx(classes.option, {
            selected: !props.fencing,
          })}
        >
          Normal
        </span>
      </Link>
      <Link to="/fencing">
        <span
          className={clsx(classes.option, {
            selected: !!props.fencing,
          })}
        >
          Fencing
        </span>
      </Link>
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px !important',
    '& a': {
      textDecoration: 'none',
    },
  },
  title: {
    fontSize: '200%',
  },
  option: {
    color: 'gray',
    '&.selected': {
      color: 'blue',
    },
  },
});
