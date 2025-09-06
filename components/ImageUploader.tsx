import * as React from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  onImageUpload: (image: ImageFile) => void;
  buttonText: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, buttonText }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({
          id: `${file.name}-${Date.now()}`,
          src: reader.result as string,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
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