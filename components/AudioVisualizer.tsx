
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // Small for a subtle look
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!canvasRef.current) return;
          const canvas = canvasRef.current;
          const canvasCtx = canvas.getContext('2d');
          if (!canvasCtx) return;

          animationFrameRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          const width = canvas.width;
          const height = canvas.height;
          canvasCtx.clearRect(0, 0, width, height);

          const barWidth = (width / bufferLength) * 1.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;

            // Color gradient from zinc-700 to amber-500
            const opacity = dataArray[i] / 255;
            canvasCtx.fillStyle = `rgba(245, 158, 11, ${0.1 + opacity * 0.6})`;
            
            // Draw bar with slight rounded top
            canvasCtx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
            
            // Subtle top glow for active bars
            if (dataArray[i] > 150) {
              canvasCtx.fillStyle = `rgba(245, 158, 11, 0.8)`;
              canvasCtx.fillRect(x, height - barHeight, barWidth - 2, 2);
            }

            x += barWidth;
          }
        };

        draw();
      } catch (err) {
        console.error("Audio visualizer initialization failed:", err);
      }
    };

    initAudio();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      // Fix: Check if context exists and is not already closed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.warn("Error closing context", e));
      }
    };
  }, [isActive]);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-end h-24">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`}></div>
          <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Acoustic Signal</h4>
        </div>
        <span className="text-[8px] text-zinc-600 font-mono">FREQ_ANA_01</span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={40} 
        className="w-full h-10 opacity-80"
      />
    </div>
  );
};

export default AudioVisualizer;
