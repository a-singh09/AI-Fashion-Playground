import * as React from 'react';
import type { ImageFile, WardrobeItem, ClothingCategory, ClothingSeason } from '../types';
import { MOOD_OPTIONS } from '../constants';
import ImageUploader from './ImageUploader';
import { generateStyledImage, refineImage, analyzeClothingItem } from '../services/geminiService';
import { getAvatar, saveAvatar, getWardrobe, saveWardrobe } from '../services/db';
import Loader from './Loader';

const GlassPanel: React.FC<{ children: React.ReactNode; className?: string; sticky?: boolean } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', sticky=false, ...rest }) => (
    <div {...rest} className={`glass-panel rounded-2xl p-6 shadow-2xl ${sticky ? 'sticky top-24' : ''} ${className}`}>
        {children}
    </div>
);

const CATEGORY_OPTIONS: ClothingCategory[] = ['Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory', 'Dress', 'Unknown'];
const SEASON_OPTIONS: ClothingSeason[] = ['All-Season', 'Winter', 'Spring', 'Summer', 'Autumn'];


// --- Sub-component: WardrobePanel ---
interface WardrobePanelProps {
    avatar: ImageFile | null;
    wardrobe: WardrobeItem[];
    onWardrobeUpload: (images: ImageFile[]) => void;
    onAvatarUpload: (images: ImageFile[]) => void;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, cloth: WardrobeItem) => void;
    handleDragEnd: () => void;
    draggedItemId: string | null;
}

const WardrobePanel: React.FC<WardrobePanelProps> = ({ avatar, wardrobe, onWardrobeUpload, onAvatarUpload, handleDragStart, handleDragEnd, draggedItemId }) => {
    const [categoryFilter, setCategoryFilter] = React.useState<string>('All');
    const [seasonFilter, setSeasonFilter] = React.useState<string>('All');
    const [colorFilter, setColorFilter] = React.useState<string>('');
    
    const filteredWardrobe = React.useMemo(() => {
        return wardrobe.filter(item => {
            if (!item.metadata) return true; // always show items being analyzed
            const categoryMatch = categoryFilter === 'All' || item.metadata.category === categoryFilter;
            const seasonMatch = seasonFilter === 'All' || item.metadata.season === seasonFilter;
            const colorMatch = colorFilter === '' || item.metadata.color.toLowerCase().includes(colorFilter.toLowerCase());
            return categoryMatch && seasonMatch && colorMatch;
        });
    }, [wardrobe, categoryFilter, seasonFilter, colorFilter]);

    return (
        <GlassPanel sticky>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Studio</h3>
            <div className="mt-4 space-y-3">
                <ImageUploader onImagesUpload={onAvatarUpload} buttonText={avatar ? "Change Avatar" : "Upload Avatar"} icon="avatar" />
                <ImageUploader onImagesUpload={onWardrobeUpload} buttonText="Add Clothing" icon="clothing" multiple={true} />
            </div>
            {wardrobe.length > 0 && (
                <>
                <hr className="my-4 border-black/10 dark:border-white/10" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Wardrobe</h4>
                
                {/* Filters */}
                <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                         <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full p-2 form-input rounded-md text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-pink-500 focus:outline-none">
                            <option value="All">All Categories</option>
                            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <select value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)} className="w-full p-2 form-input rounded-md text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-pink-500 focus:outline-none">
                            <option value="All">All Seasons</option>
                             {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <input type="text" value={colorFilter} onChange={e => setColorFilter(e.target.value)} placeholder="Filter by color..." className="w-full p-2 form-input rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-1 focus:ring-pink-500 focus:outline-none"/>
                </div>

                <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                    {filteredWardrobe.map(cloth => (
                        <div 
                            key={cloth.id} 
                            draggable={!!avatar}
                            onDragStart={(e) => handleDragStart(e, cloth)}
                            onDragEnd={handleDragEnd}
                            className={`relative group cursor-grab active:cursor-grabbing rounded-lg overflow-hidden transition-all duration-200 ${!avatar ? 'opacity-50 cursor-not-allowed' : ''} ${draggedItemId === cloth.id ? 'opacity-40 scale-95 border-2 border-dashed border-pink-400' : 'shadow-md hover:shadow-lg hover:shadow-pink-500/20 hover:scale-105'}`}
                            title={avatar ? cloth.name : 'Upload an avatar to start styling'}
                            >
                            <img src={cloth.src} alt={cloth.name} className="w-full h-24 object-cover" />
                            {cloth.isAnalyzing && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Loader />
                                </div>
                            )}
                            {cloth.metadata && !cloth.isAnalyzing && (
                                <div className="absolute bottom-0 left-0 w-full bg-black/60 px-1 py-0.5">
                                    <p className="text-white text-[10px] truncate font-semibold">{cloth.metadata.category}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                </>
            )}
            {!avatar && <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Upload an avatar to start styling.</p>}
        </GlassPanel>
    );
}


// --- Sub-component: CanvasPanel ---
interface CanvasPanelProps {
    avatar: ImageFile | null;
    currentOutfit: WardrobeItem[];
    generatedImages: string[];
    currentImageIndex: number;
    isLoading: boolean;
    isDraggingOver: boolean;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    setIsDraggingOver: React.Dispatch<React.SetStateAction<boolean>>;
    handleRemoveFromOutfit: (clothId: string) => void;
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
    setCurrentImageIndex
}) => (
     <div className="lg:col-span-2 space-y-6">
        <GlassPanel 
            className={`relative flex items-center justify-center min-h-[400px] sm:min-h-[600px] transition-all duration-300 ${isDraggingOver ? 'ring-4 ring-pink-500 ring-offset-4 ring-offset-gray-100 dark:ring-offset-[#0a0514]' : 'ring-2 ring-transparent'}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}>
        
            {isDraggingOver && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 dark:bg-white/10 rounded-2xl pointer-events-none animate-fade-in border-2 border-dashed border-pink-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    <p className="mt-2 text-lg font-semibold text-white">Drop to add to outfit</p>
                </div>
            )}

            {!avatar ? (
                <div className="text-center text-gray-700 dark:text-gray-300">
                   <h3 className="text-xl font-semibold mb-4">Your canvas awaits</h3>
                   <p>Upload your avatar in the studio panel to begin.</p>
                </div>
            ) : isLoading ? (
                <div className="text-center">
                    <Loader large />
                    <p className="mt-4 text-gray-700 dark:text-gray-200 animate-pulse">Styling your new look...</p>
                </div>
            ) : (
                <div className="relative w-full h-full flex items-center justify-center group">
                    <img 
                        src={generatedImages.length > 0 ? generatedImages[currentImageIndex] : avatar.src} 
                        alt="Your Style" 
                        className="max-w-full max-h-[380px] sm:max-h-[580px] object-contain rounded-lg shadow-lg"
                    />
                    {generatedImages.length > 1 && (
                        <>
                            <button onClick={() => setCurrentImageIndex(p => (p === 0 ? generatedImages.length - 1 : p - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                                &#10094;
                            </button>
                            <button onClick={() => setCurrentImageIndex(p => (p === generatedImages.length - 1 ? 0 : p + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                                &#10095;
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                                {currentImageIndex + 1} / {generatedImages.length}
                            </div>
                        </>
                    )}
                </div>
            )}
        </GlassPanel>
        {currentOutfit.length > 0 && (
            <GlassPanel>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Current Outfit</h4>
                <div className="flex items-center gap-3 flex-wrap">
                    {currentOutfit.map(cloth => (
                         <div key={cloth.id} className="relative group animate-fade-in">
                            <img src={cloth.src} alt={cloth.name} className="w-20 h-20 object-cover rounded-lg"/>
                            <button onClick={() => handleRemoveFromOutfit(cloth.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 transform hover:scale-110">&times;</button>
                         </div>
                    ))}
                </div>
            </GlassPanel>
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
    currentOutfit: WardrobeItem[];
    error: string | null;
}

const StudioControls: React.FC<StudioControlsProps> = ({
    avatar, mood, setMood, styleSteering, setStyleSteering,
    refineSteering, setRefineSteering, handleGenerate, handleRefine,
    handleStartOver, isLoading, generatedImages, currentOutfit, error
}) => (
     <GlassPanel sticky>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Studio Controls</h3>
        <div className="space-y-6">
            <div>
                <label className="font-semibold block mb-2 text-gray-800 dark:text-gray-200">1. Set the Scene</label>
                <select value={mood} onChange={e => setMood(e.target.value)} className="w-full p-3 form-input rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none" disabled={!avatar}>
                    {MOOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            <div>
                <label className="font-semibold block mb-2 text-gray-800 dark:text-gray-200">2. Initial Steering <span className="text-sm font-normal text-gray-600 dark:text-gray-400">(Optional)</span></label>
                <input type="text" value={styleSteering} onChange={e => setStyleSteering(e.target.value)} placeholder="e.g., 'Make this casual'" className="w-full p-3 form-input rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:outline-none" disabled={!avatar}/>
            </div>
             <button onClick={handleGenerate} disabled={!avatar || currentOutfit.length === 0 || isLoading} className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-pink-500/20">
                {isLoading && !generatedImages.length ? <><Loader/> Generating...</> : 'Generate Style'}
            </button>
             <hr className="border-black/10 dark:border-white/10"/>
             <div>
                <label className="font-semibold block mb-2 text-gray-800 dark:text-gray-200">3. Refine Result</label>
                <div className="flex gap-3">
                     <input type="text" value={refineSteering} onChange={e => setRefineSteering(e.target.value)} placeholder="e.g., 'change the background'" className="w-full p-3 form-input rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none" disabled={generatedImages.length === 0 || isLoading}/>
                     <button onClick={handleRefine} disabled={generatedImages.length === 0 || !refineSteering || isLoading} className="py-3 px-5 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Refine
                    </button>
                </div>
            </div>
             <button onClick={handleStartOver} disabled={!avatar || (currentOutfit.length === 0 && generatedImages.length === 0)} className="w-full py-3 bg-gray-500 dark:bg-gray-600/80 text-white font-bold rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700/80 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Start Over
            </button>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
        </div>
    </GlassPanel>
);


// --- Main Component: Playground ---
const Playground: React.FC = () => {
    const [avatar, setAvatar] = React.useState<ImageFile | null>(null);
    const [wardrobe, setWardrobe] = React.useState<WardrobeItem[]>([]);
    const [currentOutfit, setCurrentOutfit] = React.useState<WardrobeItem[]>([]);
    const [generatedImages, setGeneratedImages] = React.useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [mood, setMood] = React.useState(MOOD_OPTIONS[0].value);
    const [styleSteering, setStyleSteering] = React.useState('');
    const [refineSteering, setRefineSteering] = React.useState('');
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);
    const [isConfirmingStartOver, setIsConfirmingStartOver] = React.useState(false);
    const [draggedItemId, setDraggedItemId] = React.useState<string | null>(null);
    
    // Load data from IndexedDB on initial render
    React.useEffect(() => {
        const loadData = async () => {
            const savedAvatar = await getAvatar();
            if (savedAvatar) {
                setAvatar(savedAvatar);
            }
            const savedWardrobe = await getWardrobe();
            if (savedWardrobe) {
                setWardrobe(savedWardrobe);
            }
        };
        loadData();
    }, []);

    // Save avatar to IndexedDB whenever it changes
    React.useEffect(() => {
        if (avatar) {
            saveAvatar(avatar);
        }
    }, [avatar]);

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
    const handleDragStart = React.useCallback((e: React.DragEvent<HTMLDivElement>, cloth: WardrobeItem) => {
        e.dataTransfer.setData("text/plain", cloth.id);
        setDraggedItemId(cloth.id);
    }, []);

    const handleDragEnd = React.useCallback(() => {
        setDraggedItemId(null);
        setIsDraggingOver(false); // Clean up dragging state on end
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
    
    const handleConfirmStartOver = () => {
        handleStartOver();
        setIsConfirmingStartOver(false);
    };

    const handleWardrobeUpload = React.useCallback(async (imgs: ImageFile[]) => {
        const newItems: WardrobeItem[] = imgs.map(img => ({ ...img, isAnalyzing: true }));
        setWardrobe(prev => [...prev.filter(item => !imgs.some(i => i.id === item.id)), ...newItems]);

        const analysisPromises = newItems.map(async (item) => {
            const metadata = await analyzeClothingItem(item);
            const analyzedItem = { ...item, metadata, isAnalyzing: false };
            
            // Update state for this one item as soon as it's done
            setWardrobe(prev => {
                const updated = prev.map(w => w.id === analyzedItem.id ? analyzedItem : w);
                saveWardrobe(updated); // Persist change
                return updated;
            });
        });

        await Promise.all(analysisPromises);
    }, []);


    const handleAvatarUpload = React.useCallback((imgs: ImageFile[]) => {
        if (imgs[0]) {
            setAvatar(imgs[0]);
        }
    }, []);


    return (
        <div className="container mx-auto px-4 py-8">
             {isConfirmingStartOver && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel w-full max-w-md mx-4 p-6 border-0 shadow-2xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Start Over</h3>
                    <p className="text-gray-800 dark:text-gray-300 mb-8">
                        Are you sure you want to clear your current outfit and generated images?
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                        onClick={() => setIsConfirmingStartOver(false)}
                        className="px-5 py-2 rounded-lg bg-gray-500/80 text-white font-semibold hover:bg-gray-600/80 transition-colors"
                        >
                        Cancel
                        </button>
                        <button
                        onClick={handleConfirmStartOver}
                        className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                        >
                        Confirm
                        </button>
                    </div>
                    </div>
                </div>
            )}
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-1">
                    <WardrobePanel 
                        avatar={avatar}
                        wardrobe={wardrobe}
                        onWardrobeUpload={handleWardrobeUpload}
                        onAvatarUpload={handleAvatarUpload}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        draggedItemId={draggedItemId}
                    />
                </div>
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
                    setCurrentImageIndex={setCurrentImageIndex}
                />
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
                        handleStartOver={() => setIsConfirmingStartOver(true)}
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