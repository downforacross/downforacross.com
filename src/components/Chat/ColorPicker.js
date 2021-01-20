import React, {useState} from 'react';
import {CirclePicker} from 'react-color';

export default function ColorPicker(props) {
  const [isActive, setActive] = useState(false);

  return (
    <>
      <span className="dot" onClick={() => setActive(!isActive)} style={{color: props.color}}>
        {' '}
        {'\u25CF '}
      </span>
      {isActive ? (
        <>
          <CirclePicker
            color={props.color}
            triangle="hide"
            onChangeComplete={(color) => {
              let colorHSL = `hsl(${Math.floor(color.hsl.h)},${Math.floor(color.hsl.s * 100)}%,${Math.floor(
                color.hsl.l * 100
              )}%)`;
              if (colorHSL != props.color) {
                props.onUpdateColor(colorHSL);
              }
              setActive(false);
            }}
          ></CirclePicker>
          <br />
        </>
      ) : null}
    </>
  );
}
