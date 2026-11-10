import { CheckSquare, Clock, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Issue, IssueStatus } from '../../types/project';
import { MemberAvatar } from '../common/MemberAvatar';
import { PriorityIcon } from '../common/PriorityIcon';
import { StatusIcon } from '../common/StatusIcon';

interface KanbanColumnDef {
  status: IssueStatus;
  title: string;
}

const COLUMNS: KanbanColumnDef[] = [
  { status: 'backlog', title: '待规划' },
  { status: 'todo', title: '待处理' },
  { status: 'in_progress', title: '进行中' },
  { status: 'in_review', title: '评审中' },
  { status: 'done', title: '已完成' },
];

export const KanbanView: React.FC = () => {
  const {
    filteredIssues,
    projects,
    members,
    updateIssue,
    setSelectedIssueId,
    setIsNewIssueModalOpen,
    setNewIssueInitialStatus,
  } = useProject();

  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<IssueStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIssueId(id);
  };

  const handleDragEnd = () => {
    setDraggedIssueId(null);
    setActiveDropColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    if (activeDropColumn === status) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      updateIssue(issueId, { status: newStatus });
    }
    setDraggedIssueId(null);
    setActiveDropColumn(null);
  };

  const handleAddInColumn = (status: IssueStatus) => {
    setNewIssueInitialStatus(status);
    setIsNewIssueModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-x-auto p-6 bg-slate-100/50 dark:bg-[#070a0f] min-h-[calc(100vh-105px)]">
      <div className="flex items-start gap-4 h-full min-w-max pb-4">
        {COLUMNS.map(column => {
          const colIssues = filteredIssues.filter(i => i.status === column.status);
          const colPoints = colIssues.reduce((acc, i) => acc + (i.points || 0), 0);
          const isDropActive = activeDropColumn === column.status;

          return (
            <div
              key={column.status}
              onDragOver={e => handleDragOver(e, column.status)}
              onDragLeave={e => handleDragLeave(e, column.status)}
              onDrop={e => handleDrop(e, column.status)}
              className={`w-72 flex flex-col rounded-lg bg-slate-200/50 dark:bg-slate-900/40 border transition-all ${
                isDropActive
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-200/80 dark:border-slate-800/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <StatusIcon status={column.status} size={15} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {column.title}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {colIssues.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                    {colPoints} 点
                  </span>
                  <button
                    onClick={() => handleAddInColumn(column.status)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                    title={`在 ${column.title} 中添加事项`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Column Issues Stack */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-210px)] min-h-[140px]">
                {colIssues.map(issue => {
                  const project = projects.find(p => p.id === issue.projectId);
                  const assignee = members.find(m => m.id === issue.assigneeId);
                  const isBeingDragged = draggedIssueId === issue.id;
                  const completedSubtasks = issue.subtasks.filter(s => s.completed).length;
                  const hasSubtasks = issue.subtasks.length > 0;

                  return (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={e => handleDragStart(e, issue.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`group p-3 rounded-md bg-white dark:bg-[#121824] border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer shadow-xs transition-all hover:shadow-sm ${
                        isBeingDragged ? 'opacity-40 scale-98' : 'opacity-100'
                      }`}
                    >
                      {/* Top Row: Key & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {project && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: project.color }}
                              title={project.name}
                            />
                          )}
                          <span className="font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {issue.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <PriorityIcon priority={issue.priority} size={13} />
                          {issue.points > 0 && (
                            <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                              {issue.points}点
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {issue.title}
                      </h4>

                      {/* Bottom Metadata: Subtasks, Due Date, Assignee */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          {hasSubtasks && (
                            <span
                              className={`flex items-center gap-1 font-mono text-[10px] ${
                                completedSubtasks === issue.subtasks.length
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              <CheckSquare className="w-3 h-3" />
                              <span>
                                {completedSubtasks}/{issue.subtasks.length}
                              </span>
                            </span>
                          )}

                          {issue.dueDate && (
                            <span
                              className="flex items-center gap-1 font-mono text-[10px]"
                              title={`截止日期 ${issue.dueDate}`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>{issue.dueDate.slice(5)}</span>
                            </span>
                          )}
                        </div>

                        <MemberAvatar member={assignee} size={18} />
                      </div>
                    </div>
                  );
                })}

                {colIssues.length === 0 && (
                  <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-md text-slate-400 dark:text-slate-600 text-xs">
                    <span>暂无事项</span>
                    <button
                      onClick={() => handleAddInColumn(column.status)}
                      className="mt-1 text-[11px] text-indigo-500 hover:underline"
                    >
                      + 创建事项
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Quick Add Footer */}
              <div className="p-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  onClick={() => handleAddInColumn(column.status)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加事项</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
