
import React from 'react';
import { AnalysisResult } from '../types.ts';
import { TrendingUp, Target, Activity, Zap } from 'lucide-react';

interface StrategyPanelProps {
  result: AnalysisResult | null;
  loading: boolean;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ result, loading }) => {
  if (loading && !result) {
    return (
      <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="h-16 bg-zinc-800 rounded"></div>
          <div className="h-16 bg-zinc-800 rounded"></div>
          <div className="h-16 bg-zinc-800 rounded"></div>
        </div>
        <div className="h-20 bg-zinc-800 rounded"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-zinc-900/50 p-10 rounded-xl border border-zinc-800 border-dashed text-center">
        <div className="bg-zinc-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-6 h-6 text-zinc-600" />
        </div>
        <p className="text-zinc-500 text-sm italic max-w-[240px] mx-auto">
          Start analysis feed to detect patterns and generate strategy.
        </p>
      </div>
    );
  }

  const getVolatilityColor = (v: string) => {
    switch (v) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-amber-500/20 p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-1.5 mb-1">
            <Target className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bet</span>
          </div>
          <div className="text-xl font-bold mono text-amber-500">${result.betAmount}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-1.5 mb-1">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Conf.</span>
          </div>
          <div className="text-xl font-bold mono text-blue-400">{(result.confidence * 100).toFixed(0)}%</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-1.5 mb-1">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vol.</span>
          </div>
          <div className={`text-xl font-bold mono ${getVolatilityColor(result.volatility)}`}>{result.volatility}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-zinc-900 to-[#0c0c0e] border border-zinc-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
        <h3 className="text-sm font-bold mb-3 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <span className="uppercase tracking-wide">AI Insight</span>
        </h3>
        <p className="text-zinc-300 text-sm mb-4 leading-relaxed">{result.strategy}</p>
        
        <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 mb-4">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Recommendation</p>
          <p className="text-sm text-zinc-400 italic">"{result.recommendation}"</p>
        </div>

        <div className="pt-4 border-t border-zinc-800/50 flex flex-wrap gap-2">
          {result.detectedSymbols.map((s, idx) => (
            <span key={idx} className="bg-zinc-800/40 text-zinc-400 px-2 py-1 rounded-md text-[10px] font-mono border border-zinc-700/50">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyPanel;
