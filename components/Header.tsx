import * as React from 'react';

const Header: React.FC = () => {
    const Logo = () => (
        <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM10 0a1 1 0 011 1v18a1 1 0 01-1.707.707l-6-6A1 1 0 013 13V7a1 1 0 01.293-.707l6-6A1 1 0 0110 0zm2 4a1 1 0 100-2 1 1 0 000 2zm-2 2a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100-2 1 1 0 000 2zm2 2a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="text-2xl font-bold text-gray-800">AI Fashion Playground</span>
        </div>
    );
    
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
        </div>
      </nav>
    </header>
  );
};

export default Header;