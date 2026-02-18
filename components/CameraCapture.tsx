
import { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback, memo } from 'react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  isActive: boolean;
}

export interface CameraHandle {
  capture: () => void;
}

const CameraCapture = forwardRef<CameraHandle, CameraCaptureProps>(({ onCapture, isActive }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera(); // Ensure previous stream is stopped

    // Check if camera is already starting to avoid race conditions
    if (streamRef.current) return;

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // If component unmounted or deactivated during await, stop stream immediately
      if (!videoRef.current) { // simple check, but could be more robust with a mounted ref
        newStream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Only set error if we are still active, though strictly speaking set state on unmounted is guarded by React now
      setError("Camera access denied. Please enable permissions.");
    }
  }, [stopCamera]);

  useEffect(() => {
    let isMounted = true;

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Check if video is ready
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress quality to 0.8
          onCapture(dataUrl);
        }
      }
    }
  }, [onCapture]);

  useImperativeHandle(ref, () => ({
    capture: handleCapture
  }));

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
          <p className="text-red-100 font-medium">{error}</p>
          <button onClick={startCamera} className="mt-4 px-4 py-2 bg-slate-800 rounded text-white">Retry</button>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover opacity-80"
        />
      )}
      <canvas ref={canvasRef} className="hidden" />
      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/90 pointer-events-none"></div>
    </div>
  );
});

export default memo(CameraCapture);
