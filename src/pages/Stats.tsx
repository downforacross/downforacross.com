import React, {useEffect} from 'react';
import {fetchStats, TimeWindowStats} from '../store/api';
import _ from 'lodash';

const classes = {} as any; // useStyles();

const Stats: React.FC<{}> = () => {
  const [allStats, setAllStats] = React.useState([] as TimeWindowStats[]);
  useEffect(() => {
    async function refresh() {
      const allStats = await fetchStats();
      setAllStats(allStats);
    }
    refresh();
  }, []);
  return (
    <>
      <h2>Live Stats</h2>
      {_.map(allStats, ({name, stats}) => (
        <div className={classes.container}>
          <div className={classes.header}>{name}</div>
          Previous interval: <div className={classes.counts}>{stats.prevCounts.gameEvents}</div> game events
          Current interval: ({(stats.percentComplete * 100).toFixed(2)}% complete){' '}
          <div className={classes.counts}>{stats.counts.gameEvents}</div> game events
        </div>
      ))}
    </>
  );
};

export default Stats;
