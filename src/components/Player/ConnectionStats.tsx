import React, {useState, useEffect} from 'react';

const ConnectionStats: React.FC<{}> = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    | {
        latency: number;
        timestamp: number;
      }
    | undefined
  >();
  useEffect(() => {
    const it = setInterval(() => {
      setConnectionStatus((window as any).connectionStatus);
    }, 100);
    return () => {
      clearInterval(it);
    };
  }, []);

  if (connectionStatus) {
    return (
      <div>
        <div>
          Ping: 
          {' '}
          {connectionStatus?.latency}
          ms (
          {Math.floor((Date.now() - connectionStatus?.timestamp) / 1000)}
          s ago)
        </div>
      </div>
    );
  }
  return <div>Not connected</div>;
};

export default ConnectionStats;
