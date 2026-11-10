import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  UserCheck,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Member } from '../../types/project';
import { MemberAvatar } from '../common/MemberAvatar';
import { PriorityIcon } from '../common/PriorityIcon';
import { StatusIcon } from '../common/StatusIcon';

export const TeamWorkloadView: React.FC = () => {
  const {
    members,
    filteredIssues,
    projects,
    setSelectedIssueId,
  } = useProject();

  const [expandedMemberIds, setExpandedMemberIds] = useState<string[]>(
    members.map(m => m.id)
  );

  const toggleExpand = (id: string) => {
    setExpandedMemberIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#070b12] p-8 overflow-y-auto min-h-[calc(100vh-105px)] space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          团队成员负载与资源容量
        </h2>
        <p className="text-xs text-slate-500">
          实时监控各成员故事点排期负荷，防止冲刺周期出现单点瓶颈与交付延期。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {members.map(member => {
          const assignedIssues = filteredIssues.filter(i => i.assigneeId === member.id);
          const totalAssignedPoints = assignedIssues.reduce(
            (acc, curr) => acc + (curr.points || 0),
            0
          );
          const completedPoints = assignedIssues
            .filter(i => i.status === 'done')
            .reduce((acc, curr) => acc + (curr.points || 0), 0);
          const inProgressCount = assignedIssues.filter(
            i => i.status === 'in_progress' || i.status === 'in_review'
          ).length;

          const loadPercent = Math.round(
            (totalAssignedPoints / member.capacityPoints) * 100
          );
          const isOverloaded = loadPercent > 100;
          const isNearCapacity = loadPercent >= 80 && loadPercent <= 100;
          const isExpanded = expandedMemberIds.includes(member.id);

          return (
            <div
              key={member.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs"
            >
              {/* Header row */}
              <div
                onClick={() => toggleExpand(member.id)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <MemberAvatar member={member} size={36} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {member.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        · {member.role}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{member.department}</span>
                  </div>
                </div>

                {/* Capacity Gauges */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="w-36 sm:w-48 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">
                        {totalAssignedPoints} / {member.capacityPoints} 点容量
                      </span>
                      <span
                        className={`font-semibold ${
                          isOverloaded
                            ? 'text-rose-500'
                            : isNearCapacity
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {loadPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, loadPercent)}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOverloaded
                            ? 'bg-rose-500'
                            : isNearCapacity
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono tabular-nums text-slate-500 hidden sm:block">
                    <div>
                      共{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {assignedIssues.length}
                      </strong>{' '}
                      项任务
                    </div>
                    <div className="text-[11px] text-indigo-500">
                      {inProgressCount} 项进行中
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible assigned issues list */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {assignedIssues.map(issue => {
                    const proj = projects.find(p => p.id === issue.projectId);
                    return (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="py-2 px-3 flex items-center justify-between text-xs hover:bg-white dark:hover:bg-slate-800/60 rounded-md cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <StatusIcon status={issue.status} size={13} />
                          <span className="font-mono text-[11px] text-slate-400">
                            {issue.id}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {issue.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <PriorityIcon priority={issue.priority} size={13} />
                          <span className="font-mono text-slate-500 text-[11px] tabular-nums">
                            {issue.points} 点
                          </span>
                          {proj && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: proj.color }}
                              title={proj.name}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {assignedIssues.length === 0 && (
                    <div className="py-4 text-center text-xs text-slate-400">
                      当前暂无分配的事项。
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
