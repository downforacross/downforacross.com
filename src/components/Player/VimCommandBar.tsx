import React from 'react';

interface VimCommandBarProps {
  isVimCommandMode: boolean;
  isVimInsertMode: boolean;
  onVimCommand: () => void;
  onEnter: (command: string) => void;
  onEscape: () => void;
}

export const VimCommandBar: React.FC<VimCommandBarProps> = ({
  isVimCommandMode,
  isVimInsertMode,
  onVimCommand,
  onEnter,
  onEscape,
}) => {
  const [command, setCommand] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleKeydown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      setCommand('');
      onEnter(command);
    } else if (e.key === 'Escape') {
      setCommand('');
      onEscape();
    }
  };

  const handleBlur: React.FocusEventHandler<HTMLElement> = (e) => {
    setCommand('');
    isVimCommandMode && onVimCommand();
  };

  React.useEffect(() => {
    if (isVimCommandMode) {
      inputRef.current?.focus();
    }
  }, [isVimCommandMode]);

  return (
    <div className="player--main--vim-bar">
      {isVimInsertMode && <>-- INSERT --</>}
      {isVimCommandMode && (
        <input
          className="player--main--vim-bar--input"
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onBlur={handleBlur}
          disabled={!isVimCommandMode}
          onKeyDown={handleKeydown}
        />
      )}
    </div>
  );
};
