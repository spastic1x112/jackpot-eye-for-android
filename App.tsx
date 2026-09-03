
import React, { useState, useCallback, useRef } from 'react';
import GameFeed from './components/GameFeed.tsx';
import StrategyPanel from './components/StrategyPanel.tsx';
import ProbabilityMesh from './components/ProbabilityMesh.tsx';
import AudioVisualizer from './components/AudioVisualizer.tsx';
import { analyzeGameFrame } from './services/geminiService.ts';
import { AnalysisResult, HistoryItem, LogEntry, AudioSettings, SoundProfile } from './types.ts';
import { 
  History, 
  LayoutDashboard, 
  Play, 
  Square, 
  Target, 
  Terminal, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sourceType, setSourceType] = useState<'camera' | 'screen'>('camera');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'debug' | 'settings'>('dashboard');
  const [lastLatency, setLastLatency] = useState<number>(0);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    enabled: true,
    volume: 0.5,
    profile: 'Arcade',
    playOnJackpot: true,
    playOnWarning: true,
    playOnError: true
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: 'jackpot' | 'warning' | 'error') => {
    if (!audioSettings.enabled) return;
    
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      
      const ctx = audioContextRef.current;
      if (!ctx) return;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playTone = (freq: number, start: number, duration: number, oscType: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(audioSettings.volume * 0.5, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      if (type === 'jackpot' && audioSettings.playOnJackpot) {
        if (audioSettings.profile === 'Arcade') {
          [523.25, 659.25, 783.99].forEach((f, i) => playTone(f, now + i * 0.1, 0.4, 'square'));
        } else {
          playTone(880, now, 0.5);
        }
      } else if (type === 'warning' && audioSettings.playOnWarning) {
        playTone(200, now, 0.2, 'triangle');
      } else if (type === 'error' && audioSettings.playOnError) {
        playTone(100, now, 0.5, 'sawtooth');
      }
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }, [audioSettings]);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info', category: LogEntry['category'] = 'system') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substring(2),
      timestamp: Date.now(),
      message,
      level,
      category
    }, ...prev].slice(0, 100));
  }, []);

  const handleFrame = useCallback(async (base64: string) => {
    const start = Date.now();
    setIsLoading(true);
    try {
      const result = await analyzeGameFrame(base64);
      if (result) {
        setLastLatency(Date.now() - start);
        setCurrentResult(result);
        setHistory(prev => [{
          id: Math.random().toString(36).substring(2),
          timestamp: Date.now(),
          bet: result.betAmount,
          result: result.recommendation,
          confidence: result.confidence
        }, ...prev].slice(0, 50));
        
        if (result.confidence > 0.8) {
          playSound('jackpot');
        } else if (result.confidence < 0.3) {
          playSound('warning');
        }
        addLog(`Processed frame: ${Date.now() - start}ms`, 'success', 'ai');
      }
    } catch (err: any) {
      let msg = "Analysis failed";
      if (err.message === "QUOTA_EXCEEDED") msg = "API Rate Limit reached";
      if (err.message === "SERVER_COMMUNICATION_ERROR") msg = "Server Proxy Timeout (Retrying...)";
      
      addLog(msg, 'error', 'ai');
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  }, [playSound, addLog]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 pb-20 md:pb-0">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
            <Target className="text-black" />
          </div>
          <h1 className="text-xl font-bold">Jackpot<span className="text-amber-500">Eye</span></h1>
        </div>
        <div className="hidden md:flex space-x-8">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-amber-500' : 'text-zinc-500 text-sm font-semibold'}>Dashboard</button>
          <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'text-amber-500' : 'text-zinc-500 text-sm font-semibold'}>Log</button>
          <button onClick={() => setActiveTab('debug')} className={activeTab === 'debug' ? 'text-amber-500' : 'text-zinc-500 text-sm font-semibold'}>Debug</button>
          <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-amber-500' : 'text-zinc-500 text-sm font-semibold'}>Settings</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex bg-black p-1 rounded-lg border border-zinc-800">
                <button onClick={() => setSourceType('camera')} className={`px-4 py-1.5 rounded text-xs font-bold ${sourceType === 'camera' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500'}`}>Camera</button>
                <button onClick={() => setSourceType('screen')} className={`px-4 py-1.5 rounded text-xs font-bold ${sourceType === 'screen' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500'}`}>Screen</button>
              </div>
              <button onClick={() => setIsAnalyzing(!isAnalyzing)} className={`px-6 py-2 rounded-xl font-bold flex items-center space-x-2 text-sm transition-all duration-300 ${isAnalyzing ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-amber-500 text-black hover:bg-amber-400'}`}>
                {isAnalyzing ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isAnalyzing ? 'Terminating Analysis' : 'Engage Scanner'}</span>
              </button>
            </div>
            <GameFeed onFrame={handleFrame} isAnalyzing={isAnalyzing} sourceType={sourceType} isLoading={isLoading} />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <StrategyPanel result={currentResult} loading={isLoading} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                <ProbabilityMesh confidence={currentResult?.confidence || 0} isAnalyzing={isAnalyzing} isLoading={isLoading} />
                <AudioVisualizer isActive={isAnalyzing} />
              </div>
            </>
          )}
          
          {activeTab === 'settings' && (
             <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
               <h2 className="text-xl font-bold">Preferences</h2>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-zinc-300">Master Audio</span>
                   <button onClick={() => setAudioSettings(s => ({...s, enabled: !s.enabled}))} className={`w-12 h-6 rounded-full relative transition-colors ${audioSettings.enabled ? 'bg-amber-500' : 'bg-zinc-800'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${audioSettings.enabled ? 'left-7' : 'left-1'}`}></div>
                   </button>
                 </div>
                 <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Volume: {(audioSettings.volume * 100).toFixed(0)}%</span>
                    <input type="range" min="0" max="1" step="0.1" value={audioSettings.volume} onChange={e => setAudioSettings(s => ({...s, volume: parseFloat(e.target.value)}))} className="w-full accent-amber-500" />
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {(['Arcade', 'Cyber', 'Minimal'] as SoundProfile[]).map(p => (
                      <button key={p} onClick={() => setAudioSettings(s => ({...s, profile: p}))} className={`py-2 rounded border text-[10px] font-bold ${audioSettings.profile === p ? 'bg-amber-500 border-amber-500 text-black' : 'bg-black border-zinc-800 text-zinc-500'}`}>{p}</button>
                    ))}
                 </div>
               </div>
             </div>
          )}
          
          {activeTab === 'debug' && (
             <div className="bg-black p-4 rounded-xl border border-zinc-800 h-[400px] overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1">
               {logs.map(log => (
                 <div key={log.id} className={`${log.level === 'error' ? 'text-red-500' : log.level === 'success' ? 'text-green-500' : 'text-zinc-500'}`}>
                   [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                 </div>
               ))}
               {logs.length === 0 && <div className="text-zinc-700 italic">No activity logs recorded.</div>}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
