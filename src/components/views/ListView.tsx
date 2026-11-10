import {
  ArrowDownUp,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Issue, IssuePriority, IssueStatus } from '../../types/project';
import { MemberAvatar } from '../common/MemberAvatar';
import { getPriorityLabel, PriorityIcon } from '../common/PriorityIcon';
import { getStatusLabel, StatusIcon } from '../common/StatusIcon';

type GroupBy = 'status' | 'priority' | 'project' | 'none';
type SortField = 'id' | 'title' | 'priority' | 'status' | 'points' | 'dueDate';

interface GroupSection {
  key: string;
  title: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  color?: string;
  issues: Issue[];
}

export const ListView: React.FC = () => {
  const {
    filteredIssues,
    projects,
    cycles,
    members,
    updateIssue,
    deleteIssue,
    setSelectedIssueId,
  } = useProject();

  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);

  // Inline Popover states
  const [activeStatusMenuId, setActiveStatusMenuId] = useState<string | null>(null);
  const [activePriorityMenuId, setActivePriorityMenuId] = useState<string | null>(null);
  const [activeAssigneeMenuId, setActiveAssigneeMenuId] = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const priorityWeight: Record<IssuePriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
    none: 0,
  };

  const statusWeight: Record<IssueStatus, number> = {
    backlog: 0,
    todo: 1,
    in_progress: 2,
    in_review: 3,
    done: 4,
    canceled: 5,
  };

  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      let diff = 0;
      switch (sortField) {
        case 'id':
          diff = a.id.localeCompare(b.id);
          break;
        case 'title':
          diff = a.title.localeCompare(b.title);
          break;
        case 'priority':
          diff = priorityWeight[b.priority] - priorityWeight[a.priority];
          break;
        case 'status':
          diff = statusWeight[a.status] - statusWeight[b.status];
          break;
        case 'points':
          diff = (a.points || 0) - (b.points || 0);
          break;
        case 'dueDate':
          diff = (a.dueDate || '').localeCompare(b.dueDate || '');
          break;
      }
      return sortOrder === 'asc' ? diff : -diff;
    });
  }, [filteredIssues, sortField, sortOrder]);

  // Grouping mapping
  const groupedSections = useMemo<GroupSection[]>(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', title: '全部事项', issues: sortedIssues }];
    }

    if (groupBy === 'status') {
      const statuses: IssueStatus[] = ['in_progress', 'todo', 'in_review', 'backlog', 'done', 'canceled'];
      return statuses
        .map(st => ({
          key: st,
          title: getStatusLabel(st),
          status: st,
          issues: sortedIssues.filter(i => i.status === st),
        }))
        .filter(sec => sec.issues.length > 0);
    }

    if (groupBy === 'priority') {
      const priorities: IssuePriority[] = ['urgent', 'high', 'medium', 'low', 'none'];
      return priorities
        .map(pr => ({
          key: pr,
          title: getPriorityLabel(pr),
          priority: pr,
          issues: sortedIssues.filter(i => i.priority === pr),
        }))
        .filter(sec => sec.issues.length > 0);
    }

    if (groupBy === 'project') {
      return projects
        .map(p => ({
          key: p.id,
          title: p.name,
          color: p.color,
          issues: sortedIssues.filter(i => i.projectId === p.id),
        }))
        .filter(sec => sec.issues.length > 0);
    }

    return [{ key: 'all', title: '事项列表', issues: sortedIssues }];
  }, [sortedIssues, groupBy, projects]);

  const toggleSelectAll = () => {
    if (selectedIssueIds.length === filteredIssues.length) {
      setSelectedIssueIds([]);
    } else {
      setSelectedIssueIds(filteredIssues.map(i => i.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIssueIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBatchStatus = (newStatus: IssueStatus) => {
    selectedIssueIds.forEach(id => updateIssue(id, { status: newStatus }));
    setSelectedIssueIds([]);
  };

  const handleBatchDelete = () => {
    if (confirm(`确认删除选中的 ${selectedIssueIds.length} 项事项？`)) {
      selectedIssueIds.forEach(id => deleteIssue(id));
      setSelectedIssueIds([]);
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#090d14] p-6 overflow-y-auto min-h-[calc(100vh-105px)]">
      {/* Control Bar: Group By & Batch Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>分组方式:</span>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as GroupBy)}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="status">按状态分组</option>
              <option value="priority">按优先级分组</option>
              <option value="project">按项目分组</option>
              <option value="none">不分组</option>
            </select>
          </div>
        </div>

        {/* Batch selection floating bar */}
        {selectedIssueIds.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-md text-xs">
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
              已选中 {selectedIssueIds.length} 项
            </span>
            <div className="h-3 w-px bg-indigo-300 dark:bg-indigo-700" />
            <button
              onClick={() => handleBatchStatus('done')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              标记为已完成
            </button>
            <button
              onClick={() => handleBatchStatus('in_progress')}
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              设为进行中
            </button>
            <button
              onClick={handleBatchDelete}
              className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>删除</span>
            </button>
          </div>
        )}
      </div>

      {/* High-Density Spreadsheet Table */}
      <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {/* Table Header Row */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 select-none">
          <div className="col-span-1 flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                filteredIssues.length > 0 &&
                selectedIssueIds.length === filteredIssues.length
              }
              onChange={toggleSelectAll}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <button
              onClick={() => toggleSort('priority')}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            >
              <span>优先级</span>
              <ArrowDownUp className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="col-span-1">
            <button
              onClick={() => toggleSort('id')}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            >
              <span>编号</span>
              <ArrowDownUp className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="col-span-5">
            <button
              onClick={() => toggleSort('title')}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            >
              <span>事项标题</span>
              <ArrowDownUp className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="col-span-2">
            <button
              onClick={() => toggleSort('status')}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            >
              <span>状态</span>
              <ArrowDownUp className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="col-span-1">
            <button
              onClick={() => toggleSort('points')}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            >
              <span>预估</span>
              <ArrowDownUp className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="col-span-1">
            <button
              onClick={() => toggleSort('dueDate')}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            >
              <span>截止</span>
              <ArrowDownUp className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="col-span-1 text-right">负责人</div>
        </div>

        {/* Grouped Sections */}
        {groupedSections.map(section => (
          <div key={section.key} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0">
            {/* Section Header */}
            <div className="px-4 py-1.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                {section.status && <StatusIcon status={section.status} size={14} />}
                {section.priority && <PriorityIcon priority={section.priority} size={14} />}
                {section.color && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: section.color }}
                  />
                )}
                <span>{section.title}</span>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  ({section.issues.length})
                </span>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {section.issues.map(issue => {
                const project = projects.find(p => p.id === issue.projectId);
                const assignee = members.find(m => m.id === issue.assigneeId);
                const isSelected = selectedIssueIds.includes(issue.id);
                const subtasksCount = issue.subtasks.length;
                const completedSubtasks = issue.subtasks.filter(s => s.completed).length;

                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox & Inline Priority */}
                    <div
                      className="col-span-1 flex items-center gap-2 relative"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => toggleSelectOne(issue.id, e as unknown as React.MouseEvent)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() =>
                          setActivePriorityMenuId(
                            activePriorityMenuId === issue.id ? null : issue.id
                          )
                        }
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title={`当前优先级：${getPriorityLabel(issue.priority)} (点击快速切换)`}
                      >
                        <PriorityIcon priority={issue.priority} size={14} />
                      </button>

                      {/* Priority Inline Picker Popover */}
                      {activePriorityMenuId === issue.id && (
                        <div className="absolute left-6 top-6 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-50 p-1 space-y-0.5">
                          {(['urgent', 'high', 'medium', 'low', 'none'] as IssuePriority[]).map(
                            pr => (
                              <button
                                key={pr}
                                onClick={() => {
                                  updateIssue(issue.id, { priority: pr });
                                  setActivePriorityMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                              >
                                <PriorityIcon priority={pr} size={13} />
                                <span>{getPriorityLabel(pr)}</span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* ID */}
                    <div className="col-span-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {issue.id}
                    </div>

                    {/* Title & Subtasks */}
                    <div className="col-span-5 flex items-center gap-2 truncate">
                      <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {issue.title}
                      </span>
                      {subtasksCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                          <CheckSquare className="w-2.5 h-2.5" />
                          <span>
                            {completedSubtasks}/{subtasksCount}
                          </span>
                        </span>
                      )}
                      {project && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                          title={project.name}
                        />
                      )}
                    </div>

                    {/* Inline Status */}
                    <div
                      className="col-span-2 relative"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setActiveStatusMenuId(
                            activeStatusMenuId === issue.id ? null : issue.id
                          )
                        }
                        className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-700 dark:text-slate-300"
                      >
                        <StatusIcon status={issue.status} size={14} />
                        <span className="truncate text-xs">
                          {getStatusLabel(issue.status)}
                        </span>
                      </button>

                      {/* Status Inline Picker Popover */}
                      {activeStatusMenuId === issue.id && (
                        <div className="absolute left-0 top-7 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-50 p-1 space-y-0.5">
                          {(
                            ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'canceled'] as IssueStatus[]
                          ).map(st => (
                            <button
                              key={st}
                              onClick={() => {
                                updateIssue(issue.id, { status: st });
                                setActiveStatusMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                            >
                              <StatusIcon status={st} size={13} />
                              <span>{getStatusLabel(st)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Points Estimate */}
                    <div
                      className="col-span-1 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400"
                      onClick={e => e.stopPropagation()}
                    >
                      <select
                        value={issue.points}
                        onChange={e =>
                          updateIssue(issue.id, { points: Number(e.target.value) })
                        }
                        className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 py-0.5 focus:outline-none cursor-pointer"
                      >
                        {[0, 1, 2, 3, 5, 8, 13].map(pt => (
                          <option key={pt} value={pt} className="dark:bg-slate-900">
                            {pt > 0 ? `${pt} 点` : '-'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {issue.dueDate ? issue.dueDate.slice(5) : '-'}
                    </div>

                    {/* Inline Assignee */}
                    <div
                      className="col-span-1 flex justify-end relative"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setActiveAssigneeMenuId(
                            activeAssigneeMenuId === issue.id ? null : issue.id
                          )
                        }
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title={assignee ? assignee.name : '未指派'}
                      >
                        <MemberAvatar member={assignee} size={20} />
                      </button>

                      {/* Assignee Inline Popover */}
                      {activeAssigneeMenuId === issue.id && (
                        <div className="absolute right-0 top-7 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-50 p-1 space-y-0.5">
                          {members.map(m => (
                            <button
                              key={m.id}
                              onClick={() => {
                                updateIssue(issue.id, { assigneeId: m.id });
                                setActiveAssigneeMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                            >
                              <MemberAvatar member={m} size={16} />
                              <span className="truncate">{m.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {sortedIssues.length === 0 && (
          <div className="p-12 text-center text-slate-400 dark:text-slate-600 text-xs">
            当前筛选条件下无匹配的事项。
          </div>
        )}
      </div>
    </div>
  );
};
