import { useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import Tooltip from './ToolTip';
import { ThemeContext } from '@/context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full"
    >
      {theme === 'light' ?
        <Tooltip tooltip="Dark Mode" position='bottom'>
          <Moon />
        </Tooltip>
        :
        <Tooltip tooltip="Light Mode" position='bottom'>
          <Sun />
        </Tooltip>
      }
    </button>
  );
};
