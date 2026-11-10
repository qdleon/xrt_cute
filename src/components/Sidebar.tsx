import {
  Archive,
  BarChart2,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  FolderPlus,
  Kanban,
  Layers,
  LayoutGrid,
  Moon,
  Palette,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Sun,
  Table,
  Upload,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewMode } from '../types/project';

export const Sidebar: React.FC = () => {
  const {
    projects,
    cycles,
    issues,
    activeProjectId,
    setActiveProjectId,
    activeCycleId,
    setActiveCycleId,
    viewMode,
    setViewMode,
    filter,
    setFilter,
    theme,
    toggleTheme,
    createProject,
    resetToSampleData,
    exportDataJSON,
    importDataJSON,
    setIsNewIssueModalOpen,
    setIsCommandMenuOpen,
  } = useProject();

  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isCyclesOpen, setIsCyclesOpen] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3B82F6');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  const activeCycle = cycles.find(c => c.status === 'active');

  const getProjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-4 h-4" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'Palette':
        return <Palette className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const key = newProjectKey.trim().toUpperCase() || newProjectName.slice(0, 3).toUpperCase();
    const created = createProject({
      name: newProjectName.trim(),
      key,
      icon: 'Layers',
      description: '自定义团队项目',
      leadMemberId: 'mem-1',
      color: newProjectColor,
    });
    setActiveProjectId(created.id);
    setNewProjectName('');
    setNewProjectKey('');
    setIsNewProjectModalOpen(false);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    const success = importDataJSON(importJsonText);
    if (success) {
      setIsImportModalOpen(false);
      setImportJsonText('');
    } else {
      setImportError('JSON 格式解析失败，请检查备份文件内容是否完整。');
    }
  };

  return (
    <>
      <aside className="w-64 bg-slate-900 dark:bg-[#0d1117] text-slate-200 border-r border-slate-800 dark:border-neutral-800/80 flex flex-col h-screen select-none shrink-0 transition-colors">
        {/* Workspace Brand Zone */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 dark:border-neutral-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              AF
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white">ApexFlow</span>
              <span className="text-[10px] text-slate-400">研发协同工作区</span>
            </div>
          </div>
          <button
            onClick={() => setIsCommandMenuOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="搜索与命令菜单 (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* Quick Issue Composer Trigger */}
          <div className="px-1">
            <button
              onClick={() => setIsNewIssueModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm"
            >
              <span>+ 新建事项</span>
              <kbd className="text-[10px] bg-indigo-700/60 px-1.5 py-0.5 rounded font-mono text-indigo-200">
                C
              </kbd>
            </button>
          </div>

          {/* Primary View Modes */}
          <div className="space-y-0.5">
            <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              工作视图
            </div>

            <button
              onClick={() => setViewMode('ledger')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'ledger'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>待办台账</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">0</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Kanban className="w-4 h-4 text-slate-400" />
                <span>看板视图</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">1</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-slate-400" />
                <span>列表表格</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">2</span>
            </button>

            <button
              onClick={() => setViewMode('gantt')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-400 rotate-90" />
                <span>甘特图时间线</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">3</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span>日历排期</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">4</span>
            </button>

            <button
              onClick={() => setViewMode('cycles')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'cycles'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>迭代冲刺</span>
              </div>
              {activeCycle && (
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-mono">
                  迭代 {activeCycle.number}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode('team')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'team'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>团队负载</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">6</span>
            </button>
          </div>

          {/* Projects Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1">
              <button
                onClick={() => setIsProjectsOpen(p => !p)}
                className="flex items-center gap-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase hover:text-slate-200"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isProjectsOpen ? '' : '-rotate-90'}`}
                />
                <span>项目列表</span>
              </button>
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                title="新建项目"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isProjectsOpen && (
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveProjectId('all')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    activeProjectId === 'all'
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                    <span className="truncate">所有项目</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {issues.length}
                  </span>
                </button>

                {projects.map(proj => {
                  const count = issues.filter(i => i.projectId === proj.id).length;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => setActiveProjectId(proj.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                        activeProjectId === proj.id
                          ? 'bg-slate-800 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color }}
                        />
                        <span className="truncate">{proj.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sprints / Cycles Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1">
              <button
                onClick={() => setIsCyclesOpen(p => !p)}
                className="flex items-center gap-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase hover:text-slate-200"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isCyclesOpen ? '' : '-rotate-90'}`}
                />
                <span>迭代冲刺周期</span>
              </button>
            </div>

            {isCyclesOpen && (
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveCycleId('all')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    activeCycleId === 'all'
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span className="truncate">全部迭代</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {issues.length}
                  </span>
                </button>

                {cycles.map(cycle => {
                  const cycleIssues = issues.filter(i => i.cycleId === cycle.id);
                  return (
                    <button
                      key={cycle.id}
                      onClick={() => {
                        setActiveCycleId(cycle.id);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                        activeCycleId === cycle.id
                          ? 'bg-slate-800 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            cycle.status === 'active'
                              ? 'bg-emerald-400'
                              : cycle.status === 'planned'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                        />
                        <span className="truncate">迭代 {cycle.number}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {cycleIssues.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer: Theme, Backup, Reset */}
        <div className="p-3 border-t border-slate-800 dark:border-neutral-800/80 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="切换明亮 / 暗黑主题"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>明亮模式</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>暗黑模式</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={exportDataJSON}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="导出工作区 JSON 备份"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="导入 JSON 备份数据"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm('确认将工作区重置为初始示例数据？')) {
                    resetToSampleData();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                title="重置为初始示例数据"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 px-1 flex items-center justify-between font-mono">
            <span>按 Cmd+K 呼出指令菜单</span>
          </div>
        </div>
      </aside>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              创建新项目
            </h3>
            <form onSubmit={handleCreateProjectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  项目名称
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：数据分析引擎"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  项目标识 Key（事项编号前缀）
                </label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="例如：DATA"
                  value={newProjectKey}
                  onChange={e => setNewProjectKey(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  项目主题色
                </label>
                <div className="flex items-center gap-2">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProjectColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        newProjectColor === color
                          ? 'border-indigo-500 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  创建项目
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-lg w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              导入工作区数据备份
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              请在下方粘贴之前导出的 JSON 备份文本，以恢复项目、事项及迭代冲刺计划。
            </p>
            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={8}
                required
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder='{"issues": [...], "projects": [...]}'
                className="w-full p-2.5 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {importError && (
                <div className="text-xs text-rose-500 font-medium">{importError}</div>
              )}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  确认导入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
