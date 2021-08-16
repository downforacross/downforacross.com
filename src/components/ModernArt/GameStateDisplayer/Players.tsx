import {ModernArtState, ModernArtPlayer, rgbColors} from '../events/types';
import {PlayerActions} from '../usePlayerActions';
import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core';
import _ from 'lodash';

// import icons
import {FaRobot} from 'react-icons/fa';
import {GiRobotAntennas, GiVintageRobot} from 'react-icons/gi';
import {GrDiamond} from 'react-icons/gr';
import {SiTencentqq, SiSwarm} from 'react-icons/si';
import {RiMoonClearLine, RiAliensLine, RiSeedlingLine, RiCactusLine} from 'react-icons/ri';
import {IoMdBeer} from 'react-icons/io';
import {GoSquirrel} from 'react-icons/go';

export const iconsLength = 12;

export const Players: React.FC<{
  gameState: ModernArtState;
  viewerPlayer: ModernArtPlayer;
  playerActions: PlayerActions;
}> = (props) => {
  const classes = useStyles();
  const gameState = props.gameState;
  const viewerPlayer = props.viewerPlayer;
  const actions = props.playerActions;
  // const [currentName, setName] = useState<null | string>(null);

  const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const text = String(e.currentTarget.value);
    if (text !== null) {
      actions.updateName(text);
    }
  };

  const icons = [
    <FaRobot className={classes.playerIcon} />,
    <GiRobotAntennas className={classes.playerIcon} />,
    <GiVintageRobot className={classes.playerIcon} />,
    <GrDiamond className={classes.playerIcon} />,
    <SiTencentqq className={classes.playerIcon} />,
    <SiSwarm className={classes.playerIcon} />,
    <RiMoonClearLine className={classes.playerIcon} />,
    <RiAliensLine className={classes.playerIcon} />,
    <RiSeedlingLine className={classes.playerIcon} />,
    <RiCactusLine className={classes.playerIcon} />,
    <IoMdBeer className={classes.playerIcon} />,
    <GoSquirrel className={classes.playerIcon} />,
  ];

  return (
    <div className={classes.players}>
      {_.values(gameState.players).map((player) => {
        const arts = gameState.rounds[gameState.roundIndex].players[player.id]?.acquiredArt;
        return (
          <div className={classes.floatPlayer}>
            {/* {gameState.started && player.id === _.keys(gameState.players)[gameState.playerIdx] && <div>🎲Auctioneer🎲</div>} */}
            {viewerPlayer?.id === player.id && <div>✨you✨</div>}
            <div> {icons[player.iconIdx]} </div>

            {/* Name can be changed until game starts */}
            {!gameState.started && viewerPlayer?.id === player.id && (
              <span style={{display: 'flex', flexDirection: 'row'}}>
                <input
                  className="border-2 border-gray-500 p-2 rounded"
                  type="text"
                  onChange={handleTextChange}
                  value={viewerPlayer?.name}
                />
              </span>
            )}
            {(gameState.started || viewerPlayer?.id !== player.id) && <div>{player.name}</div>}

            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
              {arts?.map((a) => (
                <div
                  className={classes.acquiredArtCircle}
                  style={{backgroundColor: rgbColors[a.color]}}
                ></div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const useStyles = makeStyles({
  players: {
    display: 'flex',
    justifyContent: 'left',
    padding: '8px',
  },
  floatPlayer: {
    display: 'flex',
    flexDirection: 'column',
    float: 'left',
    padding: '8px',
    margin: '16px',
  },
  acquiredArtCircle: {
    display: 'flex',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
  },
  playerIcon: {
    width: '48px',
    height: '48px',
  },
});
