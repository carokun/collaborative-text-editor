// INLINE STYLING CONSTANTS

const fonts = ["TimesNewRoman", "Courier", "Helvetica"];
const colors = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const sizes = ['10', '12', '14', '16', '20', '24', '36', '72'];

const styleMap = {
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


const editorBoxStyle = {
  borderRadius: 4,
  borderWidth: 0.5,
  backgroundColor: '#E9F7FD',
  height: 200
};

module.exports = {
  editorBoxStyle,
  styleMap,
  sizes,
  fonts,
  colors
}
