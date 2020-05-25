import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {fetchStats, AllStats} from '../store/api';
import _ from 'lodash';

const useStyles = makeStyles({
  page: {
    padding: 16,
  },
  liveContainer: {
    padding: 16,
  },
  timeWindowContainer: {
    padding: 16,
  },
  header: {
    fontSize: '200%',
  },
  counts: {
    fontWeight: 'bold',
  },
  table: {
    borderCollapse: 'collapse',
    textAlign: 'right',
  },
});

const Stats: React.FC<{}> = () => {
  const classes = useStyles();
  const [allStats, setAllStats] = React.useState({} as AllStats);
  useEffect(() => {
    async function refresh() {
      const allStats = await fetchStats();
      setAllStats(allStats);
    }
    refresh();
  }, []);
  return (
    <div className={classes.page}>
      {allStats.liveStats && (
        <div className={classes.liveContainer}>
          <div className={classes.header}>Live Stats</div>
          <div>
            {allStats.liveStats.connectionsCount}{' '}
            {allStats.liveStats.connectionsCount === 1 ? 'user' : 'users'} online
          </div>
          <div>
            {allStats.liveStats.gamesCount} {allStats.liveStats.gamesCount === 1 ? 'game' : 'games'} being
            played
          </div>
        </div>
      )}
      {_.map(allStats.timeWindowStats, ({name, stats}) => (
        <div key={name} className={classes.timeWindowContainer}>
          <div className={classes.header}>{_.capitalize(name)} Stats</div>
          <table className={classes.table}>
            <tbody>
              <tr>
                <th>Interval</th>
                <th>Percent Complete</th>
                <th>Active Games</th>
                <th>Game Events</th>
                <th>New Connections</th>
                <th>Bytes Received</th>
                <th>Bytes Sent</th>
              </tr>
              <tr>
                <td>Previous Interval</td>
                <td>100%</td>
                <td>{stats.prevCounts.activeGames}</td>
                <td>{stats.prevCounts.gameEvents}</td>
                <td>{stats.prevCounts.connections}</td>
                <td>{stats.prevCounts.bytesReceived}</td>
                <td>{stats.prevCounts.bytesSent}</td>
              </tr>
              <tr>
                <td>Current Interval</td>
                <td>{(stats.percentComplete * 100).toFixed(2)}%</td>
                <td>{stats.counts.activeGames}</td>
                <td>{stats.counts.gameEvents}</td>
                <td>{stats.counts.connections}</td>
                <td>{stats.counts.bytesReceived}</td>
                <td>{stats.counts.bytesSent}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Stats;
