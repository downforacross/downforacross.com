import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {Helmet} from 'react-helmet';
import {RouteComponentProps} from 'react-router';

import {UserPingRoomEvent} from '../shared/roomEvents';
import {useSocket} from '../sockets/useSocket';
import {emitAsync} from '../sockets/emitAsync';
import {makeStyles} from '@material-ui/core';

interface GameEvent {
  // stub
}

// Top Down Development / Implementation: First implement the skeleton of the code before filling out the details
// You might invoke a helper function before actually filling it in, and just stub the implementation
function subscribeToGameEvents(
  socket: SocketIOClient.Socket,
  gid: string,
  setEvents: React.Dispatch<React.SetStateAction<GameEvent[]>>
) {
  // stub
  const syncPromise = (async () => {})();
  const unsubscribe = () => {};
  return {syncPromise, unsubscribe};
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
});

const Fencing: React.FC<RouteComponentProps<{gid: string}>> = (props) => {
  const gid = props.match.params.gid;
  const socket = useSocket();
  const [events, setEvents] = useState<GameEvent[]>([]);

  async function sendUserPing() {
    if (socket) {
      const event = UserPingRoomEvent();
      emitAsync(socket, 'game_event', {gid, event});
    }
  }
  useEffect(() => {
    setEvents([]);
    const {syncPromise, unsubscribe} = subscribeToGameEvents(socket, gid, setEvents);
    syncPromise.then(sendUserPing);
    return unsubscribe;
  }, [gid, socket]);
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Helmet title={`Fencing ${gid}`} />
    </div>
  );
};
export default Fencing;
