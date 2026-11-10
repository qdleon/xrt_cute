import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Cycle } from '../../types/project';
import { MemberAvatar } from '../common/MemberAvatar';
import { StatusIcon } from '../common/StatusIcon';

export const CyclesView: React.FC = () => {
  const {
    cycles,
    issues,
    members,
    createCycle,
    updateCycleStatus,
    setSelectedIssueId,
  } = useProject();

  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleStart, setNewCycleStart] = useState('2026-12-02');
  const [newCycleEnd, setNewCycleEnd] = useState('2026-12-16');
  const [newCycleDesc, setNewCycleDesc] = useState('');

  const [completingCycleId, setCompletingCycleId] = useState<string | null>(null);
  const [rolloverTargetCycleId, setRolloverTargetCycleId] = useState<string>('');

  const activeCycle = cycles.find(c => c.status === 'active');
  const plannedCycles = cycles.filter(c => c.status === 'planned');
  const completedCycles = cycles.filter(c => c.status === 'completed');

  const getCycleMetrics = (cycle: Cycle) => {
    const cycleIssues = issues.filter(i => i.cycleId === cycle.id);
    const totalPoints = cycleIssues.reduce((acc, i) => acc + (i.points || 0), 0);
    const completedIssues = cycleIssues.filter(i => i.status === 'done');
    const completedPoints = completedIssues.reduce((acc, i) => acc + (i.points || 0), 0);
    const inProgressIssues = cycleIssues.filter(
      i => i.status === 'in_progress' || i.status === 'in_review'
    );
    const progressPercent = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    return {
      totalIssues: cycleIssues.length,
      totalPoints,
      completedIssuesCount: completedIssues.length,
      completedPoints,
      inProgressCount: inProgressIssues.length,
      progressPercent,
      cycleIssues,
    };
  };

  const handleCreateCycleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycleName.trim()) return;
    createCycle({
      name: newCycleName.trim(),
      startDate: newCycleStart,
      endDate: newCycleEnd,
      status: 'planned',
      description: newCycleDesc.trim() || '规划中的工程冲刺周期',
    });
    setNewCycleName('');
    setNewCycleDesc('');
    setIsNewCycleModalOpen(false);
  };

  const handleConfirmCompleteCycle = () => {
    if (!completingCycleId) return;
    updateCycleStatus(completingCycleId, 'completed', rolloverTargetCycleId || undefined);
    setCompletingCycleId(null);
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#070b12] p-8 overflow-y-auto min-h-[calc(100vh-105px)] space-y-8">
      {/* Active Sprint Hero Card */}
      {activeCycle ? (
        (() => {
          const metrics = getCycleMetrics(activeCycle);

          return (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      进行中冲刺
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {activeCycle.startDate} 至 {activeCycle.endDate}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {activeCycle.name}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                    {activeCycle.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCompletingCycleId(activeCycle.id);
                    setRolloverTargetCycleId(plannedCycles[0]?.id || '');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap self-start md:self-center"
                >
                  完成当前冲刺
                </button>
              </div>

              {/* Progress and Point Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">
                    交付进度达成率 ({metrics.completedPoints}/{metrics.totalPoints} 点)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {metrics.progressPercent}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${metrics.progressPercent}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Sprint Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">总计规划点数</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {metrics.totalPoints} 点
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">已交付点数</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {metrics.completedPoints} 点
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">进行中事项</div>
                  <div className="text-lg font-bold font-mono text-amber-500 tabular-nums">
                    {metrics.inProgressCount} 项
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">总事项数</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {metrics.totalIssues} 项
                  </div>
                </div>
              </div>

              {/* Active Sprint Issues Snapshot */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  本冲刺事项明细
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                  {metrics.cycleIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <StatusIcon status={issue.status} size={14} />
                        <span className="font-mono text-slate-400">{issue.id}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {issue.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 tabular-nums">
                          {issue.points} 点
                        </span>
                        <MemberAvatar
                          member={members.find(m => m.id === issue.assigneeId)}
                          size={18}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-sm text-slate-500">当前没有正在运行的冲刺。</p>
        </div>
      )}

      {/* Planned Cycles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              规划中的冲刺计划
            </h3>
            <p className="text-xs text-slate-500">已排期就绪、等待启动的后续迭代冲刺。</p>
          </div>
          <button
            onClick={() => setIsNewCycleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>规划新冲刺</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plannedCycles.map(cycle => {
            const metrics = getCycleMetrics(cycle);
            return (
              <div
                key={cycle.id}
                className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-semibold">
                    规划就绪
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {cycle.startDate} ~ {cycle.endDate}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {cycle.name}
                </h4>
                <p className="text-xs text-slate-500">{cycle.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-mono text-slate-500">
                    {metrics.totalIssues} 项事项 · {metrics.totalPoints} 预估点数
                  </span>
                  <button
                    onClick={() => updateCycleStatus(cycle.id, 'active')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>启动冲刺</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Sprints History */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          已完成的历史冲刺
        </h3>
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {completedCycles.map(cycle => {
            const metrics = getCycleMetrics(cycle);
            return (
              <div
                key={cycle.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {cycle.name}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({cycle.startDate} 至 {cycle.endDate})
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 ml-6">
                    {cycle.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-6 sm:ml-0 font-mono">
                  <span className="text-slate-500">
                    规划规模:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {metrics.totalPoints} 点
                    </strong>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    实际交付:{' '}
                    <strong>{metrics.completedPoints} 点</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan New Cycle Modal */}
      {isNewCycleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              规划新冲刺周期
            </h3>
            <form onSubmit={handleCreateCycleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  冲刺名称
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：迭代 30 — 性能压测与监控告警"
                  value={newCycleName}
                  onChange={e => setNewCycleName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    开始日期
                  </label>
                  <input
                    type="date"
                    required
                    value={newCycleStart}
                    onChange={e => setNewCycleStart(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    结束日期
                  </label>
                  <input
                    type="date"
                    required
                    value={newCycleEnd}
                    onChange={e => setNewCycleEnd(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  冲刺目标与范围说明
                </label>
                <textarea
                  rows={2}
                  value={newCycleDesc}
                  onChange={e => setNewCycleDesc(e.target.value)}
                  placeholder="本冲刺周期的核心交付成果与关键目标是什么？"
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCycleModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  创建冲刺
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Sprint & Rollover Modal */}
      {completingCycleId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              完成当前冲刺周期
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              确认将本冲刺标记为已完成？未完成的事项可以自动顺延并重新排期至下一个冲刺周期。
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                将未完成事项自动顺延至：
              </label>
              <select
                value={rolloverTargetCycleId}
                onChange={e => setRolloverTargetCycleId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
              >
                <option value="">不顺延 (保留在需求待办中)</option>
                {plannedCycles.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCompletingCycleId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCompleteCycle}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded"
              >
                确认完成冲刺
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
