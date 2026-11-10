import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Issue } from '../../types/project';
import { MemberAvatar } from '../common/MemberAvatar';
import { PriorityIcon } from '../common/PriorityIcon';
import { StatusIcon } from '../common/StatusIcon';

export const GanttView: React.FC = () => {
  const {
    filteredIssues,
    projects,
    members,
    updateIssue,
    setSelectedIssueId,
  } = useProject();

  // Timeline window base date: November 2026
  const [baseDate, setBaseDate] = useState(() => new Date('2026-11-01'));
  const [daysCount, setDaysCount] = useState(21); // 3 weeks view default

  // Generate date slots for timeline header
  const timelineDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [baseDate, daysCount]);

  const startDateString = timelineDates[0].toISOString().slice(0, 10);
  const endDateString = timelineDates[timelineDates.length - 1].toISOString().slice(0, 10);

  const shiftDays = (delta: number) => {
    setBaseDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta);
      return next;
    });
  };

  const getDayOffset = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffTime = d.getTime() - timelineDates[0].getTime();
    return Math.round(diffTime / (1000 * 3600 * 24));
  };

  // Helper to adjust date by delta days
  const adjustDate = (dateStr: string, daysDelta: number): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + daysDelta);
    return d.toISOString().slice(0, 10);
  };

  const chineseWeekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="flex-1 bg-white dark:bg-[#070b12] flex flex-col h-[calc(100vh-105px)] overflow-hidden">
      {/* Gantt Top Controls */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 p-0.5">
            <button
              onClick={() => shiftDays(-7)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
              title="上一周"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
              {startDateString} ~ {endDateString}
            </span>
            <button
              onClick={() => shiftDays(7)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
              title="下一周"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setBaseDate(new Date('2026-11-01'))}
            className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            回到今天
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">时间跨度:</span>
          <button
            onClick={() => setDaysCount(14)}
            className={`px-2 py-1 text-xs rounded ${
              daysCount === 14
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            2 周
          </button>
          <button
            onClick={() => setDaysCount(21)}
            className={`px-2 py-1 text-xs rounded ${
              daysCount === 21
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            3 周
          </button>
          <button
            onClick={() => setDaysCount(28)}
            className={`px-2 py-1 text-xs rounded ${
              daysCount === 28
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            4 周
          </button>
        </div>
      </div>

      {/* Main Gantt Split: Left Table List + Right Timeline Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Frozen Panel: Issues List (320px) */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-white dark:bg-[#0b0f17]">
          {/* Header */}
          <div className="h-10 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>排期事项</span>
            <span>负责人</span>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredIssues.map(issue => {
              const project = projects.find(p => p.id === issue.projectId);
              const assignee = members.find(m => m.id === issue.assigneeId);

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="h-12 px-4 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon status={issue.status} size={14} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400">
                          {issue.id}
                        </span>
                        {project && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                        )}
                      </div>
                      <span className="block text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[190px]">
                        {issue.title}
                      </span>
                    </div>
                  </div>

                  <MemberAvatar member={assignee} size={20} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Scrollable Canvas: Days Grid & Bars */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-slate-50/40 dark:bg-[#070b12]">
          <div
            style={{ width: `${daysCount * 44}px` }}
            className="min-w-full flex flex-col"
          >
            {/* Timeline Header Row (Days of week & Date) */}
            <div className="h-10 flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/70 sticky top-0 z-10 select-none">
              {timelineDates.map((d, index) => {
                const dayName = chineseWeekdays[d.getDay()];
                const dayNum = d.getDate();
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const isToday =
                  d.toISOString().slice(0, 10) === '2026-11-09'; // Current demo date

                return (
                  <div
                    key={index}
                    style={{ width: '44px' }}
                    className={`flex flex-col items-center justify-center border-r border-slate-200/60 dark:border-slate-800/60 shrink-0 text-[10px] ${
                      isToday
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                        : isWeekend
                        ? 'bg-slate-200/30 dark:bg-slate-950/30 text-slate-400 dark:text-slate-600'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span>{dayName}</span>
                    <span className="font-mono text-xs">{dayNum}</span>
                  </div>
                );
              })}
            </div>

            {/* Timeline Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 relative">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timelineDates.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = d.toISOString().slice(0, 10) === '2026-11-09';
                  return (
                    <div
                      key={i}
                      style={{ width: '44px' }}
                      className={`h-full border-r border-slate-200/40 dark:border-slate-800/40 shrink-0 ${
                        isToday
                          ? 'bg-indigo-500/5'
                          : isWeekend
                          ? 'bg-slate-100/30 dark:bg-slate-900/20'
                          : ''
                      }`}
                    />
                  );
                })}
              </div>

              {/* Individual Issue Horizontal Bars */}
              {filteredIssues.map(issue => {
                const project = projects.find(p => p.id === issue.projectId);
                const startOffset = getDayOffset(issue.startDate || '2026-11-05');
                const dueOffset = getDayOffset(issue.dueDate || '2026-11-12');
                const barLength = Math.max(1, dueOffset - startOffset + 1);

                const barLeft = Math.max(0, startOffset * 44);
                const barWidth = Math.max(44, barLength * 44 - 6);

                const completedSubtasks = issue.subtasks.filter(s => s.completed).length;
                const progressPercent =
                  issue.subtasks.length > 0
                    ? Math.round((completedSubtasks / issue.subtasks.length) * 100)
                    : issue.status === 'done'
                    ? 100
                    : 0;

                const isUrgent = issue.priority === 'urgent';

                return (
                  <div
                    key={issue.id}
                    className="h-12 flex items-center relative group"
                  >
                    {/* Horizontal Gantt Bar */}
                    <div
                      style={{
                        left: `${barLeft}px`,
                        width: `${barWidth}px`,
                      }}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`absolute h-7 rounded-md cursor-pointer shadow-xs border transition-all flex items-center px-2 select-none overflow-hidden ${
                        issue.status === 'done'
                          ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                          : isUrgent
                          ? 'bg-rose-600/20 border-rose-500/50 text-rose-700 dark:text-rose-300'
                          : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {/* Subtask Progress Fill */}
                      {progressPercent > 0 && (
                        <div
                          style={{ width: `${progressPercent}%` }}
                          className={`absolute left-0 top-0 bottom-0 opacity-25 ${
                            issue.status === 'done'
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500'
                          }`}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between w-full text-xs font-medium">
                        <span className="truncate pr-1 font-mono text-[11px]">
                          {issue.title}
                        </span>

                        <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                          {progressPercent > 0 && <span>{progressPercent}%</span>}
                          {isUrgent && <Flag className="w-2.5 h-2.5 text-rose-500" />}
                        </div>
                      </div>

                      {/* Interactive Drag Date Extender Left / Right */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateIssue(issue.id, {
                            startDate: adjustDate(issue.startDate, -1),
                          });
                        }}
                        className="absolute left-0 top-0 bottom-0 w-2 hover:bg-indigo-500/50 opacity-0 group-hover:opacity-100 cursor-w-resize"
                        title="向左前移1天"
                      />
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateIssue(issue.id, {
                            dueDate: adjustDate(issue.dueDate, 1),
                          });
                        }}
                        className="absolute right-0 top-0 bottom-0 w-2 hover:bg-indigo-500/50 opacity-0 group-hover:opacity-100 cursor-e-resize"
                        title="向右后延1天"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
