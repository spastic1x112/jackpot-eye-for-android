import React from 'react';
import { render, screen } from '@testing-library/react';
import StrategyPanel from './StrategyPanel';
import { AnalysisResult } from '../types';

describe('StrategyPanel', () => {
  const mockResult: AnalysisResult = {
    strategy: 'Wait for pattern confirmation',
    betAmount: '10.50',
    confidence: 0.85,
    detectedSymbols: ['🍒', '🍋', '🔔'],
    volatility: 'High',
    recommendation: 'Hold',
  };

  it('renders loading state when loading is true and result is null', () => {
    const { container } = render(<StrategyPanel loading={true} result={null} />);
    const pulseDiv = container.querySelector('.animate-pulse');
    expect(pulseDiv).toBeInTheDocument();
  });

  it('renders initial/empty state when result is null', () => {
    render(<StrategyPanel loading={false} result={null} />);
    expect(screen.getByText('Start analysis feed to detect patterns and generate strategy.')).toBeInTheDocument();
  });

  it('renders populated state correctly', () => {
    render(<StrategyPanel loading={false} result={mockResult} />);

    // Check for Bet Amount
    expect(screen.getByText('$10.50')).toBeInTheDocument();

    // Check for Confidence (0.85 * 100 = 85%)
    expect(screen.getByText('85%')).toBeInTheDocument();

    // Check for Volatility
    expect(screen.getByText('High')).toBeInTheDocument();

    // Check for Strategy Insight
    expect(screen.getByText('Wait for pattern confirmation')).toBeInTheDocument();

    // Check for Recommendation
    expect(screen.getByText('"Hold"')).toBeInTheDocument();

    // Check for Detected Symbols
    expect(screen.getByText('🍒')).toBeInTheDocument();
    expect(screen.getByText('🍋')).toBeInTheDocument();
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });

  it('applies correct color for Low volatility', () => {
    const lowVolatilityResult = { ...mockResult, volatility: 'Low' as const };
    render(<StrategyPanel loading={false} result={lowVolatilityResult} />);
    const volatilityElement = screen.getByText('Low');
    expect(volatilityElement).toHaveClass('text-green-400');
  });

  it('applies correct color for Medium volatility', () => {
    const mediumVolatilityResult = { ...mockResult, volatility: 'Medium' as const };
    render(<StrategyPanel loading={false} result={mediumVolatilityResult} />);
    const volatilityElement = screen.getByText('Medium');
    expect(volatilityElement).toHaveClass('text-yellow-400');
  });

  it('applies correct color for High volatility', () => {
    render(<StrategyPanel loading={false} result={mockResult} />);
    const volatilityElement = screen.getByText('High');
    expect(volatilityElement).toHaveClass('text-red-400');
  });
});
