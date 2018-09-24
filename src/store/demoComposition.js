import _ from 'lodash';
import {SERVER_TIME} from './firebase';
import Composition, {CURRENT_VERSION} from './composition';

export default class DemoComposition extends Composition {
  attach() {
    super.attach();
    const {
      info = {
        title: 'Untitled',
        author: 'Anonymous',
      },
      grid = _.range(5).map(() =>
        _.range(5).map(() => ({
          value: '',
        }))
      ),
      clues = [],
      circles = [],
      chat = {messages: []},
      cursor = {},
    } = {};

    // TODO validation

    const composition = {
      info,
      grid,
      clues,
      circles,
      chat,
      cursor,
    };

    const version = CURRENT_VERSION;
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'create',
      params: {
        version,
        composition,
      },
    });
  }
}
