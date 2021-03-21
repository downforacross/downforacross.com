import {makeStyles} from '@material-ui/core';
import _ from 'lodash';
import React from 'react';
import nameGenerator from '../../lib/nameGenerator';
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
  spectate(): void;
  changeName(newName: string): void;
}> = (props) => {
  const classes = useStyles();
  // const allCells = _.flatten(props.gameState.game?.grid);
  const switchTeamsButton = (
    <button
      onClick={() => {
        props.switchTeams();
      }}
    >
      Switch
    </button>
  );
  const spectateButton = (
    <button
      onClick={() => {
        props.spectate();
      }}
    >
      Spectate
    </button>
  );
  const changeNameButton = (
    <button
      onClick={() => {
        props.changeName(
          window.prompt('Your Name', props.gameState.users[props.currentUserId].displayName) ||
            nameGenerator()
        );
      }}
    >
      Edit
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
              <td>
                <span
                  style={{
                    fontWeight: userId === props.currentUserId ? 'bold' : 'initial',
                    color: props.gameState.teams[user.teamId ?? 0]?.color,
                  }}
                >
                  {user.displayName}
                </span>
                {` `}
                {userId === props.currentUserId ? changeNameButton : null}
              </td>
              <td>
                {user.teamId}
                {` `}
                {userId === props.currentUserId ? switchTeamsButton : null}
                {` `}
                {userId === props.currentUserId ? spectateButton : null}
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
