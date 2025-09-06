import * as React from 'react';
import LandingPage from './components/LandingPage';
import Playground from './components/Playground';
import Header from './components/Header';
import Footer from './components/Footer';
import GetReadyWithMe from './components/AiStylist'; // This file is now GetReadyWithMe
import { useTheme } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [page, setPage] = React.useState<'landing' | 'grwm' | 'playground'>('landing');
  const { theme } = useTheme();

  const handleStart = () => {
    setPage('grwm');
  };

  const navigate = (targetPage: 'grwm' | 'playground') => {
    setPage(targetPage);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme}`}>
      <Header page={page} onNavigate={navigate} />
      <main className="flex-grow">
        {page === 'landing' && <LandingPage onStart={handleStart} />}
        {page === 'grwm' && <GetReadyWithMe onNavigate={navigate} />}
        {page === 'playground' && <Playground />}
      </main>
      <Footer />
    </div>
  );
};

export default App;