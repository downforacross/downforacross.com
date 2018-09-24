import React from 'react';
import EmojiPicker from '../components/EmojiPicker';
import Flex from 'react-flexview';
import * as emojiLib from '../lib/emoji';

export default () => {
  const pattern = 'par';
  const matches = emojiLib.findMatches(pattern);
  // ['heart', 'hearts', 'wheel_of_dharma'];
  return (
    <Flex column style={{padding: 40}}>
      <div style={{height: 400, position: 'relative'}}>
        Blah blah
        <br />
        Text
        <br />
        Text
        <br />
        Text
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 'auto',
          }}
        >
          <EmojiPicker
            pattern={pattern}
            matches={matches}
            onConfirm={(emoji) => {
              console.log('confirmed', emoji);
            }}
            onEscape={() => {
              console.log('escaped');
            }}
          />
        </div>
      </div>
      <div style={{border: '1px solid black'}}>Chat bar lalalal</div>
    </Flex>
  );
};
