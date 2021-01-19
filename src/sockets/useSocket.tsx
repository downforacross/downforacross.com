import {useState} from 'react';
import {useAsync} from 'react-use';
import {getSocket} from './getSocket';

export const useSocket = () => {
  const [socket, setSocket] = useState<SocketIOClient.Socket>();
  useAsync(async () => {
    setSocket(await getSocket());
  });
  return socket;
};
