import * as React from 'react';
import HowItWorks from './HowItWorks';
import FAQ from './FAQ';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Try on your <span className="text-pink-500">REAL</span> wardrobe, remix your mood.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          Never wonder "what to wear" again. Get instant, personalized outfit suggestions from your own closet, styled by AI.
        </p>
        <button
          onClick={onStart}
          className="mt-8 px-8 py-3 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition-transform transform hover:scale-105 shadow-lg"
        >
          Get Styled by AI
        </button>
      </div>

      {/* Hero Image */}
      <div className="mt-12">
        <img
          src="https://picsum.photos/seed/fashion/1200/600"
          alt="Fashion collage"
          className="rounded-lg shadow-2xl mx-auto"
        />
      </div>

      <HowItWorks />
      <FAQ />
    </div>
  );
};

export default LandingPage;