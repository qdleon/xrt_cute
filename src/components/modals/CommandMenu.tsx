import {
  BarChart2,
  Calendar,
  Download,
  Folder,
  Kanban,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Sun,
  Table,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ViewMode } from '../../types/project';
import { getPriorityLabel } from '../common/PriorityIcon';
import { getStatusLabel, StatusIcon } from '../common/StatusIcon';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: '快捷操作' | '工作视图' | '团队项目' | '任务事项';
  icon: React.ReactNode;
  onSelect: () => void;
}

export const CommandMenu: React.FC = () => {
  const {
    isCommandMenuOpen,
    setIsCommandMenuOpen,
    issues,
    projects,
    setViewMode,
    setActiveProjectId,
    setIsNewIssueModalOpen,
    setSelectedIssueId,
    toggleTheme,
    theme,
    exportDataJSON,
    resetToSampleData,
  } = useProject();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isCommandMenuOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandMenuOpen]);

  const allItems = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Primary Actions
      {
        id: 'act-new-issue',
        title: '新建事项',
        subtitle: '极速录入弹窗 (按键 C)',
        category: '快捷操作',
        icon: <Plus className="w-4 h-4 text-indigo-500" />,
        onSelect: () => {
          setIsNewIssueModalOpen(true);
          setIsCommandMenuOpen(false);
        },
      },
      {
        id: 'act-toggle-theme',
        title: `切换为${theme === 'dark' ? '明亮' : '暗黑'}模式`,
        subtitle: '无缝切换界面对比度主题',
        category: '快捷操作',
        icon:
          theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          ),
        onSelect: () => {
          toggleTheme();
          setIsCommandMenuOpen(false);
        },
      },
      {
        id: 'act-export',
        title: '导出工作区 JSON 备份',
        subtitle: '下载本地完整数据文件',
        category: '快捷操作',
        icon: <Download className="w-4 h-4 text-emerald-500" />,
        onSelect: () => {
          exportDataJSON();
          setIsCommandMenuOpen(false);
        },
      },

      // View Navigation
      {
        id: 'view-kanban',
        title: '前往 看板视图',
        subtitle: '按状态列拖拽流转',
        category: '工作视图',
        icon: <Kanban className="w-4 h-4 text-slate-400" />,
        onSelect: () => {
          setViewMode('kanban');
          setIsCommandMenuOpen(false);
        },
      },
      {
        id: 'view-list',
        title: '前往 列表表格',
        subtitle: '高密度行内可编辑表格',
        category: '工作视图',
        icon: <Table className="w-4 h-4 text-slate-400" />,
        onSelect: () => {
          setViewMode('list');
          setIsCommandMenuOpen(false);
        },
      },
      {
        id: 'view-gantt',
        title: '前往 甘特图时间线',
        subtitle: '多周排期与工期把手调整',
        category: '工作视图',
        icon: <BarChart2 className="w-4 h-4 text-slate-400 rotate-90" />,
        onSelect: () => {
          setViewMode('gantt');
          setIsCommandMenuOpen(false);
        },
      },
      {
        id: 'view-calendar',
        title: '前往 日历排期',
        subtitle: '月度截止日全景日程',
        category: '工作视图',
        icon: <Calendar className="w-4 h-4 text-slate-400" />,
        onSelect: () => {
          setViewMode('calendar');
          setIsCommandMenuOpen(false);
        },
      },
      {
        id: 'view-cycles',
        title: '前往 冲刺迭代',
        subtitle: '迭代速率与燃尽进度分析',
        category: '工作视图',
        icon: <RotateCcw className="w-4 h-4 text-slate-400" />,
        onSelect: () => {
          setViewMode('cycles');
          setIsCommandMenuOpen(false);
        },
      },
      {
        id: 'view-team',
        title: '前往 团队负载',
        subtitle: '成员故事点容量与瓶颈评估',
        category: '工作视图',
        icon: <Users className="w-4 h-4 text-slate-400" />,
        onSelect: () => {
          setViewMode('team');
          setIsCommandMenuOpen(false);
        },
      },

      // Projects
      ...projects.map(p => ({
        id: `proj-${p.id}`,
        title: `切换项目：${p.name}`,
        subtitle: `标识符 ${p.key}`,
        category: '团队项目' as const,
        icon: <Folder className="w-4 h-4" style={{ color: p.color }} />,
        onSelect: () => {
          setActiveProjectId(p.id);
          setIsCommandMenuOpen(false);
        },
      })),

      // Recent / Top Issues
      ...issues.slice(0, 15).map(i => ({
        id: `issue-${i.id}`,
        title: `${i.id}：${i.title}`,
        subtitle: `${getStatusLabel(i.status)} · ${getPriorityLabel(i.priority)}优先级`,
        category: '任务事项' as const,
        icon: <StatusIcon status={i.status} size={14} />,
        onSelect: () => {
          setSelectedIssueId(i.id);
          setIsCommandMenuOpen(false);
        },
      })),
    ];

    return list;
  }, [
    issues,
    projects,
    theme,
    setViewMode,
    setActiveProjectId,
    setIsNewIssueModalOpen,
    setSelectedIssueId,
    toggleTheme,
    exportDataJSON,
    setIsCommandMenuOpen,
  ]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(idx => (idx + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(idx => (idx - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      setIsCommandMenuOpen(false);
    }
  };

  if (!isCommandMenuOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={() => setIsCommandMenuOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0c111a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="输入指令、搜索事项或快速切换视图..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={item.onSelect}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="shrink-0">{item.icon}</span>
                  <div className="truncate">
                    <span className="font-medium">{item.title}</span>
                    {item.subtitle && (
                      <span className="ml-2 text-slate-400 text-[11px]">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono tracking-wider shrink-0">
                  {item.category}
                </span>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              未找到匹配的指令或事项。
            </div>
          )}
        </div>

        {/* Palette Footer Help */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#070b12] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ 选择</span>
            <span>↵ 确认</span>
          </div>
          <span>极速指令面板 (Cmd+K)</span>
        </div>
      </div>
    </div>
  );
};
