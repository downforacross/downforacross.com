import {CircularProgress, makeStyles} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {GameState} from '../../shared/gameEvents/types/GameState';
import {GameEventsHook} from './useGameEvents';
import {PlayerActions} from './usePlayerActions';

export const FencingCountdown: React.FC<{
  playerActions: PlayerActions;
  gameState: GameState;
  gameEventsHook: GameEventsHook;
}> = (props) => {
  const [renderCount, setRenderCount] = useState(0);
  const classes = useStyles();
  const serverTime = props.gameEventsHook.getServerTime();
  const GAME_START_DELAY_MS = 1000 * 10;
  const notLoaded = !props.gameState.loaded;
  const notStarted = !props.gameState.loaded || !props.gameState.started;
  const countingDown =
    !props.gameState.started ||
    (props.gameState.startedAt && serverTime < props.gameState.startedAt + GAME_START_DELAY_MS);

  useEffect(() => {
    if (countingDown) {
      requestAnimationFrame(() => {
        setRenderCount((x) => x + 1);
      });
    }
  }, [renderCount, countingDown]);

  if (notLoaded) {
    return (
      <div className={classes.countdown}>
        <CircularProgress />
      </div>
    );
  }
  if (notStarted) {
    return (
      <div className={classes.countdown}>
        <button onClick={props.playerActions.startGame}>Start Game (wait for everyone to join!)</button>
      </div>
    );
  }
  if (countingDown) {
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
