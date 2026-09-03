
import React, { useMemo, useEffect, useState } from 'react';

interface ProbabilityMeshProps {
  confidence: number;
  isAnalyzing: boolean;
  isLoading: boolean;
}

const ProbabilityMesh: React.FC<ProbabilityMeshProps> = ({ confidence, isAnalyzing, isLoading }) => {
  const [localVariations, setLocalVariations] = useState<number[]>(new Array(24).fill(0));

  useEffect(() => {
    if (!isAnalyzing) {
      setLocalVariations(new Array(24).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setLocalVariations(prev => prev.map(() => Math.random() * 0.2 - 0.1));
    }, 800);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const cells = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const base = isAnalyzing ? confidence : 0;
      const variation = isAnalyzing ? localVariations[i] : 0;
      const heat = Math.max(0, Math.min(1, base + variation + (base > 0.7 ? Math.random() * 0.1 : 0)));
      return { id: i, heat };
    });
  }, [confidence, isAnalyzing, localVariations]);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`}></div>
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Neural Mesh</h4>
        </div>
        {isLoading && <span className="text-[9px] text-amber-500 font-bold animate-pulse uppercase tracking-tight">Syncing...</span>}
      </div>

      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {cells.map((cell) => (
          <div 
            key={cell.id} 
            className="aspect-square rounded-sm border border-zinc-800/40 bg-black/60 relative overflow-hidden"
          >
            <div 
              className="absolute inset-0 transition-all duration-1000 ease-out"
              style={{ 
                backgroundColor: cell.heat > 0.8 ? 'rgba(245, 158, 11, 0.4)' : 
                                cell.heat > 0.5 ? 'rgba(245, 158, 11, 0.2)' : 
                                cell.heat > 0.2 ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                boxShadow: cell.heat > 0.8 ? 'inset 0 0 10px rgba(245, 158, 11, 0.2)' : 'none'
              }}
            />
            
            <div 
              className="absolute bottom-0 left-0 h-0.5 bg-amber-500/50 transition-all duration-700"
              style={{ width: `${cell.heat * 100}%` }}
            />

            {isAnalyzing && cell.heat > 0.7 && (
               <div 
                 className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" 
                 style={{ animationDelay: `${Math.random() * 2}s` }}
               />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProbabilityMesh;
