import * as React from 'react';
import type { ImageFile } from '../types';
import { getAvatar, getWardrobe } from '../services/db';
import { selectOutfitFromWardrobe, generateStyledImage } from '../services/geminiService';
import Loader from './Loader';

interface AiStylistProps {
    onNavigate: (target: 'playground') => void;
}

interface SuggestedOutfit {
    image: string;
    items: ImageFile[];
    reasoning: string;
}

const AiStylist: React.FC<AiStylistProps> = ({ onNavigate }) => {
    const [avatar, setAvatar] = React.useState<ImageFile | null>(null);
    const [wardrobe, setWardrobe] = React.useState<ImageFile[]>([]);
    const [mood, setMood] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [suggestedOutfit, setSuggestedOutfit] = React.useState<SuggestedOutfit | null>(null);
    
    React.useEffect(() => {
        const loadData = async () => {
            const [savedAvatar, savedWardrobe] = await Promise.all([getAvatar(), getWardrobe()]);
            if (savedAvatar) setAvatar(savedAvatar);
            if (savedWardrobe) setWardrobe(savedWardrobe);
        };
        loadData();
    }, []);

    const handleGenerate = async () => {
        if (!avatar || wardrobe.length < 2 || !mood) {
            setError("Please add an avatar, at least two clothing items, and describe your mood or occasion.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuggestedOutfit(null);

        try {
            // Step 1: Select outfit from wardrobe
            setLoadingMessage("Consulting with the AI stylist...");
            const selectionResult = await selectOutfitFromWardrobe(mood, wardrobe);

            if (selectionResult.error || selectionResult.selection.length === 0) {
                throw new Error(selectionResult.error || "The AI stylist couldn't decide on an outfit. Try being more specific!");
            }

            const selectedItems = wardrobe.filter(item => selectionResult.selection.includes(item.name));
            if (selectedItems.length === 0) {
                 throw new Error("The AI stylist made a selection, but the items could not be found in your wardrobe.");
            }

            // Step 2: Generate the image with the selected outfit
            setLoadingMessage("Creating your look...");
            const imageResult = await generateStyledImage(avatar, selectedItems, mood, selectionResult.reasoning);

            if (imageResult.error || imageResult.images.length === 0) {
                throw new Error(imageResult.error || "Failed to generate the final image.");
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
    
    const handleTryAgain = () => {
        setSuggestedOutfit(null);
        setError(null);
        setMood('');
    }

    if (!avatar || wardrobe.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to the AI Stylist!</h2>
                    <p className="text-gray-600 mb-6">To get started, you need to build your digital wardrobe. Please go to the Freestyle Playground to upload a photo of yourself and your clothes.</p>
                    <button onClick={() => onNavigate('playground')} className="px-6 py-2 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition">
                        Go to Playground
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6 sticky top-28">
                        <h2 className="text-2xl font-bold text-gray-800">AI Stylist</h2>
                        <div>
                             <label htmlFor="mood" className="font-semibold block mb-2 text-gray-700">What's the occasion or mood?</label>
                             <textarea 
                                id="mood"
                                value={mood} 
                                onChange={e => setMood(e.target.value)} 
                                placeholder="e.g., 'A casual brunch with friends' or 'An important business meeting'" 
                                className="w-full p-2 border rounded-md h-24"
                                disabled={isLoading || !!suggestedOutfit}
                            />
                        </div>
                        {suggestedOutfit ? (
                            <button onClick={handleTryAgain} className="w-full py-3 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 transition">
                                Suggest Another Outfit
                            </button>
                        ) : (
                             <button onClick={handleGenerate} disabled={isLoading || !mood} className="w-full py-3 bg-pink-500 text-white font-bold rounded-md hover:bg-pink-600 transition disabled:bg-pink-300 flex items-center justify-center">
                                {isLoading ? <><Loader /> Generating...</> : 'Get Outfit Suggestion'}
                            </button>
                        )}
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-lg min-h-[600px] flex flex-col items-center justify-center">
                        {isLoading ? (
                            <div className="text-center">
                                <Loader large />
                                <p className="mt-4 text-gray-600 animate-pulse">{loadingMessage}</p>
                            </div>
                        ) : suggestedOutfit ? (
                            <div className="w-full">
                                <h3 className="text-xl font-semibold text-center mb-4 text-gray-800">Here's Your Styled Look!</h3>
                                <img src={suggestedOutfit.image} alt="AI generated outfit" className="rounded-lg shadow-md mx-auto max-h-[500px]"/>
                                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-700">Stylist's Note:</h4>
                                    <p className="text-gray-600 italic">"{suggestedOutfit.reasoning}"</p>
                                </div>
                                 <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">What you're wearing:</h4>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {suggestedOutfit.items.map(item => (
                                            <div key={item.id}>
                                                <img src={item.src} alt={item.name} title={item.name} className="w-20 h-20 object-cover rounded-md border"/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                           <div className="text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125a4 4 0 11-6.44-6.44m12.72.125a4 4 0 115.292 0m-5.292 0a4 4 0 105.292 0M12 4.354a4 4 0 100 5.292m0-5.292a4 4 0 100 5.292" /></svg>
                               <h3 className="text-xl font-semibold mt-4">Your next great outfit awaits.</h3>
                               <p>Describe the occasion above to get a style suggestion.</p>
                           </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiStylist;
