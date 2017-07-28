import { getDefaultKeyBinding, KeyBindingUtil } from 'draft-js';
const { hasCommandModifier } = KeyBindingUtil;

function myKeyBindingFn(e: SyntheticKeyboardEvent): string {
  if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    return 'myeditor-save';
  } else if (e.keyCode === 66 /* `B` key */ && hasCommandModifier(e)) {
    return 'myeditor-bold';
  } else if (e.keyCode === 73 /* `I` key */ && hasCommandModifier(e)) {
    return 'myeditor-italic'
  } else if (e.keyCode === 85 /* `U` key */ && hasCommandModifier(e)) {
    return 'myeditor-underline'
  } else if (e.keyCode === 84 /* `T` key */ && hasCommandModifier(e)) {
    return 'myeditor-terminal'
  }
  return getDefaultKeyBinding(e);
}

module.exports = { myKeyBindingFn }
