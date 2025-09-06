import * as React from 'react';
import type { ImageFile } from '../types';
import CameraCapture from './CameraCapture';

interface ImageUploaderProps {
  onImagesUpload: (images: ImageFile[]) => void;
  buttonText: string;
  multiple?: boolean;
  icon?: 'avatar' | 'clothing';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload, buttonText, multiple = false, icon }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const imagePromises = Array.from(files).map(file => {
        return new Promise<ImageFile>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    id: `${file.name}-${Date.now()}`,
                    src: reader.result as string,
                    name: file.name,
                });
            };
            reader.readAsDataURL(file);
        });
    });
    
    Promise.all(imagePromises).then(images => {
        onImagesUpload(images);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCapture = (imageSrc: string) => {
    onImagesUpload([{
        id: `capture-${Date.now()}`,
        src: imageSrc,
        name: `capture-${Date.now()}.png`
    }]);
    setIsCameraOpen(false);
  };

  const Icon: React.FC<{type: 'avatar' | 'clothing'}> = ({type}) => {
    if (type === 'avatar') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple={multiple}
      />
      <div className="flex space-x-2">
         <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-grow flex items-center justify-center py-2.5 px-4 border-2 border-dashed border-gray-400/50 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 hover:border-gray-400/80 dark:hover:border-white/40 transition-colors"
        >
            {icon && <Icon type={icon} />}
            {buttonText}
        </button>
        <button
            onClick={() => setIsCameraOpen(true)}
            className="flex-shrink-0 flex items-center justify-center py-2.5 px-4 border-2 border-dashed border-gray-400/50 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 hover:border-gray-400/80 dark:hover:border-white/40 transition-colors"
            title="Capture from camera"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm10 4a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" /></svg>
        </button>
      </div>

      {isCameraOpen && (
          <CameraCapture 
            onCapture={handleCapture}
            onClose={() => setIsCameraOpen(false)}
          />
      )}
    </>
  );
};

export default ImageUploader;