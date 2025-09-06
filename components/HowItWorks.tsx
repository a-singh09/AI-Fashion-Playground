import * as React from 'react';

const Step: React.FC<{ icon: JSX.Element; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 glass-panel rounded-2xl shadow-lg h-full">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white mb-6 shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-700 dark:text-gray-300">{description}</p>
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Your Style, Solved in 3 Easy Steps</h2>
      <p className="max-w-2xl mx-auto text-center text-lg text-gray-600 dark:text-gray-400 mb-16">We combine your photos with powerful AI to give you a hyper-realistic virtual try-on experience.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Step
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          title="1. Upload Your Photos"
          description="Add a photo of yourself and pictures of your favorite clothes from your wardrobe or any online store."
        />
        <Step
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 003 0m-3 0h.01M12 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 003 0m-3 0h.01M17 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 003 0m-3 0h.01" /></svg>}
          title="2. Mix & Match"
          description="Use our intuitive studio to place clothing items on your avatar and create the perfect look."
        />
        <Step
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l5.707 5.707a1 1 0 010 1.414L13 21m-5-16l2.293 2.293a1 1 0 000 1.414L6 12l5.707 5.707a1 1 0 000 1.414L9 21" /></svg>}
          title="3. Generate & Share"
          description="Let our AI create a photorealistic image of you in your new outfit. Refine it with text prompts and share with friends!"
        />
      </div>
    </section>
  );
};

export default HowItWorks;