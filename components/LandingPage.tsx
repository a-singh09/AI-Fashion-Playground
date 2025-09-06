import * as React from 'react';
import HowItWorks from './HowItWorks';
import FAQ from './FAQ';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600 leading-tight">
          Try on your REAL wardrobe, remix your mood.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-700 dark:text-gray-300">
          Never wonder "what to wear" again. Get instant, personalized outfit suggestions from your own closet, styled by AI.
        </p>
        <button
          onClick={onStart}
          className="mt-10 px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-full hover:from-pink-600 hover:to-violet-700 transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 dark:shadow-pink-500/20"
        >
          Get Styled by AI
        </button>
      </div>

      {/* Hero Image */}
      <div className="mt-16">
        <div className="relative p-1 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 shadow-2xl shadow-violet-500/40 dark:shadow-violet-500/30">
          <img
            src="https://picsum.photos/seed/fashion/1200/600"
            alt="Fashion collage"
            className="rounded-xl mx-auto"
          />
        </div>
      </div>

      <HowItWorks />
      <FAQ />
    </div>
  );
};

export default LandingPage;