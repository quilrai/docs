import React from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import {Monitor, Sun, Moon} from 'lucide-react';

export default function SidebarThemeToggle() {
  const {colorModeChoice, setColorMode} = useColorMode();

  return (
    <div
      className="sidebar-theme-toggle"
      role="group"
      aria-label="Color mode">
      <button
        type="button"
        className="sidebar-theme-toggle__btn"
        onClick={() => setColorMode(null)}
        aria-pressed={colorModeChoice === null}
        title="System">
        <Monitor size={14} aria-hidden />
      </button>
      <button
        type="button"
        className="sidebar-theme-toggle__btn"
        onClick={() => setColorMode('light')}
        aria-pressed={colorModeChoice === 'light'}
        title="Light">
        <Sun size={14} aria-hidden />
      </button>
      <button
        type="button"
        className="sidebar-theme-toggle__btn"
        onClick={() => setColorMode('dark')}
        aria-pressed={colorModeChoice === 'dark'}
        title="Dark">
        <Moon size={14} aria-hidden />
      </button>
    </div>
  );
}
