import {
  Calendar,
  CheckSquare,
  Clock,
  Layers,
  MoreVertical,
  Plus,
  RotateCcw,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { IssuePriority, IssueStatus } from '../../types/project';
import { MemberAvatar } from '../common/MemberAvatar';
import { getPriorityLabel, PriorityIcon } from '../common/PriorityIcon';
import { getStatusLabel, StatusIcon } from '../common/StatusIcon';

export const IssueDrawer: React.FC = () => {
  const {
    issues,
    projects,
    cycles,
    members,
    activities,
    selectedIssueId,
    setSelectedIssueId,
    updateIssue,
    deleteIssue,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
  } = useProject();

  const issue = issues.find(i => i.id === selectedIssueId);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  useEffect(() => {
    if (issue) {
      setTitleDraft(issue.title);
      setDescDraft(issue.description);
    }
  }, [issue]);

  if (!issue) return null;

  const project = projects.find(p => p.id === issue.projectId);
  const cycle = cycles.find(c => c.id === issue.cycleId);
  const assignee = members.find(m => m.id === issue.assigneeId);
  const issueActivities = activities.filter(a => a.issueId === issue.id);

  const handleSaveTitle = () => {
    if (titleDraft.trim()) {
      updateIssue(issue.id, { title: titleDraft.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    updateIssue(issue.id, { description: descDraft.trim() });
    setIsEditingDesc(false);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(issue.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const completedSubtasks = issue.subtasks.filter(s => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0c111a] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {project && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
            )}
            <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
              {issue.id}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {project?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`确认删除事项 ${issue.id}？`)) {
                  deleteIssue(issue.id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="删除事项"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedIssueId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="关闭详情 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Area */}
          <div>
            {isEditingTitle ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                  className="w-full text-base font-semibold px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-indigo-500 rounded text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-base font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 p-1 -ml-1 rounded transition-colors"
                title="点击编辑事项标题"
              >
                {issue.title}
              </h2>
            )}
          </div>

          {/* Quick Attribute Property Grid */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">事项状态</span>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={issue.status} size={14} />
                <select
                  value={issue.status}
                  onChange={e =>
                    updateIssue(issue.id, { status: e.target.value as IssueStatus })
                  }
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="backlog">待规划</option>
                  <option value="todo">待处理</option>
                  <option value="in_progress">进行中</option>
                  <option value="in_review">评审中</option>
                  <option value="done">已完成</option>
                  <option value="canceled">已取消</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">优先级</span>
              <div className="flex items-center gap-1.5">
                <PriorityIcon priority={issue.priority} size={14} />
                <select
                  value={issue.priority}
                  onChange={e =>
                    updateIssue(issue.id, {
                      priority: e.target.value as IssuePriority,
                    })
                  }
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="urgent">紧急</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                  <option value="none">无优先级</option>
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">负责人</span>
              <div className="flex items-center gap-1.5">
                <MemberAvatar member={assignee} size={16} />
                <select
                  value={issue.assigneeId}
                  onChange={e =>
                    updateIssue(issue.id, { assigneeId: e.target.value })
                  }
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate max-w-[120px]"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimate Points */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">预估点数</span>
              <select
                value={issue.points}
                onChange={e =>
                  updateIssue(issue.id, { points: Number(e.target.value) })
                }
                className="bg-transparent font-mono font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {[0, 1, 2, 3, 5, 8, 13].map(pt => (
                  <option key={pt} value={pt}>
                    {pt > 0 ? `${pt} 点` : '未评估'}
                  </option>
                ))}
              </select>
            </div>

            {/* Sprint Cycle */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">所属迭代</span>
              <select
                value={issue.cycleId || ''}
                onChange={e =>
                  updateIssue(issue.id, { cycleId: e.target.value || undefined })
                }
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate max-w-[130px]"
              >
                <option value="">未关联周期</option>
                {cycles.map(c => (
                  <option key={c.id} value={c.id}>
                    迭代 {c.number}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">截止日期</span>
              <input
                type="date"
                value={issue.dueDate || ''}
                onChange={e => updateIssue(issue.id, { dueDate: e.target.value })}
                className="bg-transparent font-mono text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              事项描述
            </label>
            {isEditingDesc ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={descDraft}
                  onChange={e => setDescDraft(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-indigo-500 rounded-md text-slate-900 dark:text-white focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingDesc(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveDesc}
                    className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded font-medium hover:bg-indigo-500"
                  >
                    保存描述
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDesc(true)}
                className="p-3 rounded-md bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                title="点击编辑事项描述"
              >
                {issue.description || '暂无详细描述，点击添加内容...'}
              </div>
            )}
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>子任务清单</span>
                <span className="font-mono text-slate-400 font-normal">
                  ({completedSubtasks}/{issue.subtasks.length})
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-1.5">
              {issue.subtasks.map(st => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 text-xs group"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(issue.id, st.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={`${
                        st.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>

                  <button
                    onClick={() => deleteSubtask(issue.id, st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="删除子任务"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="添加新的子任务..."
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded transition-colors"
              >
                添加
              </button>
            </form>
          </div>

          {/* Activity Audit Log */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              操作活动历史
            </span>
            <div className="space-y-2">
              {issueActivities.map(act => (
                <div
                  key={act.id}
                  className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono"
                >
                  <span className="text-slate-400 font-normal">
                    {new Date(act.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>
                    <strong className="text-slate-700 dark:text-slate-300 font-sans">
                      {act.action}
                    </strong>
                    {act.details && ` · ${act.details}`}
                  </span>
                </div>
              ))}
              <div className="text-[11px] text-slate-400 font-mono">
                创建于 {new Date(issue.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
