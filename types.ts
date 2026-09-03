
export interface AnalysisResult {
  strategy: string;
  betAmount: string;
  confidence: number;
  detectedSymbols: string[];
  volatility: 'Low' | 'Medium' | 'High';
  recommendation: string;
  latency?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  bet: string;
  result: string;
  confidence: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  category: 'system' | 'ai' | 'media';
}

export type SoundProfile = 'Arcade' | 'Cyber' | 'Minimal';

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  profile: SoundProfile;
  playOnJackpot: boolean;
  playOnWarning: boolean;
  playOnError: boolean;
}
