import React from 'react';
import { getScoreColors } from '../../utils/formatters';

interface ScoreBadgeProps {
  score: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, onClick, size = 'md' }) => {
  const colors = getScoreColors(score);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3.5 py-1.5 text-base',
  }[size];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      title={onClick ? 'Click to inspect transparent score breakdown' : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg font-mono font-bold border transition-all ${
        onClick ? 'cursor-pointer hover:shadow-xs hover:scale-102' : ''
      } ${sizeClasses} ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span>{score}</span>
      <span className="text-[10px] font-sans font-normal opacity-70">/100</span>
    </div>
  );
};
