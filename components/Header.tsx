import * as React from 'react';

interface HeaderProps {
    page: 'landing' | 'grwm' | 'playground';
    onNavigate: (target: 'grwm' | 'playground') => void;
    onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ page, onNavigate, onGoHome }) => {
    const NavLink: React.FC<{ target: 'grwm' | 'playground'; children: React.ReactNode }> = ({ target, children }) => (
        <button
            onClick={() => onNavigate(target)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === target ? 'bg-black/10 dark:bg-white/20 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}
        >
            {children}
        </button>
    );
    
  return (
    <header className="bg-white/60 dark:bg-black/40 backdrop-blur-lg sticky top-0 z-50 border-b border-black/10 dark:border-white/10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onGoHome} className="flex items-center space-x-3 text-left">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500 dark:text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM10 0a1 1 0 011 1v18a1 1 0 01-1.707.707l-6-6A1 1 0 013 13V7a1 1 0 01.293-.707l6-6A1 1 0 0110 0zm2 4a1 1 0 100-2 1 1 0 000 2zm-2 2a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100-2 1 1 0 000 2zm2 2a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Fashion Playground</span>
          </button>
          <div className="flex items-center space-x-2">
            {page !== 'landing' && (
                <>
                    <NavLink target="grwm">Get Ready With Me</NavLink>
                    <NavLink target="playground">Freestyle Playground</NavLink>
                </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;