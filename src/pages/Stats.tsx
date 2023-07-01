import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {fetchStats} from '../api/stats';
import {ListPuzzleStatsResponse} from '../shared/types';
import {getUser} from '../store/user';
import Flex from 'react-flexview';
import {Helmet} from 'react-helmet';
import Nav from '../components/common/Nav';
import {formatMilliseconds} from '../components/Toolbar/Clock';
import {makeStyles} from '@material-ui/core';

const useStyles = makeStyles({
  header: {
    textAlign: 'center',
  },
});

const Stats: React.FC<{}> = () => {
  const user = getUser();
  const classes = useStyles();

  const [stats, setStats] = useState<ListPuzzleStatsResponse | null>(null);

  useEffect(() => {
    user.listUserHistory().then((history: any) => {
      const recentGames = _.keys(history)
        .filter((gid: string) => history[gid]?.solved)
        .sort((gid: string) => history[gid]?.time)
        .reverse()
        .slice(0, 500);
      fetchStats({gids: recentGames}).then((s) => {
        setStats(s);
      });
    });
  }, [user]);

  return (
    <Flex column className="replays">
      <Nav hidden={false} v2 canLogin={false} divRef={null} linkStyle={null} mobile={null} />
      <Helmet>
        <title>Stats</title>
      </Helmet>

      <div>
        <h2 className={classes.header}>Stats</h2>
        <table className="main-table">
          <tbody>
            <tr>
              <th>Size</th>
              <th># puzzles solved</th>
              <th>Avg solve time</th>
              <th>Best solve time</th>
              <th>Avg squares checked</th>
              <th>Avg squares revealed</th>
            </tr>
            {_.map(
              stats?.stats,
              ({
                size,
                nPuzzlesSolved,
                avgSolveTime,
                bestSolveTime,
                bestSolveTimeGameId,
                avgCheckedSquareCount,
                avgRevealedSquareCount,
              }) => (
                <tr key={size}>
                  <td>{size}</td>
                  <td>{nPuzzlesSolved}</td>
                  <td>{avgSolveTime && formatMilliseconds(avgSolveTime)}</td>
                  <td>
                    {bestSolveTime && (
                      <a href={`/replay/${bestSolveTimeGameId}`}>{formatMilliseconds(bestSolveTime)}</a>
                    )}
                  </td>
                  <td>{avgCheckedSquareCount}</td>
                  <td>{avgRevealedSquareCount}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <div>
        <h2 className={classes.header}>{`History (${stats?.history?.length || 0} total puzzles)`}</h2>
        <table className="main-table">
          <tbody>
            <tr>
              <th>Puzzle</th>
              <th>Date solved</th>
              <th>Solve time</th>
              <th># checked squares</th>
              <th># revealed squares</th>
            </tr>
            {_.map(
              stats?.history,
              ({gameId, title, size, dateSolved, solveTime, checkedSquareCount, revealedSquareCount}) => (
                <tr key={gameId}>
                  <td>
                    <a href={`/replay/${gameId}`}>{title}</a>
                    {` (${size})`}
                  </td>
                  <td>{dateSolved}</td>
                  <td>{formatMilliseconds(solveTime)}</td>
                  <td>{checkedSquareCount}</td>
                  <td>{revealedSquareCount}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Flex>
  );
};

export default Stats;
