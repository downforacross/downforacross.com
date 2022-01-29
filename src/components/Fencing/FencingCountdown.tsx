import classes from '*.module.css';
import {makeStyles} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {GameState} from '../../shared/gameEvents/types/GameState';
import {GameEventsHook} from './useGameEvents';

export const FencingCountdown: React.FC<{gameState: GameState; gameEventsHook: GameEventsHook}> = (props) => {
  const [renderCount, setRenderCount] = useState(0);
  const classes = useStyles();
  const serverTime = props.gameEventsHook.getServerTime();
  const GAME_START_DELAY_MS = 1000 * 10;
  const loading =
    !props.gameState.started ||
    (props.gameState.startedAt && serverTime < props.gameState.startedAt + GAME_START_DELAY_MS);

  useEffect(() => {
    if (loading) {
      requestAnimationFrame(() => {
        setRenderCount((x) => x + 1);
      });
    }
  }, [renderCount]);
  if (loading) {
    return (
      <div className={classes.countdown}>
        Starting In
        <div className={classes.timer}>
          {((props.gameState.startedAt! - serverTime + GAME_START_DELAY_MS) / 1000).toFixed(2)}
        </div>
      </div>
    );
  }
  return <>{props.children}</>;
};

const useStyles = makeStyles({
  countdown: {
    display: 'flex',
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
    margin: 'auto',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '300%',
  },
  timer: {
    fontSize: '150%',
  },
});
