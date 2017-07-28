// INLINE STYLING CONSTANTS & FUNCTIONS --- imported to Editor.js
import { Map } from 'immutable';
import { DefaultDraftBlockRenderMap } from 'draft-js'
// arrays for selectors in toolbar
const fonts = ["TimesNewRoman", "Courier", "Helvetica"];
const colors = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const sizes = ['10', '12', '14', '16', '20', '24', '36', '72'];
const paragraphs = ['none', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

// custom inline style map
const styleMap = {
    // highlight colors
  highlightred: { backgroundColor: '#FEA8AC'},
  highlightcyan: { backgroundColor: '#9DFFEC'},
  highlightgreen: { backgroundColor: '#C9FF9A'},
  highlightblue: { backgroundColor: '#9EDFFE'},
  highlightpurple: { backgroundColor: '#D8A5FE'},
  highlightyellow: { backgroundColor: "#FFFF70" },
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

// custom block render map
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
  },
  'h1': {
    element: 'h1'
  },
  'h2': {
    element: 'h2'
  },
  'h3': {
    element: 'h3'
  },
  'h4': {
    element: 'h4'
  },
  'h5': {
    element: 'h5'
  },
  'h6': {
    element: 'h6'
  },
  'none': {
    element: 'div'
  }
});

// custom block render map function
const blockRenderMapFn = function(contentBlock) {
  const type = contentBlock.getType();
  if (type === 'align-left') {
    return 'align-left';
  }
  if (type === 'align-center') {
    return 'align-center';
  }
  if (type === 'align-right') {
    return 'alignRight';
  }
  if (type === 'terminal') {
    return 'terminal';
  }
  if (type === 'code') {
    return 'code';
  }
  return null;
}

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);


module.exports = {
  blockRenderMapFn,
  extendedBlockRenderMap,
  styleMap,
  sizes,
  fonts,
  colors,
  paragraphs
}
