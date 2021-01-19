import React, {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';
import _ from 'lodash';
import {Helmet} from 'react-helmet';
import {RouteComponentProps} from 'react-router';

import {RoomEvent, UserPingRoomEvent} from '../shared/roomEvents';
import {useSocket} from '../sockets/useSocket';
import {initialRoomState, roomReducer} from '../lib/reducers/room';
import {emitAsync} from '../sockets/emitAsync';
import {useMount} from 'react-use';

function subscribeToRoomEvents(
  socket: SocketIOClient.Socket | undefined,
  rid: string,
  setEvents: Dispatch<SetStateAction<RoomEvent[]>>
) {
  let connected = false;
  async function joinAndSync() {
    if (!socket) return;
    await emitAsync(socket, 'join_room', rid);
    socket.on('room_event', (event: any) => {
      if (!connected) return;
      setEvents((events) => [...events, event]);
    });
    const allEvents: RoomEvent[] = (await emitAsync(socket, 'sync_all_room_events', rid)) as any;
    setEvents(allEvents);
    connected = true;
  }
  function unsubscribe() {
    if (!socket) return;
    console.log('unsubscribing from room events...');
    emitAsync(socket, 'leave_room', rid);
  }
  const syncPromise = joinAndSync();

  return {syncPromise, unsubscribe};
}

function useRoomState(events: RoomEvent[]) {
  // TODO history manager for perf optimization
  return useMemo(() => events.reduce(roomReducer, initialRoomState), [events]);
}

const Room: React.FC<RouteComponentProps<{rid: string}>> = (props) => {
  const rid = props.match.params.rid;
  const socket = useSocket();
  const [events, setEvents] = useState<RoomEvent[]>([]);
  console.log('events is', events);
  const roomState = useRoomState(events);

  console.log('room state is', roomState);
  async function sendUserPing() {
    if (socket) {
      const event = UserPingRoomEvent();
      emitAsync(socket, 'room_event', {rid, event});
    }
  }
  useEffect(() => {
    setEvents([]);
    const {syncPromise, unsubscribe} = subscribeToRoomEvents(socket, rid, setEvents);
    syncPromise.then(sendUserPing);
    return unsubscribe;
  }, [rid, socket]);
  useEffect(() => {
    const renewActivity = _.throttle(sendUserPing, 1000 * 60);
    window.addEventListener('mousemove', renewActivity);
    window.addEventListener('keydown', renewActivity);
    return () => {
      window.removeEventListener('mousemove', renewActivity);
      window.removeEventListener('keydown', renewActivity);
    };
  }, [rid, socket]);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Helmet title={`Room ${rid}`} />
      <div>{roomState.users.length} users here</div>
    </div>
  );
};
export default Room;
