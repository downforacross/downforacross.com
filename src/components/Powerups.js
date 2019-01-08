import './css/powerups.css';
import React from 'react';
import Flex from 'react-flexview';

import Emoji from './Emoji';
import powerups, {hasExpired, inUse, timeLeft} from '../lib/powerups';

import _ from 'lodash';

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
  renderPowerup(powerup, idx) {
    if (hasExpired(powerup)) {
      return;
    }
    const {type} = powerup;
    const {icon, name} = powerups[type];
    const inuse = inUse(powerup);
    const className = inuse ? 'powerups--in-use' : 'powerups--unused';
    const onClick = inuse ? undefined : () => this.props.handleUsePowerup(powerup);

    const secsLeft = timeLeft(powerup);
    const format = (x) => x.toString().padStart(2, '0');
    const timeMins = format(Math.floor(secsLeft / 60));
    const timeSecs = format(secsLeft % 60);

    return (
      <Flex className="powerups--powerup" onClick={onClick}>
        <Flex className="powerups--label">{name}</Flex>
        {inuse && (
          <Flex className="powerups--info">
            {timeMins}:{timeSecs}
          </Flex>
        )}
        <Flex key={idx} className={className}>
          <Emoji emoji={icon} big={true} className="powerups--eemoji" />
        </Flex>
      </Flex>
    );
  }

  render() {
    return (
      <Flex className="powerups--main">
        <Flex className="powerups--header">POWERUPS</Flex>
        {_.map(this.props.powerups, this.renderPowerup)}
      </Flex>
    );
  }
}
