import {makeStyles} from '@material-ui/core';
import React from 'react';
import {Link} from 'react-router-dom';
import clsx from 'clsx';
// @ts-ignore
import swal from '@sweetalert/with-react';

export const WelcomeVariantsControl: React.FC<{
  fencing?: boolean;
}> = (props) => {
  const classes = useStyles();
  const showFencingInfo = () => {
    swal({
      title: 'downforacross.com/fencing',
      icon: 'info',
      content: (
        <div className="swal-text swal-text--no-margin">
          <p>
            Fencing is a variant of Down for a Cross where you can race to complete a crossword against
            friends in real time.
            <br />
            <br />
            Correctly fill in cells correctly before the other team to unlock more clues and explore the grid.
            <br />
            <br />
            <span style={{fontSize: '75%', color: 'gray'}}>
              Join the&nbsp;
              <a href="https://discord.gg/KjPHFw8" target="_blank" rel="noreferrer">
                community Discord
              </a>
              &nbsp;for more discussion.
            </span>
          </p>
        </div>
      ),
    });
  };
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
      <span>
        <Link to="/fencing">
          <span
            className={clsx(classes.option, {
              selected: !!props.fencing,
            })}
          >
            Fencing
          </span>
        </Link>
        <span className="nav--info" onClick={showFencingInfo}>
          <i className="fa fa-info-circle" />
        </span>
      </span>
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
