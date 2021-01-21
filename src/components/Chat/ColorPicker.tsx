import React, {useState} from 'react';
import {useToggle} from 'react-use';
import {CirclePicker} from 'react-color';
import {makeStyles} from '@material-ui/core';
interface ColorPickerProps {
  color: string;
  onUpdateColor: (color: string) => void;
}
const useStyles = makeStyles<any, ColorPickerProps>({
  clickableDot: {
    color: (props) => props.color,
    cursor: 'pointer',
  },
});
const ColorPicker: React.FC<ColorPickerProps> = (props) => {
  const classes = useStyles(props);
  const [isActive, toggleIsActive] = useToggle(false);
  return (
    <>
      <span onClick={toggleIsActive} className={classes.clickableDot}>
        {' '}
        {'\u25CF '}
      </span>
      {isActive ? (
        <>
          <CirclePicker
            color={props.color}
            onChangeComplete={(color) => {
              let colorHSL = `hsl(${Math.floor(color.hsl.h)},${Math.floor(color.hsl.s * 100)}%,${Math.floor(
                color.hsl.l * 100
              )}%)`;
              if (colorHSL !== props.color) {
                props.onUpdateColor(colorHSL);
              }
              toggleIsActive(false);
            }}
          ></CirclePicker>
          <br />
        </>
      ) : null}
    </>
  );
};
export default ColorPicker;
