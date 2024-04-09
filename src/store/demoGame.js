import Game from './game';
import {SERVER_TIME} from './firebase';

// a wrapper class that models Game

export default class DemoGame extends Game {
  attach() {
    super.attach();
    const s = {
      params: {
        game: {
          clues: {
            across: [
              null,
              'Midterms and finals',
              null,
              null,
              null,
              null,
              '"TORY" left on a keyboard?',
              'A vulgar condemnation of 7-Down',
              'Red body parts, for high schoolkids?',
              'Five-paragraph test, for high school kids',
            ],
            down: [
              null,
              null,
              'Tests taken while wearing a vest',
              'Tests before the USAMO',
              'Society with high IQ test scores',
              'One to blame for a positive test result?',
              null,
              'Poor letter grade',
            ],
          },
          createTime: 1523786727088,
          gid: '',
          grid: [
            [
              {
                black: false,
                number: 1,
                parents: {across: 1, down: 0},
                value: '',
              },
              {
                black: false,
                number: 2,
                parents: {across: 1, down: 2},
                value: '',
              },
              {
                black: false,
                number: 3,
                parents: {across: 1, down: 3},
                value: '',
              },
              {
                black: false,
                number: 4,
                parents: {across: 1, down: 4},
                value: '',
              },
              {
                black: false,
                number: 5,
                parents: {across: 1, down: 5},
                value: '',
              },
            ],
            [
              {black: true, value: ''},
              {
                black: false,
                number: 6,
                parents: {across: 6, down: 2},
                value: '',
              },
              {black: false, parents: {across: 6, down: 3}, value: ''},
              {black: false, parents: {across: 6, down: 4}, value: ''},
              {black: false, parents: {across: 6, down: 5}, value: ''},
            ],
            [
              {
                black: false,
                number: 7,
                parents: {across: 7, down: 7},
                value: '',
              },
              {black: false, parents: {across: 7, down: 2}, value: ''},
              {black: false, parents: {across: 7, down: 3}, value: ''},
              {black: false, parents: {across: 7, down: 4}, value: ''},
              {black: false, parents: {across: 7, down: 5}, value: ''},
            ],
            [
              {
                black: false,
                number: 8,
                parents: {across: 8, down: 7},
                value: '',
              },
              {black: false, parents: {across: 8, down: 2}, value: ''},
              {black: false, parents: {across: 8, down: 3}, value: ''},
              {black: false, parents: {across: 8, down: 4}, value: ''},
              {black: true, value: ''},
            ],
            [
              {
                black: false,
                number: 9,
                parents: {across: 9, down: 7},
                value: '',
              },
              {black: false, parents: {across: 9, down: 2}, value: ''},
              {black: false, parents: {across: 9, down: 3}, value: ''},
              {black: false, parents: {across: 9, down: 4}, value: ''},
              {black: false, parents: {across: 9, down: 0}, value: ''},
            ],
          ],
          info: {author: 'Steven', title: 'Test Puzzle', type: 'Mini Puzzle'},
          name: '',
          pid: 2546,
          solution: [
            ['E', 'X', 'A', 'M', 'S'],
            ['.', 'R', 'I', 'E', 'T'],
            ['D', 'A', 'M', 'N', 'D'],
            ['E', 'Y', 'E', 'S', '.'],
            ['E', 'S', 'S', 'A', 'Y'],
          ],
        },
        version: '0.1',
      },
      timestamp: SERVER_TIME,
      type: 'create',
    };
    this.events.push(s);
  }
}
