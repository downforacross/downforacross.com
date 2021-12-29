import {makeStyles} from '@material-ui/core';
import _ from 'lodash';
import React from 'react';
import {GameState} from '../../shared/gameEvents/types/GameState';
import EditableSpan from '../common/EditableSpan';
import './css/fencingScoreboard.css';

const useStyles = makeStyles({
  fencingScoreboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    '& td, th': {
      padding: 8,
    },
  },
  teamName: {
    display: 'flex',
    justifyContent: 'space-between',
    '& > *': {
      marginLeft: 4,
    },
  },
  userName: {
    marginLeft: 20,
    display: 'flex',
    justifyContent: 'space-between',
  },
});
export const FencingScoreboard: React.FC<{
  gameState: GameState;
  currentUserId: string;
  joinTeam(teamId: number): void;
  spectate(): void;
  changeName(newName: string): void;
  changeTeamName(newName: string): void;
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
        <span className={classes.teamName}>
          {currentUser?.teamId === team.id ? (
            <EditableSpan
              style={{
                fontWeight: 'bold',
                color: team.color,
              }}
              value={team.name}
              onChange={props.changeTeamName}
            />
          ) : (
            <span
              style={{
                fontWeight: 'bold',
                color: team.color,
              }}
            >
              {team.name}
            </span>
          )}
          {currentUser?.teamId === team.id && spectateButton}
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
        <span className={classes.userName}>
          {user.id === props.currentUserId ? (
            <EditableSpan value={user.displayName} onChange={props.changeName} />
          ) : (
            <span>{user.displayName}</span>
          )}
        </span>
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
          isCurrent: user.id === props.currentUserId,
        })),
      ];
  return (
    <div className={classes.fencingScoreboardContainer}>
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
        </tbody>
      </table>
    </div>
  );
};
