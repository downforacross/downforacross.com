import _ from 'lodash';

export const MAIN_BLUE_3 = 0xdcefff;
export const GREENISH = 0x1fff3d;
export const PINKISH = 0xf0dbff;

export const THEME_COLORS = [MAIN_BLUE_3, GREENISH];

export const toHex = (number) => `#${(2 ** 24 + number).toString(16).substring(1)}`;

const num = ({r, g, b}) => b + 256 * (g + 256 * r);

const rgb = (num) => ({
  r: Math.floor(num / 256 / 256),
  g: Math.floor(num / 256) % 256,
  b: num % 256,
});

export const darken = (number) => {
  const rgbColor = rgb(number);
  const p = 0.95;
  const r = Math.floor(rgbColor.r * p);
  const g = Math.floor(rgbColor.g * p);
  const b = Math.floor(rgbColor.b * p);
  return num({r, g, b});
};

export const lightenHsl = (string) => {
  if (!_.startsWith(string, 'hsl(')) {
    return '';
  }
  return `hsla${string.substring(3, string.length - 1)},40%)`;
};
