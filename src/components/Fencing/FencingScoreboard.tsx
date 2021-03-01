import {makeStyles} from '@material-ui/core';
import _ from 'lodash';
import React from 'react';
import {GameState} from '../../shared/gameEvents/types/GameState';
import './css/fencingScoreboard.css';

const useStyles = makeStyles({
  fencingScoreboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});
export const FencingScoreboard: React.FC<{
  gameState: GameState;
  currentUserId: string;
  switchTeams(): void;
}> = (props) => {
  const classes = useStyles();
  // const allCells = _.flatten(props.gameState.game?.grid);
  const switchTeamsButton = (
    <button
      onClick={() => {
        window.confirm('Switch teams? You will see their grid') && props.switchTeams();
      }}
    >
      Switch
    </button>
  );
  return (
    <div className={classes.fencingScoreboardContainer}>
      <h2>Fencing</h2>
      <table>
        <tbody>
          <tr>
            <th>Player</th>
            <th>Team</th>
            <th>Score</th>
            <th>Guesses</th>
          </tr>
          {_.map(props.gameState.users, (user, userId) => (
            <tr
              key={userId}
              className={userId === props.currentUserId ? 'fencing-scoreboard--current-user' : ''}
            >
              <td>{user.displayName}</td>
              <td>
                {user.teamId}
                {` `}
                {userId === props.currentUserId ? switchTeamsButton : null}
              </td>
              <td>{user.score}</td>
              <td>{user.misses}</td>
            </tr>
          ))}
          {/* <tr>
            <td>Team {1}</td>
            <td>1</td>
            <td>{allCells.filter((cell) => cell).length}</td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
};
