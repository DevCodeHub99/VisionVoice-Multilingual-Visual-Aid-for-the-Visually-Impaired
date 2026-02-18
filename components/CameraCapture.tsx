import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please ensure permissions are granted and try again.");
    }
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-[fade-in_0.3s_ease-out]">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <span className="text-white font-medium drop-shadow-md">Capture Image</span>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          aria-label="Close Camera"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div className="flex-grow relative flex items-center justify-center bg-black">
        {error ? (
          <div className="text-center p-6 max-w-xs">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
            <p className="text-red-100 font-medium">{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent">
        <button
          onClick={handleCapture}
          disabled={!!error}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm active:scale-95 active:bg-white/40 transition-all shadow-lg shadow-black/30"
          aria-label="Take Photo"
        >
          <div className="w-16 h-16 bg-white rounded-full"></div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
