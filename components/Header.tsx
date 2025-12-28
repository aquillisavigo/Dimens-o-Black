import React from 'react';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onProfileClick: () => void;
  userName: string;
  userId: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isDarkMode, onToggleTheme, onProfileClick, userName, userId }) => {
  return (
    <header className="h-20 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark flex items-center justify-between px-8 flex-shrink-0 transition-colors duration-300 relative">
      <button
        className="md:hidden text-gray-500 dark:text-gray-400 hover:text-primary p-2 -ml-2 transition-colors"
        onClick={onMenuClick}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Espaço central vazio após remoção da busca */}
      <div className="flex-1"></div>

      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Theme Toggle Button - Estilo Premium Pill */}
        <div
          onClick={onToggleTheme}
          className="cursor-pointer relative flex items-center w-16 h-8 bg-gray-100 dark:bg-surface-dark-2 rounded-full border border-border-light dark:border-border-dark p-1 transition-all duration-300 hover:border-primary/40 group"
          title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        >
          {/* Background Glow Effect */}
          <div className={`absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-md`}></div>

          {/* Sliding Indicator */}
          <div className={`
            absolute w-6 h-6 rounded-full bg-white dark:bg-primary shadow-lg flex items-center justify-center transition-all duration-500 transform
            ${isDarkMode ? 'translate-x-8' : 'translate-x-0'}
          `}>
            <span className="material-symbols-outlined text-[16px] text-primary dark:text-white transition-transform duration-500 group-hover:scale-110">
              {isDarkMode ? 'dark_mode' : 'light_mode'}
            </span>
          </div>

          {/* Background Icons */}
          <div className="w-full flex justify-between px-1.5 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
            <span className="material-symbols-outlined text-sm">light_mode</span>
            <span className="material-symbols-outlined text-sm">dark_mode</span>
          </div>
        </div>

        <div className="flex items-center border-r border-border-light dark:border-border-dark pr-4 md:pr-6 h-10 gap-4">
          <NotificationCenter userId={userId} />
        </div>

        <div onClick={onProfileClick} className="flex items-center gap-3 cursor-pointer group pl-2">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{userName}</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="h-10 w-10 rounded-full border border-border-light dark:border-border-dark bg-gray-100 dark:bg-surface-dark-2 flex items-center justify-center relative z-10 transition-all duration-300 group-hover:border-primary">
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 group-hover:text-primary">person</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background-dark rounded-full z-20"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
