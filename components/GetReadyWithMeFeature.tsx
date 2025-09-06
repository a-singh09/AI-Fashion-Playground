import * as React from 'react';

const ClothingIcon: React.FC<{ type: 'top' | 'bottom' | 'shoes' }> = ({ type }) => {
    const icons = {
        top: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
        bottom: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />,
        shoes: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    };
    
    // A more distinct icon set
    const distinctIcons = {
        top: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 14V5.5C16 3.567 14.433 2 12.5 2h-5C5.567 2 4 3.567 4 5.5V14M4 9h12" />,
        bottom: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 22V12m8 10V12M8 12L5 2h14l-3 10M8 12h8" />,
        shoes: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.5 18a2.5 2.5 0 01-1-4.825V10.5a1.5 1.5 0 013 0v2.675A2.5 2.5 0 013.5 18zm17 0a2.5 2.5 0 01-1-4.825V10.5a1.5 1.5 0 013 0v2.675A2.5 2.5 0 0120.5 18z" />
    }

    return (
        <svg className="h-8 w-8 text-pink-500 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {distinctIcons[type]}
        </svg>
    );
};


const GetReadyWithMeFeature: React.FC = () => {
    return (
        <section className="py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Column: Text Content */}
                <div className="animate-slide-in-up">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Your Personal AI Stylist, On-Demand.
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                        Ever feel like you have nothing to wear? Let our AI be your style confidante. Just tell it about your day, and it will curate the perfect outfit from your own wardrobe.
                    </p>
                    <ul className="space-y-4 text-gray-800 dark:text-gray-200">
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span><span className="font-semibold">Eliminate Decision Fatigue:</span> Get instant, personalized style recommendations.</span>
                        </li>
                        <li className="flex items-start">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span><span className="font-semibold">Rediscover Your Wardrobe:</span> Uncover new combinations you never thought of.</span>
                        </li>
                         <li className="flex items-start">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span><span className="font-semibold">Style for Any Occasion:</span> From work presentations to weekend brunches, dress with confidence.</span>
                        </li>
                    </ul>
                </div>
                
                {/* Right Column: UI Mockup */}
                <div className="animate-slide-in-up animation-delay-200">
                    <div className="glass-panel p-6 rounded-2xl shadow-2xl border border-pink-500/10 dark:border-violet-500/10">
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 block">What's the plan for today?</label>
                            <div className="form-input w-full p-4 rounded-lg text-gray-700 dark:text-gray-300">
                                Coffee date, something casual but chic.
                            </div>
                        </div>

                        <div className="text-center my-4">
                             <div className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-lg cursor-default">
                                ✨ Style Me!
                            </div>
                        </div>
                        
                        <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg animate-fade-in">
                             <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Okay, here's the vibe...</p>
                             <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-4">
                                "For a chic but relaxed coffee date, let's pair your favorite high-waisted jeans with the elegant silk blouse. It creates a beautiful silhouette. The white sneakers keep it comfy and cool. You'll look effortlessly stylish!"
                             </p>
                            <div className="flex justify-around items-center bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                                <div className="text-center">
                                    <ClothingIcon type="top" />
                                    <span className="text-xs mt-1 block text-gray-600 dark:text-gray-400">Silk Blouse</span>
                                </div>
                                <div className="text-2xl text-gray-400 dark:text-gray-500">+</div>
                                <div className="text-center">
                                    <ClothingIcon type="bottom" />
                                    <span className="text-xs mt-1 block text-gray-600 dark:text-gray-400">Jeans</span>
                                </div>
                               <div className="text-2xl text-gray-400 dark:text-gray-500">+</div>
                                <div className="text-center">
                                    <ClothingIcon type="shoes" />
                                    <span className="text-xs mt-1 block text-gray-600 dark:text-gray-400">Sneakers</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default GetReadyWithMeFeature;
