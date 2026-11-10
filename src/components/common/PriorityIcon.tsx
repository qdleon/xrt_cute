import React from 'react';
import { IssuePriority } from '../../types/project';

interface PriorityIconProps {
  priority: IssuePriority;
  className?: string;
  size?: number;
}

export const PriorityIcon: React.FC<PriorityIconProps> = ({ priority, className = '', size = 16 }) => {
  switch (priority) {
    case 'urgent':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-rose-500 shrink-0 ${className}`}
        >
          <rect x="2" y="2" width="12" height="12" rx="2.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5V9M8 11.5V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'high':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-amber-500 shrink-0 ${className}`}
        >
          <rect x="2.5" y="10" width="2.5" height="4" rx="0.75" fill="currentColor" />
          <rect x="6.75" y="6.5" width="2.5" height="7.5" rx="0.75" fill="currentColor" />
          <rect x="11" y="3" width="2.5" height="11" rx="0.75" fill="currentColor" />
        </svg>
      );
    case 'medium':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-blue-500 shrink-0 ${className}`}
        >
          <rect x="3" y="10" width="2.5" height="4" rx="0.75" fill="currentColor" />
          <rect x="7.5" y="6.5" width="2.5" height="7.5" rx="0.75" fill="currentColor" />
          <rect x="12" y="11" width="2.5" height="3" rx="0.75" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
    case 'low':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-slate-400 dark:text-slate-500 shrink-0 ${className}`}
        >
          <rect x="3" y="10" width="2.5" height="4" rx="0.75" fill="currentColor" />
          <rect x="7.5" y="10" width="2.5" height="4" rx="0.75" fill="currentColor" fillOpacity="0.25" />
          <rect x="12" y="10" width="2.5" height="4" rx="0.75" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
    case 'none':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-slate-300 dark:text-slate-600 shrink-0 ${className}`}
        >
          <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
        </svg>
      );
  }
};

export const getPriorityLabel = (priority: IssuePriority): string => {
  switch (priority) {
    case 'urgent':
      return '紧急';
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    case 'none':
      return '无优先级';
  }
};
