
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, Zap } from 'lucide-react';

interface GameFeedProps {
  onFrame: (base64: string) => void;
  isAnalyzing: boolean;
  sourceType: 'camera' | 'screen';
  isLoading: boolean;
}

const GameFeed: React.FC<GameFeedProps> = ({ onFrame, isAnalyzing, sourceType, isLoading }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStreamActive(false);
      setIsInitializing(false);
    }
  }, []);

  const startFeed = useCallback(async () => {
    stopStream();
    setError(null);
    setIsInitializing(true);

    if (!navigator.mediaDevices) {
      setError("Media devices not available.");
      setIsInitializing(false);
      return;
    }

    try {
      let newStream: MediaStream;
      if (sourceType === 'camera') {
        newStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
      } else {
        newStream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
      }
      
      streamRef.current = newStream;
      setStreamActive(true);
      if (videoRef.current) videoRef.current.srcObject = newStream;
      newStream.getVideoTracks()[0].onended = () => setStreamActive(false);
    } catch (err: any) {
      setError(err.message || "Failed to start feed.");
      setStreamActive(false);
    } finally {
      setIsInitializing(false);
    }
  }, [sourceType, stopStream]);

  const captureFrame = useCallback(() => {
    if (isLoading) return;
    if (videoRef.current && canvasRef.current && streamRef.current?.active) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = 1024;
        canvas.height = (video.videoHeight / video.videoWidth) * 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          onFrame(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
        }
      }
    }
  }, [onFrame, isLoading]);

  useEffect(() => {
    let interval: number;
    if (isAnalyzing && streamActive) interval = window.setInterval(captureFrame, 1500);
    return () => clearInterval(interval);
  }, [isAnalyzing, captureFrame, streamActive]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
      {!streamActive && !isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 z-20">
          <button onClick={startFeed} className="px-10 py-4 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest flex items-center space-x-3 transition-transform active:scale-95">
            <Zap className="w-4 h-4 fill-current" />
            <span>Connect Feed</span>
          </button>
        </div>
      )}
      {isInitializing && <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 z-30"><RefreshCw className="w-10 h-10 text-amber-500 animate-spin" /></div>}
      {error && <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-8 text-center bg-zinc-900/95 z-40"><p className="text-sm font-bold">{error}</p></div>}
      <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-contain ${streamActive ? 'opacity-100' : 'opacity-0'}`} />
      {isAnalyzing && <div className="scanline"></div>}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default GameFeed;
