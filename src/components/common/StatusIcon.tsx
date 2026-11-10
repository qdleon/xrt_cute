import React from 'react';
import { IssueStatus } from '../../types/project';

interface StatusIconProps {
  status: IssueStatus;
  className?: string;
  size?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, className = '', size = 16 }) => {
  switch (status) {
    case 'backlog':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-slate-400 dark:text-slate-500 shrink-0 ${className}`}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeDasharray="2 2"
        >
          <circle cx="8" cy="8" r="6" />
        </svg>
      );
    case 'todo':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-slate-400 dark:text-slate-400 shrink-0 ${className}`}
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <circle cx="8" cy="8" r="6" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-amber-500 dark:text-amber-400 shrink-0 ${className}`}
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" opacity="0.3" />
          <path
            d="M8 2 A6 6 0 0 1 14 8 L8 8 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'in_review':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-indigo-500 dark:text-indigo-400 shrink-0 ${className}`}
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" opacity="0.3" />
          <path
            d="M8 2 A6 6 0 1 1 2 8 L8 8 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'done':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-emerald-500 dark:text-emerald-400 shrink-0 ${className}`}
        >
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path
            d="M5 8.2L7 10.2L11 6"
            stroke="white"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'canceled':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          className={`text-rose-500 dark:text-rose-400 shrink-0 ${className}`}
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" />
          <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

export const getStatusLabel = (status: IssueStatus): string => {
  switch (status) {
    case 'backlog':
      return '待规划';
    case 'todo':
      return '待处理';
    case 'in_progress':
      return '进行中';
    case 'in_review':
      return '评审中';
    case 'done':
      return '已完成';
    case 'canceled':
      return '已取消';
  }
};
