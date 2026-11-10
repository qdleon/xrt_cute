import {
  FileText,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { IssuePriority, IssueStatus } from '../../types/project';
import { getPriorityLabel, PriorityIcon } from '../common/PriorityIcon';
import { getStatusLabel, StatusIcon } from '../common/StatusIcon';

export const NewIssueModal: React.FC = () => {
  const {
    projects,
    cycles,
    members,
    activeProjectId,
    activeCycleId,
    isNewIssueModalOpen,
    setIsNewIssueModalOpen,
    newIssueInitialStatus,
    setNewIssueInitialStatus,
    newIssueInitialDate,
    setNewIssueInitialDate,
    createIssue,
    setSelectedIssueId,
  } = useProject();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('个人事务');
  const [projectId, setProjectId] = useState(
    activeProjectId !== 'all' ? activeProjectId : projects[0]?.id || ''
  );
  const [cycleId, setCycleId] = useState(
    activeCycleId !== 'all' ? activeCycleId : cycles.find(c => c.status === 'active')?.id || ''
  );
  const [status, setStatus] = useState<IssueStatus>('todo');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [points, setPoints] = useState(3);
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [startDate, setStartDate] = useState('2026-11-09');

  // Smart paste state
  const [smartPasteText, setSmartPasteText] = useState('');
  const [pastedImagePreview, setPastedImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (newIssueInitialStatus) {
      setStatus(newIssueInitialStatus);
    }
  }, [newIssueInitialStatus]);

  useEffect(() => {
    if (newIssueInitialDate) {
      setDueDate(newIssueInitialDate);
      setStartDate(newIssueInitialDate);
    }
  }, [newIssueInitialDate]);

  if (!isNewIssueModalOpen) return null;

  // Intelligent parser for pasted notification text
  const handleSmartParse = (rawText: string) => {
    if (!rawText.trim()) return;
    setSmartPasteText(rawText);

    // 1. Try to extract Title
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let extractedTitle = lines[0] || '';
    extractedTitle = extractedTitle.replace(/^(【.*?】|\[.*?\]|事项[:：]|任务[:：]|关于[:：])/, '').trim();
    if (extractedTitle.length > 50) extractedTitle = extractedTitle.slice(0, 50) + '...';
    if (!title) setTitle(extractedTitle);

    // 2. Try to extract Department
    if (/研发|技术|前端|后端|架构|开发/i.test(rawText)) setDepartment('研发部');
    else if (/设计|UI|UX|视觉/i.test(rawText)) setDepartment('设计系统');
    else if (/测试|QA|质量/i.test(rawText)) setDepartment('质量工程');
    else if (/市场|商务|运营/i.test(rawText)) setDepartment('市场部');

    // 3. Try to extract Priority
    if (/紧急|加急|严重|立即|尽快|ASAP/i.test(rawText)) setPriority('urgent');
    else if (/重要|高优|优先/i.test(rawText)) setPriority('high');

    // 4. Try to extract Due date
    const dateMatch = rawText.match(/(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?|\d{1,2}月\d{1,2}日)/);
    if (dateMatch) {
      const dStr = dateMatch[1];
      if (dStr.includes('年') || dStr.includes('-')) {
        const normalized = dStr.replace(/[年月日]/g, '-').replace(/-$/, '');
        setDueDate(normalized);
      }
    }

    // Set remaining text into description
    if (!description) setDescription(rawText.trim());
  };

  const handlePasteEvent = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = ev => {
              setPastedImagePreview(ev.target?.result as string);
              if (!title) setTitle('截图任务事项 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = title.trim() || '未命名事项';

    const created = createIssue({
      title: finalTitle,
      description: description.trim(),
      department: department.trim(),
      notes: smartPasteText ? '智能解析自通知' : undefined,
      status,
      priority,
      points,
      assigneeId,
      projectId: projectId || projects[0]?.id,
      cycleId: cycleId || undefined,
      startDate,
      dueDate,
      subtasks: [],
      tags: [department || '个人事务'],
    });

    handleClose();
    setSelectedIssueId(created.id);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSmartPasteText('');
    setPastedImagePreview(null);
    setNewIssueInitialStatus(undefined);
    setNewIssueInitialDate(undefined);
    setIsNewIssueModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0c111a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 my-8"
        onClick={e => e.stopPropagation()}
        onPaste={handlePasteEvent}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              新增待办事项
            </span>
            <span className="text-xs text-slate-400">· 支持智能识别与字段留空</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Smart Paste Box (As highlighted in screenshot empty state) */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>智能粘贴框（直接粘贴通知、群消息或截图，所有字段皆可留空）</span>
              </span>
            </div>

            <textarea
              rows={2}
              placeholder="在此粘贴通知文本（自动提取标题/部门/截止期），或直接 Ctrl+V 粘贴截图..."
              value={smartPasteText}
              onChange={e => handleSmartParse(e.target.value)}
              className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            {pastedImagePreview && (
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-indigo-200 dark:border-slate-800 text-xs">
                <img
                  src={pastedImagePreview}
                  alt="Pasted screenshot"
                  className="w-10 h-10 object-cover rounded"
                />
                <span className="text-[11px] text-slate-500 flex-1 truncate">
                  已接收剪贴板截图
                </span>
                <button
                  type="button"
                  onClick={() => setPastedImagePreview(null)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              事项标题
            </label>
            <input
              type="text"
              autoFocus
              placeholder="例如：准备季度敏捷交付总结报告（可留空自动命名）"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                部门 / 业务分类
              </label>
              <input
                type="text"
                placeholder="例如：核心研发部、设计、财务"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                截止日期
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Core Properties Matrix */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-xs">
            {/* Status */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                初始状态
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as IssueStatus)}
                className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="todo">待处理 (待办中)</option>
                <option value="in_progress">进行中</option>
                <option value="in_review">评审中</option>
                <option value="backlog">待规划储备</option>
                <option value="done">已完成</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                优先级
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as IssuePriority)}
                className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="medium">中</option>
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="low">低</option>
                <option value="none">无优先级</option>
              </select>
            </div>

            {/* Points */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                预估点数
              </label>
              <select
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
                className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
              >
                {[0, 1, 2, 3, 5, 8, 13].map(pt => (
                  <option key={pt} value={pt}>
                    {pt > 0 ? `${pt} 点` : '留空'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              事项详情与备忘备注
            </label>
            <textarea
              rows={2}
              placeholder="可填写详细工作说明、交付物链接或备注..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono">
              按 Enter 快速保存
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-xs transition-colors"
              >
                确认新增
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
