import {
  BarChart2,
  Calendar as CalendarIcon,
  CheckCircle2,
  FileText,
  Filter,
  Kanban,
  Plus,
  RotateCcw,
  Search,
  Table,
  Users,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { IssuePriority, IssueStatus, ViewMode } from '../types/project';
import { PriorityIcon } from './common/PriorityIcon';
import { StatusIcon } from './common/StatusIcon';

export const TopHeader: React.FC = () => {
  const {
    projects,
    cycles,
    members,
    activeProjectId,
    activeCycleId,
    viewMode,
    setViewMode,
    filter,
    setFilter,
    filteredIssues,
    setIsNewIssueModalOpen,
  } = useProject();

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeCycle = cycles.find(c => c.id === activeCycleId);

  const hasActiveFilters =
    filter.search.trim() !== '' ||
    filter.priority !== 'all' ||
    filter.status !== 'all' ||
    filter.assigneeId !== 'all';

  const clearFilters = () => {
    setFilter(prev => ({
      ...prev,
      search: '',
      priority: 'all',
      status: 'all',
      assigneeId: 'all',
    }));
  };

  const completedCount = filteredIssues.filter(i => i.status === 'done').length;
  const inProgressCount = filteredIssues.filter(
    i => i.status === 'in_progress' || i.status === 'in_review'
  ).length;
  const totalPoints = filteredIssues.reduce((acc, curr) => acc + (curr.points || 0), 0);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] sticky top-0 z-30 transition-colors">
      {/* Top Bar Row: Breadcrumb & Actions */}
      <div className="h-14 px-6 flex items-center justify-between gap-4">
        {/* Breadcrumb Zone */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 dark:text-slate-500 font-medium">工作区</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold tracking-tight">
            {activeProject ? activeProject.name : '所有项目'}
          </span>
          {activeCycle && (
            <>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                迭代 {activeCycle.number}
              </span>
            </>
          )}
        </div>

        {/* Right Zone: Search, Filter & New Issue */}
        <div className="flex items-center gap-3">
          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索事项、标签、编号..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              className="w-48 sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all focus:w-72"
            />
            {filter.search && (
              <button
                onClick={() => setFilter(f => ({ ...f, search: '' }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                hasActiveFilters
                  ? 'border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>多维筛选</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>

            {/* Filter Menu Dropdown */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                  <span>筛选事项</span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-normal"
                    >
                      重置所有
                    </button>
                  )}
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    优先级
                  </label>
                  <select
                    value={filter.priority}
                    onChange={e =>
                      setFilter(f => ({
                        ...f,
                        priority: e.target.value as IssuePriority | 'all',
                      }))
                    }
                    className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">全部优先级</option>
                    <option value="urgent">紧急</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                    <option value="none">无优先级</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    事项状态
                  </label>
                  <select
                    value={filter.status}
                    onChange={e =>
                      setFilter(f => ({
                        ...f,
                        status: e.target.value as IssueStatus | 'all',
                      }))
                    }
                    className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">全部状态</option>
                    <option value="backlog">待规划</option>
                    <option value="todo">待处理</option>
                    <option value="in_progress">进行中</option>
                    <option value="in_review">评审中</option>
                    <option value="done">已完成</option>
                    <option value="canceled">已取消</option>
                  </select>
                </div>

                {/* Assignee Filter */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    负责人
                  </label>
                  <select
                    value={filter.assigneeId}
                    onChange={e =>
                      setFilter(f => ({ ...f, assigneeId: e.target.value }))
                    }
                    className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">全部成员</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-500"
                  >
                    完成
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Issue Primary Action */}
          <button
            onClick={() => setIsNewIssueModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建事项</span>
          </button>
        </div>
      </div>

      {/* Secondary Bar Row: View Selector & Inline Context Metrics */}
      <div className="px-6 py-2 bg-slate-50/60 dark:bg-[#0b0f17] border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4 overflow-x-auto">
        {/* Segmented View Switcher Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('ledger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'ledger'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>待办台账</span>
          </button>

          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>看板</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>列表</span>
          </button>

          <button
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'gantt'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 rotate-90" />
            <span>甘特图</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>日历</span>
          </button>

          <button
            onClick={() => setViewMode('cycles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'cycles'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>冲刺迭代</span>
          </button>

          <button
            onClick={() => setViewMode('team')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'team'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>团队负载</span>
          </button>
        </div>

        {/* Quiet Tabular Metadata (Anti-Slop Zero-Pill Standard) */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
          <span>
            共{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold font-mono">
              {filteredIssues.length}
            </strong>{' '}
            项事项
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span>
            <strong className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
              {inProgressCount}
            </strong>{' '}
            进行中
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              {completedCount}
            </strong>{' '}
            已完成
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span>
            <strong className="text-slate-800 dark:text-slate-200 font-semibold font-mono">
              {totalPoints}
            </strong>{' '}
            预估点数
          </span>
        </div>
      </div>
    </header>
  );
};
