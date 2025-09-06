import * as React from 'react';
import HowItWorks from './HowItWorks';
import FAQ from './FAQ';
import GetReadyWithMeFeature from './GetReadyWithMeFeature';

interface LandingPageProps {
  onStart: () => void;
}

const ProblemCard: React.FC<{ icon: JSX.Element; title: string; description: string; delay: string }> = ({ icon, title, description, delay }) => (
    <div className={`glass-panel p-8 rounded-2xl shadow-lg text-center flex flex-col items-center animate-slide-in-up ${delay}`}>
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-pink-500/80 to-violet-600/80 text-white mb-6 shadow-lg">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <>
      {/* Hero Section */}
      <div className="h-screen flex flex-col justify-center items-center text-center px-4 relative">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600 leading-none">
                <span className="block">Your Closet.</span>
                <span className="block">Reimagined.</span>
            </h1>
            <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 animate-text-reveal animation-delay-600">
                Stop guessing. Start visualizing. See how your actual clothes look on you for any occasion, styled in seconds by your personal AI stylist.
            </p>
            <div className="animate-text-reveal animation-delay-600">
                <button
                    onClick={onStart}
                    className="mt-10 px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-full hover:from-pink-600 hover:to-violet-700 transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 dark:shadow-pink-500/20"
                >
                    Become Your Own Stylist
                </button>
            </div>
        </div>
         {/* Scroll Down Indicator */}
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
         {/* Problem Section */}
         <section className="text-center py-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">The Wardrobe Dilemma is Real.</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-16">We've all been there. Staring at a mountain of clothes, feeling like you have nothing to wear.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ProblemCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4l.87 2M15.13 4l-.87 2M8 20l.87-2M15.13 20l-.87-2M5.99 9.99h.01M17.99 9.99h.01M5.99 14.01h.01M17.99 14.01h.01" /></svg>}
                    title="The Full Closet Paradox"
                    description="Your wardrobe is overflowing, yet the perfect outfit for that dinner party remains a myth. Sound familiar?"
                    delay="animation-delay-200"
                />
                <ProblemCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    title="Online Shopping Roulette"
                    description="How will that dress from your cart *actually* look on you? Stop the guesswork and see for yourself before you buy."
                    delay="animation-delay-400"
                />
                <ProblemCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Occasion Anxiety"
                    description="Is this outfit right for the event? Get AI-powered suggestions tailored to your mood, the venue, and your unique style."
                    delay="animation-delay-600"
                />
            </div>
        </section>

        <GetReadyWithMeFeature />
        <HowItWorks />
        <FAQ />
      </div>
    </>
  );
};

export default LandingPage;