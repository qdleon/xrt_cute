import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Kanban,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Issue, IssuePriority, IssueStatus } from '../../types/project';
import { exportToCSV } from '../../utils/crypto';
import { PriorityIcon } from '../common/PriorityIcon';
import { StatusIcon } from '../common/StatusIcon';
import { CloudVaultModal } from '../modals/CloudVaultModal';

type TimeFilter = 'all' | 'week' | 'month' | 'year';
type LedgerStatusFilter = 'all' | 'pending' | 'overdue' | 'completed';

export const DailyTaskLedgerView: React.FC = () => {
  const {
    issues,
    projects,
    updateIssue,
    deleteIssue,
    setSelectedIssueId,
    setIsNewIssueModalOpen,
    viewMode,
    setViewMode,
  } = useProject();

  // Filter States
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<LedgerStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cloud Vault Modal state
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultDefaultTab, setVaultDefaultTab] = useState<'backup' | 'restore' | 'export' | 'history'>('backup');
  const [cloudSyncSuccessToast, setCloudSyncSuccessToast] = useState<string | null>(null);

  // Today reference date: 2026-11-09
  const todayStr = '2026-11-09';
  const todayDate = new Date(todayStr);

  // Date formatting for header
  const chineseWeekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const formattedDate = `2026 年 11 月 9 日 ${chineseWeekdays[todayDate.getDay()]}`;

  // Helper to test if date is in range
  const isDateInRange = (dateStr?: string, range?: TimeFilter) => {
    if (!dateStr || range === 'all') return true;
    const itemDate = new Date(dateStr);
    const diffDays = Math.round((itemDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));

    if (range === 'week') {
      return diffDays >= -7 && diffDays <= 7;
    }
    if (range === 'month') {
      return diffDays >= -30 && diffDays <= 30;
    }
    if (range === 'year') {
      return diffDays >= -180 && diffDays <= 180;
    }
    return true;
  };

  // Helper for overdue check
  const isIssueOverdue = (issue: Issue) => {
    if (issue.status === 'done' || issue.status === 'canceled') return false;
    if (!issue.dueDate) return false;
    return issue.dueDate < todayStr;
  };

  // Helper for due in 7 days check
  const isDueWithin7Days = (issue: Issue) => {
    if (issue.status === 'done' || issue.status === 'canceled') return false;
    if (!issue.dueDate) return false;
    const diff = Math.round(
      (new Date(issue.dueDate).getTime() - todayDate.getTime()) / (1000 * 3600 * 24)
    );
    return diff >= 0 && diff <= 7;
  };

  // 4 Top Metrics
  const pendingCount = issues.filter(i => i.status !== 'done' && i.status !== 'canceled').length;
  const overdueCount = issues.filter(isIssueOverdue).length;
  const due7DaysCount = issues.filter(isDueWithin7Days).length;
  const completedCount = issues.filter(i => i.status === 'done').length;

  const dueTodayCount = issues.filter(
    i => i.dueDate === todayStr && i.status !== 'done' && i.status !== 'canceled'
  ).length;

  // Filtered Ledger list
  const filteredLedgerIssues = useMemo(() => {
    return issues.filter(issue => {
      // Time scope
      if (!isDateInRange(issue.dueDate || issue.startDate, timeFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter === 'pending') {
        if (issue.status === 'done' || issue.status === 'canceled') return false;
      } else if (statusFilter === 'overdue') {
        if (!isIssueOverdue(issue)) return false;
      } else if (statusFilter === 'completed') {
        if (issue.status !== 'done') return false;
      }

      // Search query (title, department, project, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const project = projects.find(p => p.id === issue.projectId);
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchDept = (issue.department || '').toLowerCase().includes(q);
        const matchProj = (project?.name || '').toLowerCase().includes(q);
        const matchNotes = (issue.notes || issue.description || '').toLowerCase().includes(q);
        const matchId = issue.id.toLowerCase().includes(q);
        if (!matchTitle && !matchDept && !matchProj && !matchNotes && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [issues, timeFilter, statusFilter, searchQuery, projects]);

  const handleQuickCloudSync = () => {
    setVaultDefaultTab('backup');
    setIsVaultOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredLedgerIssues, `待办台账_${new Date().toISOString().slice(0, 10)}.csv`);
    setCloudSyncSuccessToast('已成功导出 CSV 台账明细表！');
    setTimeout(() => setCloudSyncSuccessToast(null), 3000);
  };

  return (
    <div className="flex-1 bg-[#FBFBFA] dark:bg-[#070b12] overflow-y-auto min-h-[calc(100vh-105px)] p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-4xl space-y-5">
        {/* Toast alert */}
        {cloudSyncSuccessToast && (
          <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs flex items-center justify-between shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{cloudSyncSuccessToast}</span>
            </div>
            <button onClick={() => setCloudSyncSuccessToast(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. Top Daily Ledger Header Banner (Recreating screenshot design) */}
        <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#D7E3FC] via-[#DEE8FD] to-[#E9F0FD] dark:from-[#17233a] dark:via-[#131d31] dark:to-[#0f172a] border border-[#BACDF3] dark:border-indigo-900/60 shadow-xs space-y-4">
          {/* Header Top Row: Icon + Title + Action Pill Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-indigo-200/60 dark:border-indigo-700/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  待办台账
                </h1>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                  DAILY TASK LEDGER
                </span>
              </div>
            </div>

            {/* Action Pill Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleQuickCloudSync}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300/70 dark:border-slate-700 shadow-xs transition-all hover:scale-102"
                title="开启云端加密同步"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>云同步</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300/70 dark:border-slate-700 shadow-xs transition-all hover:scale-102"
              >
                导出 CSV
              </button>

              <button
                onClick={() => {
                  setVaultDefaultTab('backup');
                  setIsVaultOpen(true);
                }}
                className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300/70 dark:border-slate-700 shadow-xs transition-all hover:scale-102"
              >
                备份
              </button>

              <button
                onClick={() => {
                  setVaultDefaultTab('restore');
                  setIsVaultOpen(true);
                }}
                className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300/70 dark:border-slate-700 shadow-xs transition-all hover:scale-102"
              >
                恢复
              </button>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-indigo-200/90 dark:border-indigo-800/60" />

          {/* Date & Alert Line */}
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <span>{formattedDate}</span>
            <span className="text-slate-400">|</span>
            <span
              className={
                dueTodayCount > 0
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }
            >
              {dueTodayCount > 0 ? `今天有 ${dueTodayCount} 项到期事项待处理` : '今天没有到期事项'}
            </span>
          </div>
        </div>

        {/* 2. Four Metric Summary Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Card 1: 待办中 */}
          <div
            onClick={() => setStatusFilter('pending')}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs hover:shadow-sm ${
              statusFilter === 'pending'
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {pendingCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              待办中
            </div>
          </div>

          {/* Card 2: 已逾期 */}
          <div
            onClick={() => setStatusFilter('overdue')}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs hover:shadow-sm ${
              statusFilter === 'overdue'
                ? 'border-rose-500 ring-2 ring-rose-500/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                overdueCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
              }`}
            >
              {overdueCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              已逾期
            </div>
          </div>

          {/* Card 3: 7天内到期 */}
          <div
            onClick={() => setStatusFilter('pending')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm cursor-pointer transition-all"
          >
            <div
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                due7DaysCount > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
              }`}
            >
              {due7DaysCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              7 天内到期
            </div>
          </div>

          {/* Card 4: 已完成 */}
          <div
            onClick={() => setStatusFilter('completed')}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs hover:shadow-sm ${
              statusFilter === 'completed'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                completedCount > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
              }`}
            >
              {completedCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              已完成
            </div>
          </div>
        </div>

        {/* 3. View Switcher Tabs & New Task Button */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              事项列表
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              日历视图
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              看板视图
            </button>
          </div>

          <button
            onClick={() => setIsNewIssueModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-xs transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>+ 新增事项</span>
          </button>
        </div>

        {/* 4. Time Range Filter: 全部 / 周 / 月 / 年 */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-fit text-xs font-medium">
          {(['all', 'week', 'month', 'year'] as TimeFilter[]).map(t => {
            const labels: Record<TimeFilter, string> = {
              all: '全部',
              week: '周',
              month: '月',
              year: '年',
            };
            return (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  timeFilter === t
                    ? 'bg-indigo-500 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>

        {/* 5. Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="搜索事项、部门、备注..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 6. Status Pills & Count */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { id: 'all', label: '全部' },
                { id: 'pending', label: '待办中' },
                { id: 'overdue', label: '已逾期' },
                { id: 'completed', label: '已完成' },
              ] as { id: LedgerStatusFilter; label: string }[]
            ).map(s => {
              const isActive = statusFilter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-blue-100 dark:bg-indigo-950 text-blue-700 dark:text-indigo-300 border-blue-300 dark:border-indigo-800 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            共 {filteredLedgerIssues.length} 条
          </div>
        </div>

        {/* 7. Task Ledger Items Stack OR Empty State */}
        {filteredLedgerIssues.length > 0 ? (
          <div className="space-y-2.5">
            {filteredLedgerIssues.map(issue => {
              const isOverdue = isIssueOverdue(issue);
              const isDone = issue.status === 'done';
              const project = projects.find(p => p.id === issue.projectId);

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all hover:shadow-xs cursor-pointer flex items-start gap-3.5 ${
                    isDone
                      ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80'
                      : isOverdue
                      ? 'border-rose-300/80 dark:border-rose-900/50 bg-rose-50/20'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/60'
                  }`}
                >
                  {/* Complete Checkbox */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateIssue(issue.id, {
                        status: isDone ? 'todo' : 'done',
                      });
                    }}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  {/* Task Main Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm font-semibold text-slate-900 dark:text-white leading-snug truncate ${
                          isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {issue.title}
                      </h3>

                      <PriorityIcon priority={issue.priority} size={14} />
                    </div>

                    {/* Department, notes, and tags */}
                    {(issue.notes || issue.description) && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {issue.notes || issue.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      {/* Department / Category */}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {issue.department || project?.name || '个人事务'}
                      </span>

                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>

                      {/* Due date status */}
                      {issue.dueDate && (
                        <span
                          className={`font-mono flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : isDueWithin7Days(issue)
                              ? 'text-amber-600 dark:text-amber-400 font-medium'
                              : 'text-slate-500'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{issue.dueDate}</span>
                          {isOverdue && <span>(已逾期)</span>}
                        </span>
                      )}

                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>

                      <span className="font-mono text-slate-400">{issue.id}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`确认删除事项 ${issue.title}？`)) {
                        deleteIssue(issue.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                    title="删除事项"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State (Matching Screenshot Content) */
          <div className="py-14 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-xs">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              台账还是空的
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              点右上角「新增事项」，在里面的智能粘贴框粘贴通知或截图。所有字段都可以留空。
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsNewIssueModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-xs transition-colors"
              >
                + 立即新增首条事项
              </button>
            </div>
          </div>
        )}

        {/* Security / Encryption Status Footer Banner */}
        <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>数据安全保障：端到端 AES-256-GCM 本地加密 + 云端容灾持久化</span>
          </div>
          <button
            onClick={() => {
              setVaultDefaultTab('backup');
              setIsVaultOpen(true);
            }}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            管理云端加密保险箱 →
          </button>
        </div>
      </div>

      {/* Cloud Encryption & Restore Modal */}
      <CloudVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        defaultTab={vaultDefaultTab}
      />
    </div>
  );
};
