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
  name: {
    '& span': {
      display: 'flex',
      justifyContent: 'space-between',
    },
  },
});
export const FencingScoreboard: React.FC<{
  gameState: GameState;
  currentUserId: string;
  joinTeam(teamId: number): void;
  spectate(): void;
  changeName(newName: string): void;
}> = (props) => {
  const classes = useStyles();
  // TODO buttons need to be icons / dropdown menu once team names are editable
  const spectateButton = (
    <button
      onClick={() => {
        props.spectate();
      }}
    >
      Leave Team
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
  const currentUser = _.values(props.gameState.users).find((user) => user.id === props.currentUserId);
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
          {team.name} {currentUser?.teamId === team.id && spectateButton}
          {currentUser?.teamId === 0 && (
            <button
              onClick={() => {
                props.joinTeam(team.id);
              }}
            >
              Join Team
            </button>
          )}
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
              <td className={classes.name}>{nameEl}</td>
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
