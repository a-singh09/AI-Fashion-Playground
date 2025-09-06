import * as React from 'react';
import LandingPage from './components/LandingPage';
import Playground from './components/Playground';
import Header from './components/Header';
import Footer from './components/Footer';
import AiStylist from './components/AiStylist';

const App: React.FC = () => {
  const [page, setPage] = React.useState<'landing' | 'stylist' | 'playground'>('landing');

  const handleStart = () => {
    setPage('stylist');
  };

  const navigate = (targetPage: 'stylist' | 'playground') => {
    setPage(targetPage);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header page={page} onNavigate={navigate} />
      <main className="flex-grow">
        {page === 'landing' && <LandingPage onStart={handleStart} />}
        {page === 'stylist' && <AiStylist onNavigate={navigate} />}
        {page === 'playground' && <Playground />}
      </main>
      <Footer />
    </div>
  );
};

export default App;