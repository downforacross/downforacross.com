import _ from 'lodash';
import EventEmitter from 'events';

import {db, SERVER_TIME} from './firebase';

// a wrapper class that models Composition
//
export const CURRENT_VERSION = 1.0;
export default class Composition extends EventEmitter {
  constructor(path) {
    super();
    this.ref = db.ref(path);
    this.events = this.ref.child('events');
    this.createEvent = null;
    this.attached = false;
  }

  attach() {
    this.events.on('child_added', (snapshot) => {
      const event = snapshot.val();
      if (event.type === 'create') {
        this.createEvent = event;
        this.attached = true;
        this.emit('createEvent', event);
      } else {
        this.emit('event', event);
      }
    });
  }

  detach() {
    this.events.off('child_added');
  }

  updateCellText(r, c, value) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateCellText',
      params: {
        cell: {r, c},
        value,
      },
    });
  }

  updateCellColor(r, c, color) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateCellColor',
      params: {
        cell: {r, c},
        color,
      },
    });
  }

  updateClue(r, c, dir, value) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateClue',
      params: {
        cell: {r, c},
        dir,
        value,
      },
    });
  }

  updateCursor(r, c, id, color) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateCursor',
      params: {
        timestamp: SERVER_TIME,
        cell: {r, c},
        color,
        id,
      },
    });
  }

  updateTitle(text) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateTitle',
      params: {
        text,
      },
    });
  }

  updateAuthor(text) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateAuthor',
      params: {
        text,
      },
    });
  }

  chat(username, id, text) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'chat',
      params: {
        text,
        senderId: id,
        sender: username,
      },
    });
  }

  import(filename, contents) {
    const {info, grid, circles, clues} = contents;
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateComposition',
      params: {
        filename, // unused, for now
        info,
        grid,
        circles,
        clues,
      },
    });
  }

  setGrid(grid) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateGrid',
      params: {
        grid,
      },
    });
  }

  clearPencil() {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'clearPencil',
      params: {},
    });
  }

  updateDimensions(width, height, {fromX = 'right', fromY = 'down'} = {}) {
    this.events.push({
      timestamp: SERVER_TIME,
      type: 'updateDimensions',
      params: {
        width,
        height,
        fromX,
        fromY,
      },
    });
  }

  initialize(rawComposition = {}) {
    const {
      info = {
        title: 'Untitled',
        author: 'Anonymous',
      },
      grid = _.range(7).map(() =>
        _.range(7).map(() => ({
          value: '',
        }))
      ),
      clues = [],
      circles = [],
      chat = {messages: []},
      cursor = {},
    } = rawComposition;

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
    // nuke existing events
    return this.events
      .set({})
      .then(() =>
        this.events.push({
          timestamp: SERVER_TIME,
          type: 'create',
          params: {
            version,
            composition,
          },
        })
      )
      .then(() => this.ref.child('published').set(false));
  }
}
