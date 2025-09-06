import * as React from 'react';
import LandingPage from './components/LandingPage';
import Playground from './components/Playground';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [appStarted, setAppStarted] = React.useState(false);

  const handleStart = () => {
    setAppStarted(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        {appStarted ? <Playground /> : <LandingPage onStart={handleStart} />}
      </main>
      <Footer />
    </div>
  );
};

export default App;