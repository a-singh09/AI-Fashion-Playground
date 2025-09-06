import * as React from 'react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let activeStream: MediaStream | null = null;
    const getCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera API is not supported by your browser.");
        }
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please ensure you have given permission.");
      }
    };

    getCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 text-gray-900 dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Capture Image</h2>
        {error ? (
          <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="relative">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            Cancel
          </button>
          <button onClick={handleCapture} disabled={!stream || !!error} className="px-6 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors disabled:bg-pink-300 disabled:cursor-not-allowed">
            Take Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
