import * as React from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  onImagesUpload: (images: ImageFile[]) => void;
  buttonText: string;
  multiple?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload, buttonText, multiple = false }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    // Clear the input value to allow re-uploading the same file(s)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition"
      >
        {buttonText}
      </button>
    </>
  );
};

export default ImageUploader;