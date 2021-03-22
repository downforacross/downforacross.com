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
  // TODO buttons need to be icons / dropdown menu once team names are editable
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
  const teamData = _.keys(props.gameState.teams).map((teamId) => ({
    team: props.gameState.teams[teamId]!,
    users: _.values(props.gameState.users).filter((user) => String(user.teamId) === teamId),
  }));
  const rows: {
    nameEl: React.ReactNode;
    score?: number;
    guesses?: number;
    isCurrent?: boolean;
  }[] = _.flatMap(teamData, ({team, users}) => [
    {
      nameEl: (
        <span
          style={{
            fontWeight: 'bold',
            color: team.color,
          }}
        >
          {team.name}
        </span>
      ),
      score: team.score,
      guesses: team.guesses,
    },
    ...users.map((user) => ({
      nameEl: (
        <>
          <span>{user.displayName}</span>
          {` `}
          {user.id === props.currentUserId ? changeNameButton : null}
          {` `}
          {user.id === props.currentUserId ? switchTeamsButton : null}
          {` `}
          {user.id === props.currentUserId ? spectateButton : null}
        </>
      ),
      score: user.score,
      guesses: user.misses,
      isCurrent: user.id === props.currentUserId,
    })),
  ]);
  const spectators = _.values(props.gameState.users).filter((user) => user.teamId === 0);
  const spectatorRows: {
    nameEl: React.ReactNode;
    score?: number;
    guesses?: number;
    isCurrent?: boolean;
  }[] = _.isEmpty(spectators)
    ? []
    : [
        {
          nameEl: (
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              Spectators
            </span>
          ),
        },
        ...spectators.map((user) => ({
          nameEl: <span>{user.displayName}</span>,
        })),
      ];
  return (
    <div className={classes.fencingScoreboardContainer}>
      <h2>Fencing</h2>
      <table>
        <tbody>
          <tr>
            <th>Player</th>
            <th>Score</th>
            <th>Guesses</th>
          </tr>
          {_.map([...rows, ...spectatorRows], ({nameEl, score, guesses, isCurrent}, i) => (
            <tr key={i} className={isCurrent ? 'fencing-scoreboard--current-user' : ''}>
              <td>{nameEl}</td>
              <td>{score}</td>
              <td>{guesses}</td>
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
