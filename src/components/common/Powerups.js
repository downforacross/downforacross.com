import './css/powerups.css';
import React from 'react';
import Flex from 'react-flexview';

import _ from 'lodash';
import Emoji from './Emoji';
import powerups, {hasExpired, inUse, timeLeft} from '../../lib/powerups';

export default class Powerups extends React.Component {
  constructor() {
    super();
    this.renderPowerup = this.renderPowerup.bind(this);
  }

  componentDidMount() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.forceUpdate(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // TODO: forceUpdate to make sure hasExpired check clears powerups that time out.
  // Maybe by using a delay callback?
  renderPowerup(powerup, count) {
    if (hasExpired(powerup)) {
      return;
    }
    const {type} = powerup;
    const {icon, name} = powerups[type];
    const inuse = inUse(powerup);
    const className = `powerups--emoji ${inuse ? 'powerups--in-use' : 'powerups--unused'}`;
    const onClick = inuse ? undefined : () => this.props.handleUsePowerup(powerup);

    const secsLeft = timeLeft(powerup);
    const format = (x) => x.toString().padStart(2, '0');
    const timeMins = format(Math.floor(secsLeft / 60));
    const timeSecs = format(secsLeft % 60);

    return (
      <Flex key={type} column className="powerups--powerup" onClick={onClick} hAlignContent="center">
        <Flex className="powerups--label">{name}</Flex>
        <Flex className={className}>
          <Flex column>
            <Emoji emoji={icon} big className="powerups--eemoji" />
            <div className="powerups--info" style={{opacity: inuse ? 1 : 0}}>
              {timeMins}:{timeSecs}
            </div>
          </Flex>
          {count > 1 && <div className="powerups--count">{count}</div>}
        </Flex>
      </Flex>
    );
  }

  render() {
    return (
      <Flex className="powerups--main">
        <Flex className="powerups--header">POWERUPS</Flex>
        {_.values(_.groupBy(this.props.powerups, 'type'))
          .map((powerupGroup) => powerupGroup.filter((powerup) => !hasExpired(powerup)))
          .map(
            (powerupGroup) =>
              // only render the first powerup of a given type
              powerupGroup.length > 0 && this.renderPowerup(powerupGroup[0], powerupGroup.length)
          )}
      </Flex>
    );
  }
}
