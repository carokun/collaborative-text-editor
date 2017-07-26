// INLINE STYLING CONSTANTS
import { Map } from 'immutable';
const fonts = ["TimesNewRoman", "Courier", "Helvetica"];
const colors = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const sizes = ['10', '12', '14', '16', '20', '24', '36', '72'];

const styleMap = {
  highlight: { backgroundColor: "yellow" },

    // custom
  // terminal: { backgroundColor: "black", color: "#08D50E", padding: 5, 'font-family': 'Courier' },
    // fonts
  TimesNewRoman: { fontFamily: "Times New Roman" },
  Courier: { fontFamily: "Courier New" },
  Helvetica: { fontFamily: "Helvetica" },
    // colors
  black: { color: 'black' },
  red: { color: 'rgba(255, 0, 0, 1.0)' },
  orange: { color: 'rgba(255, 127, 0, 1.0)' },
  yellow: { color: 'rgba(180, 180, 0, 1.0)' },
  green: { color: 'rgba(0, 180, 0, 1.0)' },
  blue: { color: 'rgba(0, 0, 255, 1.0)' },
  indigo: { color: 'rgba(75, 0, 130, 1.0)' },
  violet: { color: 'rgba(127, 0, 255, 1.0)' },
    // sizes
  10: { fontSize: 8 },
  12: { fontSize: 12 },
  14: { fontSize: 14 },
  16: { fontSize: 16 },
  20: { fontSize: 20 },
  24: { fontSize: 24 },
  36: { fontSize: 36 },
  72: { fontSize: 72 },
}

const blockRenderMap = Map({
  'align-left': {
    element: 'div'
  },
  'align-center': {
    element: 'div'
  },
  'align-right': {
    element: 'div'
  },
  'terminal': {
    element: 'div'
  },
  'code': {
    element: 'div'
  }
});

module.exports = {
  blockRenderMap,
  styleMap,
  sizes,
  fonts,
  colors
}
