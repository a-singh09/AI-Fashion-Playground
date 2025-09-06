import * as React from 'react';
import type { ImageFile } from '../types';
import { MOOD_OPTIONS } from '../constants';
import ImageUploader from './ImageUploader';
import { generateStyledImage } from '../services/geminiService';
import Loader from './Loader';

const Playground: React.FC = () => {
    const [avatar, setAvatar] = React.useState<ImageFile | null>(null);
    const [wardrobe, setWardrobe] = React.useState<ImageFile[]>([]);
    const [selectedClothes, setSelectedClothes] = React.useState<ImageFile[]>([]);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [mood, setMood] = React.useState(MOOD_OPTIONS[0].value);
    const [styleSteering, setStyleSteering] = React.useState('');

    const handleAvatarUpload = (image: ImageFile) => {
        setAvatar(image);
    };

    const handleWardrobeUpload = (image: ImageFile) => {
        setWardrobe(prev => [...prev, image]);
    };

    const handleToggleClothSelection = (cloth: ImageFile) => {
        setSelectedClothes(prev => 
            prev.find(c => c.id === cloth.id)
                ? prev.filter(c => c.id !== cloth.id)
                : [...prev, cloth]
        );
    };
    
    const handleGenerate = React.useCallback(async () => {
        if (!avatar) {
            setError("Please upload an avatar image first.");
            return;
        }
        if (selectedClothes.length === 0) {
            setError("Please select at least one clothing item.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        const result = await generateStyledImage(avatar, selectedClothes, mood, styleSteering);
        
        if (result.error) {
            setError(result.error);
        } else {
            setGeneratedImage(result.image);
        }
        setIsLoading(false);
    }, [avatar, selectedClothes, mood, styleSteering]);


    return (
        <div className="container mx-auto px-4 py-8">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Uploads and Controls */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg space-y-6 h-fit">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">1. Your Avatar</h3>
                        <ImageUploader onImageUpload={handleAvatarUpload} buttonText="Upload Avatar" />
                        {avatar && <img src={avatar.src} alt="Avatar preview" className="mt-4 rounded-md h-40 w-auto mx-auto" />}
                    </div>
                    <hr />
                    <div>
                        <h3 className="text-xl font-semibold mb-2">2. Your Wardrobe</h3>
                        <ImageUploader onImageUpload={handleWardrobeUpload} buttonText="Add Clothing" />
                        {wardrobe.length > 0 && <p className="text-sm text-gray-500 mt-2">Click an item to add it to the outfit.</p>}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {wardrobe.map(cloth => (
                                <div key={cloth.id} className="relative cursor-pointer" onClick={() => handleToggleClothSelection(cloth)}>
                                    <img src={cloth.src} alt={cloth.name} className={`w-full h-24 object-cover rounded-md border-4 transition-colors ${selectedClothes.find(c => c.id === cloth.id) ? 'border-pink-500' : 'border-transparent hover:border-pink-200'}`} />
                                    {selectedClothes.find(c => c.id === cloth.id) && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <hr />
                     <div>
                        <h3 className="text-xl font-semibold mb-2">3. Set the Scene</h3>
                        <select value={mood} onChange={e => setMood(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            {MOOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold mb-2">4. Style Steering (Optional)</h3>
                        <input type="text" value={styleSteering} onChange={e => setStyleSteering(e.target.value)} placeholder="e.g., 'Make this casual', 'Add a jacket'" className="w-full p-2 border rounded-md"/>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading || !avatar || selectedClothes.length === 0} className="w-full py-3 bg-pink-500 text-white font-bold rounded-md hover:bg-pink-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? <Loader /> : 'Generate Style'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                {/* Right Panel: Result */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg flex items-center justify-center min-h-[600px]">
                    {isLoading ? (
                         <div className="text-center">
                             <Loader large />
                             <p className="mt-4 text-gray-600 animate-pulse">AI is working its magic... this may take a moment.</p>
                         </div>
                    ) : generatedImage ? (
                        <img src={generatedImage} alt="Generated outfit" className="max-w-full max-h-full object-contain rounded-md"/>
                    ) : (
                        <div className="text-center text-gray-500">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <h3 className="text-xl font-semibold">Your Style Awaits</h3>
                            <p className="mt-1">Upload your avatar and clothes, then click "Generate Style" to see your creation here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Playground;
