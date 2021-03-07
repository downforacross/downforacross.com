import React, {useState} from 'react';
import ReactConfetti from 'react-confetti';
import {useMount} from 'react-use';

const Confetti: React.FC<{
  duration?: number;
}> = (props) => {
  const [spawning, setSpawning] = useState(false);
  const [visible, setVisible] = useState(true);
  useMount(() => {
    setTimeout(() => {
      setSpawning(false);
    }, props.duration || 7000);
  });

  if (!visible) return null;
  return (
    <ReactConfetti
      numberOfPieces={spawning ? 200 : 0}
      onConfettiComplete={() => {
        setVisible(false);
      }}
    />
  );
};
export default Confetti;
