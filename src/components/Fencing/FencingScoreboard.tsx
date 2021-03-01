import {makeStyles} from '@material-ui/core';
import _ from 'lodash';
import React from 'react';
import {GameState} from '../../shared/gameEvents/types/GameState';

const useStyles = makeStyles({
  fencingScoreboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});
export const FencingScoreboard: React.FC<{gameState: GameState; switchTeams(): void}> = (props) => {
  const classes = useStyles();
  // const allCells = _.flatten(props.gameState.game?.grid);
  return (
    <div className={classes.fencingScoreboardContainer}>
      <h2>Fencing</h2>
      <button
        onClick={() => {
          window.confirm('Switch teams? You will see their grid') && props.switchTeams();
        }}
      >
        Switch Teams
      </button>
      <table>
        <tbody>
          <tr>
            <th>Player</th>
            <th>Team</th>
            <th>Score</th>
            <th>Guesses</th>
          </tr>
          {_.map(_.values(props.gameState.users), (user, i) => (
            <tr key={i}>
              <td>{user.displayName}</td>
              <td>{user.teamId}</td>
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
