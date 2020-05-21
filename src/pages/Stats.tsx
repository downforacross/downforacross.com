import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {fetchStats, TimeWindowStats} from '../store/api';
import _ from 'lodash';

const useStyles = makeStyles({
  page: {
    padding: 16,
  },
  container: {
    padding: 16,
    // backgroundColor: 'red',
  },
  header: {
    fontSize: '200%',
  },
  counts: {
    fontWeight: 'bold',
  },
  table: {
    borderCollapse: 'collapse',
  },
});

const Stats: React.FC<{}> = () => {
  const classes = useStyles();
  const [allStats, setAllStats] = React.useState([] as TimeWindowStats[]);
  useEffect(() => {
    async function refresh() {
      const allStats = await fetchStats();
      setAllStats(allStats);
    }
    refresh();
  }, []);
  return (
    <div className={classes.page}>
      {_.map(allStats, ({name, stats}) => (
        <div key={name} className={classes.container}>
          <div className={classes.header}>{_.capitalize(name)} Stats</div>
          <table className={classes.table}>
            <tbody>
              <tr>
                <th>Interval</th>
                <th>Percent Complete</th>
                <th>Active Games</th>
                <th>Game Events</th>
                <th>Bytes Transferred</th>
              </tr>
              <tr>
                <td>Previous Interval</td>
                <td>100%</td>
                <td>{stats.prevCounts.activeGames}</td>
                <td>{stats.prevCounts.gameEvents}</td>
                <td>{stats.prevCounts.bytesTransferred}</td>
              </tr>
              <tr>
                <td>Current Interval</td>
                <td>{(stats.percentComplete * 100).toFixed(2)}%</td>
                <td>{stats.counts.activeGames}</td>
                <td>{stats.counts.gameEvents}</td>
                <td>{stats.counts.bytesTransferred}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Stats;
