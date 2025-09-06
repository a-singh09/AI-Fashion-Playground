import * as React from 'react';
import type { ImageFile } from '../types';
import { getAvatar, getWardrobe } from '../services/db';
import { selectOutfitFromWardrobe, generateStyledImage, refineImage } from '../services/geminiService';
import Loader from './Loader';

interface GetReadyWithMeProps {
    onNavigate: (target: 'playground') => void;
}

interface SuggestedOutfit {
    image: string;
    items: ImageFile[];
    reasoning: string;
}

const GlassPanel: React.FC<{ children: React.ReactNode; className?: string; sticky?: boolean } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', sticky=false, ...rest }) => (
    <div {...rest} className={`glass-panel rounded-2xl p-6 shadow-2xl ${sticky ? 'sticky top-24' : ''} ${className}`}>
        {children}
    </div>
);


const GetReadyWithMe: React.FC<GetReadyWithMeProps> = ({ onNavigate }) => {
    const [avatar, setAvatar] = React.useState<ImageFile | null>(null);
    const [wardrobe, setWardrobe] = React.useState<ImageFile[]>([]);
    const [event, setEvent] = React.useState('');
    const [styleNotes, setStyleNotes] = React.useState('');
    const [preferredItemIds, setPreferredItemIds] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isRefining, setIsRefining] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [suggestedOutfit, setSuggestedOutfit] = React.useState<SuggestedOutfit | null>(null);
    const [refineSteering, setRefineSteering] = React.useState('');
    
    React.useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [savedAvatar, savedWardrobe] = await Promise.all([getAvatar(), getWardrobe()]);
            if (savedAvatar) setAvatar(savedAvatar);
            if (savedWardrobe) setWardrobe(savedWardrobe);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleTogglePreferredItem = (id: string) => {
        setPreferredItemIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!avatar || wardrobe.length < 2 || !event) {
            setError("Please add an avatar, at least two clothing items, and let me know what we're getting ready for!");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuggestedOutfit(null);

        try {
            setLoadingMessage("Checking your closet...");
            const preferredItemNames = wardrobe.filter(item => preferredItemIds.includes(item.id)).map(item => item.name);
            const selectionResult = await selectOutfitFromWardrobe(event, wardrobe, styleNotes, preferredItemNames);

            if (selectionResult.error || selectionResult.selection.length === 0) {
                throw new Error(selectionResult.error || "I'm stumped! Try being a bit more specific about the event.");
            }

            const selectedItems = wardrobe.filter(item => selectionResult.selection.includes(item.name));
            if (selectedItems.length === 0) {
                 throw new Error("The stylist AI made a selection, but the items could not be found in your wardrobe.");
            }

            setLoadingMessage("Putting together the perfect look...");
            const imageResult = await generateStyledImage(avatar, selectedItems, event, selectionResult.reasoning);

            if (imageResult.error || imageResult.images.length === 0) {
                throw new Error(imageResult.error || "Oops! Something went wrong while creating the final image.");
            }
            
            setSuggestedOutfit({
                image: imageResult.images[0],
                items: selectedItems,
                reasoning: selectionResult.reasoning
            });

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleRefine = async () => {
        if (!suggestedOutfit || !refineSteering) {
            setError("Please provide an instruction to refine the image.");
            return;
        }
        
        setIsRefining(true);
        setError(null);

        const baseImage: ImageFile = {
            id: `refine-${Date.now()}`,
            name: 'generated-image-to-refine.png',
            src: suggestedOutfit.image,
        };
        
        const result = await refineImage(baseImage, refineSteering);

        if (result.error) {
            setError(result.error);
        } else if (result.images.length > 0) {
            setSuggestedOutfit(prev => prev ? { ...prev, image: result.images[0] } : null);
            setRefineSteering(''); // Clear input on success
        }
        
        setIsRefining(false);
    };
    
    const handleTryAgain = () => {
        setSuggestedOutfit(null);
        setError(null);
        setEvent('');
        setStyleNotes('');
        setPreferredItemIds([]);
        setRefineSteering('');
    }

    const isBusy = isLoading || isRefining;

    if (isLoading && !avatar) {
        return (
            <div className="container mx-auto px-4 py-8 text-center flex items-center justify-center min-h-[60vh]">
                <Loader large />
            </div>
        );
    }


    if (!avatar || wardrobe.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <GlassPanel className="max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Welcome to Get Ready With Me!</h2>
                    <p className="text-gray-800 dark:text-gray-300 mb-6">To get started, we need to build your digital wardrobe. Head to the Freestyle Playground to upload a photo of yourself and your clothes.</p>
                    <button onClick={() => onNavigate('playground')} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-full hover:from-pink-600 hover:to-violet-700 transition-all transform hover:scale-105 shadow-lg shadow-pink-500/20">
                        Go to Playground
                    </button>
                </GlassPanel>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Controls */}
                <div className="lg:col-span-1">
                    <GlassPanel sticky>
                        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Get Ready With Me</h2>
                        <div className="space-y-6">
                             <div>
                                 <label htmlFor="event" className="font-semibold block mb-2 text-gray-800 dark:text-gray-200">1. So, what are we getting ready for?</label>
                                 <textarea 
                                    id="event"
                                    value={event} 
                                    onChange={e => setEvent(e.target.value)} 
                                    placeholder="e.g., 'A first date at a cozy cafe' or 'A big presentation at work'"
                                    className="w-full p-3 form-input rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 h-28 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                    disabled={isBusy || !!suggestedOutfit}
                                />
                            </div>
                             <div>
                                 <label htmlFor="style-notes" className="font-semibold block mb-2 text-gray-800 dark:text-gray-200">
                                    2. Style Notes <span className="text-sm font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
                                 </label>
                                 <textarea 
                                    id="style-notes"
                                    value={styleNotes} 
                                    onChange={e => setStyleNotes(e.target.value)} 
                                    placeholder="e.g., 'I want to wear something blue', 'cozy knitwear vibe'"
                                    className="w-full p-3 form-input rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 h-24 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                    disabled={isBusy || !!suggestedOutfit}
                                />
                            </div>
                            <div>
                                <label className="font-semibold block mb-2 text-gray-800 dark:text-gray-200">3. Must-Haves <span className="text-sm font-normal text-gray-600 dark:text-gray-400">(Optional)</span></label>
                                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
                                    {wardrobe.map(item => (
                                        <div 
                                            key={item.id}
                                            onClick={() => !isBusy && !suggestedOutfit && handleTogglePreferredItem(item.id)}
                                            className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 border-2 ${preferredItemIds.includes(item.id) ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-transparent'} ${(isBusy || !!suggestedOutfit) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                                            title={item.name}
                                        >
                                            <img src={item.src} alt={item.name} className="w-full h-16 object-cover"/>
                                            {preferredItemIds.includes(item.id) && (
                                                <div className="absolute inset-0 bg-pink-500/50 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {suggestedOutfit ? (
                                <button onClick={handleTryAgain} className="w-full py-3 bg-gray-500 dark:bg-gray-600/80 text-white font-bold rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700/80 transition">
                                    Let's Try Another Vibe
                                </button>
                            ) : (
                                 <button onClick={handleGenerate} disabled={isBusy || !event} className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-pink-500/20">
                                    {isLoading ? <><Loader /> Styling...</> : 'Style Me!'}
                                 </button>
                            )}
                            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                    </GlassPanel>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <GlassPanel className="min-h-[600px] flex flex-col items-center justify-center">
                        {isLoading ? (
                            <div className="text-center">
                                <Loader large />
                                <p className="mt-4 text-gray-700 dark:text-gray-200 animate-pulse">{loadingMessage}</p>
                            </div>
                        ) : suggestedOutfit ? (
                            <div className="w-full animate-fade-in">
                                <h3 className="text-xl font-semibold text-center mb-4 text-black dark:text-white">Here's the vibe we're going for!</h3>
                                <div className="relative">
                                    <img src={suggestedOutfit.image} alt="AI generated outfit" className="rounded-lg shadow-lg mx-auto max-h-[400px] sm:max-h-[500px]"/>
                                    {isRefining && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                                            <Loader large />
                                            <p className="mt-4 text-white animate-pulse">Refining your look...</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-black/10 dark:border-white/10">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Why this works:</h4>
                                    <p className="text-gray-800 dark:text-gray-300 italic">"{suggestedOutfit.reasoning}"</p>
                                </div>
                                 <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">The Outfit:</h4>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {suggestedOutfit.items.map(item => (
                                            <div key={item.id}>
                                                <img src={item.src} alt={item.name} title={item.name} className="w-20 h-20 object-cover rounded-md border border-black/10 dark:border-white/10"/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <hr className="my-6 border-black/10 dark:border-white/10"/>
                                <div>
                                    <label htmlFor="refine-steering" className="font-semibold block mb-2 text-gray-800 dark:text-gray-200">Refine Your Look</label>
                                    <div className="flex gap-3">
                                        <input 
                                            id="refine-steering"
                                            type="text" 
                                            value={refineSteering} 
                                            onChange={e => setRefineSteering(e.target.value)} 
                                            placeholder="e.g., 'change background to a park'" 
                                            className="w-full p-3 form-input rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                                            disabled={isBusy}
                                        />
                                        <button onClick={handleRefine} disabled={isBusy || !refineSteering} className="py-3 px-5 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                            {isRefining ? <Loader/> : 'Refine'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                           <div className="text-center text-gray-800 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-gray-400 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125a4 4 0 11-6.44-6.44m12.72.125a4 4 0 115.292 0m-5.292 0a4 4 0 105.292 0M12 4.354a4 4 0 100 5.292m0-5.292a4 4 0 100 5.292" /></svg>
                               <h3 className="text-xl font-semibold mt-4 text-gray-900 dark:text-gray-200">Tell me what you're up to...</h3>
                               <p>...and I'll find the perfect outfit from your wardrobe!</p>
                           </div>
                        )}
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default GetReadyWithMe;