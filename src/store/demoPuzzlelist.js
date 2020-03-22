import _ from 'lodash';
import Puzzlelist from './puzzlelist';
import {db, SERVER_TIME} from './firebase';

export default class DemoPuzzleList extends Puzzlelist {
  getPages(pages, cbk) {
    const type = 'Daily Puzzle';
    const title = 'Test Puzzle';
    const author = 'Catheryn Li';
    const description = '';
    const puz = {
      type,
      title,
      author,
      description,
      private: false,
      info: {
        title,
        author,
        description,
        type,
      },
    };
    cbk(
      _.range(20).map((i) => ({
        ...puz,
        title: `Test ${i}`,
      }))
    );
  }
}
