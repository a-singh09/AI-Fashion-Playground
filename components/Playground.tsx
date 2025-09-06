import * as React from 'react';
import type { ImageFile } from '../types';
import { MOOD_OPTIONS } from '../constants';
import ImageUploader from './ImageUploader';
import { generateStyledImage, refineImage } from '../services/geminiService';
import Loader from './Loader';

// --- Sub-component: WardrobePanel ---
interface WardrobePanelProps {
    avatar: ImageFile | null;
    wardrobe: ImageFile[];
    onWardrobeUpload: (images: ImageFile[]) => void;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, cloth: ImageFile) => void;
}

const WardrobePanel: React.FC<WardrobePanelProps> = ({ avatar, wardrobe, onWardrobeUpload, handleDragStart }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 h-fit sticky top-28">
        <h3 className="text-xl font-semibold text-gray-800">Your Wardrobe</h3>
        <ImageUploader onImagesUpload={onWardrobeUpload} buttonText="Add Clothing (Multiple)" multiple={true} />
         {wardrobe.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                {wardrobe.map(cloth => (
                    <div 
                        key={cloth.id} 
                        draggable={!!avatar}
                        onDragStart={(e) => handleDragStart(e, cloth)}
                        className={`cursor-grab active:cursor-grabbing rounded-md overflow-hidden transition-shadow shadow-sm hover:shadow-md ${!avatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={avatar ? cloth.name : 'Upload an avatar to start styling'}
                        >
                        <img src={cloth.src} alt={cloth.name} className="w-full h-24 object-cover" />
                    </div>
                ))}
            </div>
        ) : (
             <p className="text-sm text-gray-500 mt-2">Upload some clothes to get started.</p>
        )}
    </div>
);

// --- Sub-component: CanvasPanel ---
interface CanvasPanelProps {
    avatar: ImageFile | null;
    currentOutfit: ImageFile[];
    generatedImages: string[];
    currentImageIndex: number;
    isLoading: boolean;
    isDraggingOver: boolean;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    setIsDraggingOver: React.Dispatch<React.SetStateAction<boolean>>;
    handleRemoveFromOutfit: (clothId: string) => void;
    onAvatarUpload: (images: ImageFile[]) => void;
    setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

const CanvasPanel: React.FC<CanvasPanelProps> = ({
    avatar,
    currentOutfit,
    generatedImages,
    currentImageIndex,
    isLoading,
    isDraggingOver,
    handleDrop,
    setIsDraggingOver,
    handleRemoveFromOutfit,
    onAvatarUpload,
    setCurrentImageIndex
}) => (
     <div className="lg:col-span-2 space-y-4">
        <div 
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            className={`relative bg-white p-6 rounded-lg shadow-lg flex items-center justify-center min-h-[600px] transition-all duration-300 ${isDraggingOver ? 'ring-4 ring-pink-400 ring-offset-2' : 'ring-2 ring-transparent'}`}>
        
            {!avatar ? (
                <div className="text-center text-gray-500">
                   <h3 className="text-xl font-semibold mb-4">Start by Uploading Your Avatar</h3>
                   <ImageUploader onImagesUpload={onAvatarUpload} buttonText="Upload Avatar" />
                </div>
            ) : isLoading ? (
                <div className="text-center">
                    <Loader large />
                    <p className="mt-4 text-gray-600 animate-pulse">Styling your new look...</p>
                </div>
            ) : (
                <div className="relative w-full h-full flex items-center justify-center group">
                    <img 
                        src={generatedImages.length > 0 ? generatedImages[currentImageIndex] : avatar.src} 
                        alt="Your Style" 
                        className="max-w-full max-h-full object-contain rounded-md"
                    />
                    {generatedImages.length > 1 && (
                        <>
                            <button onClick={() => setCurrentImageIndex(p => (p === 0 ? generatedImages.length - 1 : p - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                &#10094;
                            </button>
                            <button onClick={() => setCurrentImageIndex(p => (p === generatedImages.length - 1 ? 0 : p + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                &#10095;
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                {currentImageIndex + 1} / {generatedImages.length}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
        {currentOutfit.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h4 className="text-lg font-semibold mb-3">Current Outfit</h4>
                <div className="flex items-center gap-3 flex-wrap">
                    {currentOutfit.map(cloth => (
                         <div key={cloth.id} className="relative group">
                            <img src={cloth.src} alt={cloth.name} className="w-16 h-16 object-cover rounded-md"/>
                            <button onClick={() => handleRemoveFromOutfit(cloth.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                         </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);


// --- Sub-component: StudioControls ---
interface StudioControlsProps {
    avatar: ImageFile | null;
    mood: string;
    setMood: React.Dispatch<React.SetStateAction<string>>;
    styleSteering: string;
    setStyleSteering: React.Dispatch<React.SetStateAction<string>>;
    refineSteering: string;
    setRefineSteering: React.Dispatch<React.SetStateAction<string>>;
    handleGenerate: () => void;
    handleRefine: () => void;
    handleStartOver: () => void;
    isLoading: boolean;
    generatedImages: string[];
    currentOutfit: ImageFile[];
    error: string | null;
}

const StudioControls: React.FC<StudioControlsProps> = ({
    avatar,
    mood,
    setMood,
    styleSteering,
    setStyleSteering,
    refineSteering,
    setRefineSteering,
    handleGenerate,
    handleRefine,
    handleStartOver,
    isLoading,
    generatedImages,
    currentOutfit,
    error
}) => (
     <div className="bg-white p-6 rounded-lg shadow-lg space-y-6 h-fit sticky top-28">
        <h3 className="text-xl font-semibold text-gray-800">Studio Controls</h3>
        <div>
            <label className="font-semibold block mb-2">1. Set the Scene</label>
            <select value={mood} onChange={e => setMood(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50" disabled={!avatar}>
                {MOOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
        <div>
            <label className="font-semibold block mb-2">2. Initial Steering <span className="text-sm font-normal text-gray-500">(Optional)</span></label>
            <input type="text" value={styleSteering} onChange={e => setStyleSteering(e.target.value)} placeholder="e.g., 'Make this casual'" className="w-full p-2 border rounded-md" disabled={!avatar}/>
        </div>
         <button onClick={handleGenerate} disabled={!avatar || currentOutfit.length === 0 || isLoading} className="w-full py-2 bg-pink-500 text-white font-bold rounded-md hover:bg-pink-600 transition disabled:bg-pink-300 disabled:cursor-not-allowed flex items-center justify-center">
            {isLoading && !generatedImages.length ? <><Loader/> Generating...</> : 'Generate Style'}
        </button>
         <hr/>
         <div>
            <label className="font-semibold block mb-2">3. Refine Result</label>
            <div className="flex gap-2">
                 <input type="text" value={refineSteering} onChange={e => setRefineSteering(e.target.value)} placeholder="e.g., 'change the background'" className="w-full p-2 border rounded-md" disabled={generatedImages.length === 0 || isLoading}/>
                 <button onClick={handleRefine} disabled={generatedImages.length === 0 || !refineSteering || isLoading} className="py-2 px-4 bg-indigo-500 text-white font-bold rounded-md hover:bg-indigo-600 transition disabled:bg-indigo-300 disabled:cursor-not-allowed">
                    Refine
                </button>
            </div>
        </div>
         <button onClick={handleStartOver} disabled={!avatar || (currentOutfit.length === 0 && generatedImages.length === 0)} className="w-full py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
            Start Over
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
);


// --- Main Component: Playground ---
const Playground: React.FC = () => {
    const [avatar, setAvatar] = React.useState<ImageFile | null>(null);
    const [wardrobe, setWardrobe] = React.useState<ImageFile[]>([]);
    const [currentOutfit, setCurrentOutfit] = React.useState<ImageFile[]>([]);
    const [generatedImages, setGeneratedImages] = React.useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [mood, setMood] = React.useState(MOOD_OPTIONS[0].value);
    const [styleSteering, setStyleSteering] = React.useState('');
    const [refineSteering, setRefineSteering] = React.useState('');
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);
    
    const handleGenerate = React.useCallback(async () => {
        if (!avatar || currentOutfit.length === 0) {
            setError("Please upload an avatar and add at least one clothing item to the outfit.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        const result = await generateStyledImage(avatar, currentOutfit, mood, styleSteering);
        
        if (result.error) {
            setError(result.error);
        } else {
            setGeneratedImages(result.images);
            setCurrentImageIndex(0);
        }
        setIsLoading(false);
    }, [avatar, currentOutfit, mood, styleSteering]);

    const handleRefine = React.useCallback(async () => {
        if (generatedImages.length === 0 || !refineSteering) {
             setError("Please generate an image first and provide a steering instruction to refine it.");
            return;
        }
        
        const currentImageSrc = generatedImages[currentImageIndex];
        const imageFile: ImageFile = {
            id: `refine-${Date.now()}`,
            name: 'generated-image-to-refine.png',
            src: currentImageSrc,
        };

        setIsLoading(true);
        setError(null);
        
        const result = await refineImage(imageFile, refineSteering);

        if (result.error) {
            setError(result.error);
        } else {
            setGeneratedImages(result.images);
            setCurrentImageIndex(0);
        }
        setIsLoading(false);
    }, [generatedImages, currentImageIndex, refineSteering]);
    
    // Handlers for drag-and-drop
    const handleDragStart = React.useCallback((e: React.DragEvent<HTMLDivElement>, cloth: ImageFile) => {
        e.dataTransfer.setData("text/plain", cloth.id);
    }, []);

    const handleDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const clothId = e.dataTransfer.getData("text/plain");
        const droppedCloth = wardrobe.find(c => c.id === clothId);
        if (droppedCloth && !currentOutfit.find(c => c.id === clothId)) {
            setCurrentOutfit(prev => [...prev, droppedCloth]);
        }
        setIsDraggingOver(false);
    }, [wardrobe, currentOutfit]);

    const handleRemoveFromOutfit = React.useCallback((clothId: string) => {
        setCurrentOutfit(prev => prev.filter(c => c.id !== clothId));
    }, []);
    
    const handleStartOver = React.useCallback(() => {
        setCurrentOutfit([]);
        setGeneratedImages([]);
        setCurrentImageIndex(0);
        setError(null);
        setStyleSteering('');
        setRefineSteering('');
    }, []);

    const handleWardrobeUpload = React.useCallback((imgs: ImageFile[]) => {
        setWardrobe(p => [...p, ...imgs]);
    }, []);

    const handleAvatarUpload = React.useCallback((imgs: ImageFile[]) => {
        if (imgs[0]) {
            setAvatar(imgs[0]);
        }
    }, []);


    return (
        <div className="container mx-auto px-4 py-8">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <WardrobePanel 
                        avatar={avatar}
                        wardrobe={wardrobe}
                        onWardrobeUpload={handleWardrobeUpload}
                        handleDragStart={handleDragStart}
                    />
                </div>
                <div className="lg:col-span-2">
                    <CanvasPanel 
                        avatar={avatar}
                        currentOutfit={currentOutfit}
                        generatedImages={generatedImages}
                        currentImageIndex={currentImageIndex}
                        isLoading={isLoading}
                        isDraggingOver={isDraggingOver}
                        handleDrop={handleDrop}
                        setIsDraggingOver={setIsDraggingOver}
                        handleRemoveFromOutfit={handleRemoveFromOutfit}
                        onAvatarUpload={handleAvatarUpload}
                        setCurrentImageIndex={setCurrentImageIndex}
                    />
                </div>
                <div className="lg:col-span-1">
                    <StudioControls 
                        avatar={avatar}
                        mood={mood}
                        setMood={setMood}
                        styleSteering={styleSteering}
                        setStyleSteering={setStyleSteering}
                        refineSteering={refineSteering}
                        setRefineSteering={setRefineSteering}
                        handleGenerate={handleGenerate}
                        handleRefine={handleRefine}
                        handleStartOver={handleStartOver}
                        isLoading={isLoading}
                        generatedImages={generatedImages}
                        currentOutfit={currentOutfit}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
};

export default Playground;