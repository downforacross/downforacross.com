import _ from 'lodash';
import * as uuid from 'uuid';
import React, {useState} from 'react';
import {useUpdateEffect} from 'react-use';
import {Helmet} from 'react-helmet';
import Flex from 'react-flexview';
import {makeStyles} from '@material-ui/core';
import {useSocket} from '../../sockets/useSocket';
import {emitAsync} from '../../sockets/emitAsync';
import Player from '../Player';
import {transformGameToPlayerProps} from './transformGameToPlayerProps';
import {usePlayerActions} from './usePlayerActions';
import {useToolbarActions} from './useToolbarActions';
import {GameEvent} from '../../shared/fencingGameEvents/types/GameEvent';
import {getUser} from '../../store/user';
import {FencingScoreboard} from './FencingScoreboard';
import {TEAM_IDS} from '../../shared/fencingGameEvents/constants';
import {FencingToolbar} from './FencingToolbar';
import nameGenerator from '../../lib/nameGenerator';
import {useGameEvents, GameEventsHook} from './useGameEvents';
import {getStartingCursorPosition} from '../../shared/fencingGameEvents/eventDefs/create';
import Nav from '../common/Nav';
import Chat from '../Chat';
import {FencingCountdown} from './FencingCountdown';

function subscribeToGameEvents(
  socket: SocketIOClient.Socket | undefined,
  gid: string,
  eventsHook: GameEventsHook
) {
  let connected = false;
  async function joinAndSync() {
    if (!socket) return;
    await emitAsync(socket, 'join_game', gid);
    socket.on('game_event', (event: any) => {
      if (!connected) return;
      eventsHook.addEvent(event);
    });
    const allEvents: GameEvent[] = (await emitAsync(socket, 'sync_all_game_events', gid)) as any;
    eventsHook.setEvents(allEvents);

    connected = true;
  }
  function unsubscribe() {
    if (!socket) return;
    console.log('unsubscribing from game events...');
    emitAsync(socket, 'leave_game', gid);
  }
  const syncPromise = joinAndSync();

  return {syncPromise, unsubscribe};
}
const useStyles = makeStyles({
  container: {
    flex: 1,
    display: 'flex',
    // height: '100%',
    padding: 24,
    flexDirection: 'column',
  },
  scoreboardContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: 12,
    '& *': {
      borderCollapse: 'collapse',
    },
  },
});
/**
 * This component is parallel to Game -- will render a <Player/>
 * Will implement custom competitive crossword logic (see PR #145)
 */
export const Fencing: React.FC<{gid: string}> = (props) => {
  const {gid} = props;
  const socket = useSocket();

  const eventsHook = useGameEvents();
  async function sendEvent(event: GameEvent) {
    (event as any).timestamp = {
      '.sv': 'timestamp',
    };
    (event as any).id = uuid.v4();
    console.log('sending event', socket, event);
    eventsHook.addOptimisticEvent(event);
    if (socket) {
      emitAsync(socket, 'game_event', {gid, event});
    } else {
      console.warn('Cannot send event; not connected to server');
    }
  }

  const [isInitialized, setIsInitialized] = useState(false);
  useUpdateEffect(() => {
    eventsHook.setEvents([]);
    const {syncPromise, unsubscribe} = subscribeToGameEvents(socket, gid, eventsHook);
    syncPromise.then(() => {
      setIsInitialized(true);
    });
    return unsubscribe;
  }, [gid, socket]);
  const gameState = eventsHook.gameState;

  const id = getUser().id;
  const teamId = gameState.users[id]?.teamId;

  useUpdateEffect(() => {
    if (isInitialized) {
      console.log('initializing for the first time', id, teamId);
      if (!gameState) {
        return; // shouldn't happen
      }
      if (!gameState.users[id]?.displayName) {
        sendEvent({
          type: 'updateDisplayName',
          params: {
            id,
            displayName: nameGenerator(),
          },
        });
      }
      if (!teamId) {
        const nTeamId = _.minBy(
          TEAM_IDS,
          (t) => _.filter(_.values(gameState.users), (user) => user.teamId === t).length
        )!;
        sendEvent({
          type: 'updateTeamId',
          params: {
            id,
            teamId: nTeamId,
          },
        });
        sendEvent({
          type: 'updateCursor',
          params: {
            id,
            cell: getStartingCursorPosition(gameState.game!, nTeamId),
          },
        });
      }
    }
  }, [isInitialized]);

  const classes = useStyles();
  console.log('Game State:', gameState);

  const toolbarActions = useToolbarActions(sendEvent, gameState, id);
  const playerActions = usePlayerActions(sendEvent, id);

  const changeName = (newName: string): void => {
    if (newName.trim().length === 0) {
      newName = nameGenerator();
    }
    sendEvent({
      type: 'updateDisplayName',
      params: {
        id,
        displayName: newName,
      },
    });
  };
  const changeTeamName = (newName: string): void => {
    if (!teamId) return;
    if (newName.trim().length === 0) {
      newName = nameGenerator();
    }
    sendEvent({
      type: 'updateTeamName',
      params: {
        teamId,
        teamName: newName,
      },
    });
  };
  const joinTeam = (teamId: number) => {
    sendEvent({
      type: 'updateTeamId',
      params: {
        id,
        teamId,
      },
    });
  };
  const spectate = () => {
    sendEvent({
      type: 'updateTeamId',
      params: {
        id,
        teamId: teamId ? 0 : 1,
      },
    });
  };
  const handleChat = (username: string, id: string, message: string) => {
    sendEvent({
      type: 'sendChatMessage',
      params: {
        id,
        message,
      },
    });
    sendEvent({
      type: 'chat' as any,
      params: {
        id,
        text: message,
      },
    });
  };
  const fencingScoreboard = (
    <FencingScoreboard
      gameState={gameState}
      currentUserId={id}
      changeName={changeName}
      changeTeamName={changeTeamName}
      joinTeam={joinTeam}
      spectate={spectate}
    />
  );
  return (
    <Flex column style={{flex: 1}}>
      <Nav hidden={false} v2 canLogin={false} divRef={null} linkStyle={null} mobile={null} />
      <Flex style={{flex: 1, overflow: 'auto'}}>
        <div className={classes.container}>
          <Helmet title={`Fencing ${gid}`} />
          <div style={{flex: 1}}>
            <FencingCountdown playerActions={playerActions} gameState={gameState} gameEventsHook={eventsHook}>
              {gameState.loaded && gameState.started && (
                <>
                  {' '}
                  <FencingToolbar toolbarActions={toolbarActions} />
                  <Player
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...transformGameToPlayerProps(
                      gameState.game!,
                      _.values(gameState.users),
                      playerActions,
                      id,
                      teamId
                    )}
                  />
                </>
              )}
            </FencingCountdown>
          </div>
        </div>
        <Flex column style={{flexBasis: 500}}>
          {!gameState.loaded && <div>Loading your game...</div>}
          {gameState.game && (
            <Chat
              isFencing
              subheader={<div className={classes.scoreboardContainer}>{fencingScoreboard}</div>}
              info={gameState.game.info}
              teams={gameState.teams}
              path={`/fencing/${gid}`}
              data={gameState.chat}
              game={gameState.game}
              gid={gid}
              users={gameState.users}
              id={id}
              myColor={null}
              onChat={handleChat}
              mobile={false}
              updateSeenChatMessage={null}
              onUpdateDisplayName={(_id: string, name: string) => changeName(name)}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
