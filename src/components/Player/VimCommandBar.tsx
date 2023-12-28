import React from 'react';

interface VimCommandBarProps {
  isVimCommandMode: boolean;
  onEnter: (command: string) => void;
}

export const VimCommandBar: React.FC<VimCommandBarProps> = ({isVimCommandMode, onEnter}) => {
  const [command, setCommand] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleKeydown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      setCommand('');
      onEnter(command);
    }
  };

  React.useEffect(() => {
    if (isVimCommandMode) {
      inputRef.current?.focus();
    }
  }, [isVimCommandMode]);

  return (
    <div className="player--main--vim-bar">
      <input
        className="player--main--vim-bar--input"
        ref={inputRef}
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        disabled={!isVimCommandMode}
        onKeyDown={handleKeydown}
      />
    </div>
  );
};
