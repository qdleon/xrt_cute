import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { MemberAvatar } from '../common/MemberAvatar';
import { PriorityIcon } from '../common/PriorityIcon';
import { StatusIcon } from '../common/StatusIcon';

export const CalendarView: React.FC = () => {
  const {
    filteredIssues,
    projects,
    members,
    setSelectedIssueId,
    setIsNewIssueModalOpen,
    setNewIssueInitialDate,
  } = useProject();

  // Current calendar view month: November 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 0-indexed: 10 is November

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Generate calendar grid (days of current month with padding for start day of week)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateString: string;
    }[] = [];

    // Preceding padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(prevM + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        day: d,
        month: prevM,
        year: prevY,
        isCurrentMonth: false,
        dateString: `${prevY}-${mStr}-${dStr}`,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateString: `${currentYear}-${mStr}-${dStr}`,
      });
    }

    // Trailing padding to make full 35 or 42 grid
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(nextM + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        day: d,
        month: nextM,
        year: nextY,
        isCurrentMonth: false,
        dateString: `${nextY}-${mStr}-${dStr}`,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handleCellAddIssue = (dateStr: string) => {
    setNewIssueInitialDate(dateStr);
    setIsNewIssueModalOpen(true);
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#070b12] flex flex-col h-[calc(100vh-105px)] overflow-hidden p-6">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {currentYear}年 {monthNames[currentMonth]}
          </h2>
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-md p-0.5 bg-slate-50 dark:bg-slate-900">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
              title="上一月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonth(10);
              }}
              className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              本月
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
              title="下一月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          点击任意日期格子可直接添加排期事项
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">
        {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(d => (
          <div key={d} className="px-3 text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="flex-1 grid grid-cols-7 border-l border-t border-slate-200 dark:border-slate-800 overflow-y-auto">
        {calendarDays.map((cell, idx) => {
          const isToday = cell.dateString === '2026-11-09';
          // Filter issues having dueDate matching this day or spanning into this day
          const dayIssues = filteredIssues.filter(
            i => i.dueDate === cell.dateString || i.startDate === cell.dateString
          );

          return (
            <div
              key={idx}
              className={`min-h-[110px] p-2 border-r border-b border-slate-200 dark:border-slate-800 flex flex-col justify-between group transition-colors ${
                cell.isCurrentMonth
                  ? 'bg-white dark:bg-[#0b0f17]'
                  : 'bg-slate-50/50 dark:bg-[#07090e] text-slate-400 dark:text-slate-600'
              } ${isToday ? 'ring-1 ring-inset ring-indigo-500/40 bg-indigo-50/10' : ''}`}
            >
              {/* Day Header Row */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-medium ${
                    isToday
                      ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold'
                      : cell.isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {cell.day}
                </span>

                <button
                  onClick={() => handleCellAddIssue(cell.dateString)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition-opacity"
                  title={`在 ${cell.dateString} 添加事项`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Issues List */}
              <div className="mt-1 flex-1 space-y-1 overflow-y-auto max-h-[80px]">
                {dayIssues.map(issue => {
                  const project = projects.find(p => p.id === issue.projectId);
                  return (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className="px-1.5 py-1 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer text-[11px] flex items-center gap-1.5 transition-colors"
                    >
                      <StatusIcon status={issue.status} size={11} />
                      <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                        {issue.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
