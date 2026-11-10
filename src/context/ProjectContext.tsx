import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { INITIAL_CYCLES, INITIAL_ISSUES, INITIAL_MEMBERS, INITIAL_PROJECTS } from '../data/mockData';
import {
  Activity,
  Cycle,
  FilterState,
  Issue,
  IssuePriority,
  IssueStatus,
  Member,
  Project,
  ViewMode,
} from '../types/project';

interface ProjectContextType {
  issues: Issue[];
  projects: Project[];
  cycles: Cycle[];
  members: Member[];
  activities: Activity[];
  activeProjectId: string | 'all';
  setActiveProjectId: (id: string | 'all') => void;
  activeCycleId: string | 'all';
  setActiveCycleId: (id: string | 'all') => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  isNewIssueModalOpen: boolean;
  setIsNewIssueModalOpen: (open: boolean) => void;
  isCommandMenuOpen: boolean;
  setIsCommandMenuOpen: (open: boolean) => void;
  newIssueInitialDate: string | undefined;
  setNewIssueInitialDate: (date: string | undefined) => void;
  newIssueInitialStatus: IssueStatus | undefined;
  setNewIssueInitialStatus: (status: IssueStatus | undefined) => void;

  // Actions
  createIssue: (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Issue;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  toggleSubtask: (issueId: string, subtaskId: string) => void;
  addSubtask: (issueId: string, title: string) => void;
  deleteSubtask: (issueId: string, subtaskId: string) => void;
  createProject: (projectData: Omit<Project, 'id'>) => Project;
  createCycle: (cycleData: Omit<Cycle, 'id' | 'number'>) => Cycle;
  updateCycleStatus: (cycleId: string, status: 'planned' | 'active' | 'completed', rolloverToCycleId?: string) => void;
  resetToSampleData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;

  // Computed
  filteredIssues: Issue[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ISSUES: 'apexflow_issues_v1',
  PROJECTS: 'apexflow_projects_v1',
  CYCLES: 'apexflow_cycles_v1',
  MEMBERS: 'apexflow_members_v1',
  ACTIVITIES: 'apexflow_activities_v1',
  THEME: 'apexflow_theme_v1',
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Linear default is sleek dark
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State with localStorage hydration
  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ISSUES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse issues from localStorage', e);
      }
    }
    return INITIAL_ISSUES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse projects from localStorage', e);
      }
    }
    return INITIAL_PROJECTS;
  });

  const [cycles, setCycles] = useState<Cycle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CYCLES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cycles from localStorage', e);
      }
    }
    return INITIAL_CYCLES;
  });

  const [members] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse members from localStorage', e);
      }
    }
    return INITIAL_MEMBERS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse activities from localStorage', e);
      }
    }
    return [
      {
        id: 'act-1',
        issueId: 'ENG-101',
        memberId: 'mem-1',
        action: '移动至 进行中',
        details: '实现看板卡片原生拖拽的乐观状态即时更新',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  // Workspace View & Filter Navigation
  const [activeProjectId, setActiveProjectId] = useState<string | 'all'>('all');
  const [activeCycleId, setActiveCycleId] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('ledger');

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    priority: 'all',
    status: 'all',
    assigneeId: 'all',
    cycleId: 'all',
    projectId: 'all',
  });

  // Modals & Panels
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [newIssueInitialDate, setNewIssueInitialDate] = useState<string | undefined>(undefined);
  const [newIssueInitialStatus, setNewIssueInitialStatus] = useState<IssueStatus | undefined>(undefined);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsNewIssueModalOpen(true);
      } else if (e.key === '0') {
        setViewMode('ledger');
      } else if (e.key === '1') {
        setViewMode('kanban');
      } else if (e.key === '2') {
        setViewMode('list');
      } else if (e.key === '3') {
        setViewMode('gantt');
      } else if (e.key === '4') {
        setViewMode('calendar');
      } else if (e.key === '5') {
        setViewMode('cycles');
      } else if (e.key === '6') {
        setViewMode('team');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Issues computation
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Project filter (sidebar level)
      if (activeProjectId !== 'all' && issue.projectId !== activeProjectId) {
        return false;
      }

      // Cycle filter (sidebar level)
      if (activeCycleId !== 'all' && issue.cycleId !== activeCycleId) {
        return false;
      }

      // In-view Project filter
      if (filter.projectId !== 'all' && issue.projectId !== filter.projectId) {
        return false;
      }

      // In-view Cycle filter
      if (filter.cycleId !== 'all' && issue.cycleId !== filter.cycleId) {
        return false;
      }

      // Status filter
      if (filter.status !== 'all' && issue.status !== filter.status) {
        return false;
      }

      // Priority filter
      if (filter.priority !== 'all' && issue.priority !== filter.priority) {
        return false;
      }

      // Assignee filter
      if (filter.assigneeId !== 'all' && issue.assigneeId !== filter.assigneeId) {
        return false;
      }

      // Text search (search in id, title, description, tags)
      if (filter.search.trim()) {
        const query = filter.search.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesId = issue.id.toLowerCase().includes(query);
        const matchesDesc = issue.description.toLowerCase().includes(query);
        const matchesTag = issue.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesId && !matchesDesc && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [issues, activeProjectId, activeCycleId, filter]);

  // Actions
  const createIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Issue => {
    const project = projects.find(p => p.id === issueData.projectId) || projects[0];
    const prefix = project ? project.key : 'ENG';
    const existingIds = issues
      .filter(i => i.id.startsWith(prefix))
      .map(i => parseInt(i.id.replace(`${prefix}-`, ''), 10))
      .filter(n => !isNaN(n));
    const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 101;
    const newId = `${prefix}-${nextNumber}`;

    const newIssue: Issue = {
      ...issueData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIssues(prev => [newIssue, ...prev]);

    // Record activity
    const activity: Activity = {
      id: `act-${Date.now()}`,
      issueId: newId,
      memberId: issueData.assigneeId || 'mem-1',
      action: '创建了事项',
      details: newIssue.title,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [activity, ...prev]);

    return newIssue;
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues(prev =>
      prev.map(issue => {
        if (issue.id === id) {
          const updated = {
            ...issue,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          // Record activity if status changed
          if (updates.status && updates.status !== issue.status) {
            const statusNames: Record<string, string> = {
              backlog: '待规划',
              todo: '待处理',
              in_progress: '进行中',
              in_review: '评审中',
              done: '已完成',
              canceled: '已取消',
            };
            const act: Activity = {
              id: `act-${Date.now()}-${Math.random()}`,
              issueId: id,
              memberId: issue.assigneeId || 'mem-1',
              action: `变更状态为「${statusNames[updates.status] || updates.status}」`,
              timestamp: new Date().toISOString(),
            };
            setActivities(a => [act, ...a]);
          }

          return updated;
        }
        return issue;
      })
    );
  };

  const deleteIssue = (id: string) => {
    setIssues(prev => prev.filter(i => i.id !== id));
    if (selectedIssueId === id) {
      setSelectedIssueId(null);
    }
  };

  const toggleSubtask = (issueId: string, subtaskId: string) => {
    setIssues(prev =>
      prev.map(issue => {
        if (issue.id === issueId) {
          const updatedSubtasks = issue.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return {
            ...issue,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
          };
        }
        return issue;
      })
    );
  };

  const addSubtask = (issueId: string, title: string) => {
    if (!title.trim()) return;
    setIssues(prev =>
      prev.map(issue => {
        if (issue.id === issueId) {
          const newSubtask = {
            id: `sub-${Date.now()}`,
            title: title.trim(),
            completed: false,
          };
          return {
            ...issue,
            subtasks: [...issue.subtasks, newSubtask],
            updatedAt: new Date().toISOString(),
          };
        }
        return issue;
      })
    );
  };

  const deleteSubtask = (issueId: string, subtaskId: string) => {
    setIssues(prev =>
      prev.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            subtasks: issue.subtasks.filter(st => st.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          };
        }
        return issue;
      })
    );
  };

  const createProject = (projectData: Omit<Project, 'id'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const createCycle = (cycleData: Omit<Cycle, 'id' | 'number'>): Cycle => {
    const nextNumber = cycles.length > 0 ? Math.max(...cycles.map(c => c.number)) + 1 : 1;
    const newCycle: Cycle = {
      ...cycleData,
      id: `cycle-${Date.now()}`,
      number: nextNumber,
    };
    setCycles(prev => [...prev, newCycle]);
    return newCycle;
  };

  const updateCycleStatus = (
    cycleId: string,
    status: 'planned' | 'active' | 'completed',
    rolloverToCycleId?: string
  ) => {
    setCycles(prev =>
      prev.map(cycle => {
        if (cycle.id === cycleId) {
          return { ...cycle, status };
        }
        // If activating this cycle, mark other active cycles as completed or planned
        if (status === 'active' && cycle.status === 'active' && cycle.id !== cycleId) {
          return { ...cycle, status: 'completed' };
        }
        return cycle;
      })
    );

    // If completing and rolling over uncompleted issues:
    if (status === 'completed' && rolloverToCycleId) {
      setIssues(prev =>
        prev.map(issue => {
          if (issue.cycleId === cycleId && issue.status !== 'done' && issue.status !== 'canceled') {
            return {
              ...issue,
              cycleId: rolloverToCycleId,
              updatedAt: new Date().toISOString(),
            };
          }
          return issue;
        })
      );
    }
  };

  const resetToSampleData = () => {
    setIssues(INITIAL_ISSUES);
    setProjects(INITIAL_PROJECTS);
    setCycles(INITIAL_CYCLES);
    localStorage.removeItem(STORAGE_KEYS.ISSUES);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.CYCLES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  };

  const exportDataJSON = () => {
    const payload = {
      issues,
      projects,
      cycles,
      members,
      activities,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.issues)) setIssues(data.issues);
      if (Array.isArray(data.projects)) setProjects(data.projects);
      if (Array.isArray(data.cycles)) setCycles(data.cycles);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data', e);
      return false;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        issues,
        projects,
        cycles,
        members,
        activities,
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
        selectedIssueId,
        setSelectedIssueId,
        isNewIssueModalOpen,
        setIsNewIssueModalOpen,
        isCommandMenuOpen,
        setIsCommandMenuOpen,
        newIssueInitialDate,
        setNewIssueInitialDate,
        newIssueInitialStatus,
        setNewIssueInitialStatus,

        createIssue,
        updateIssue,
        deleteIssue,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        createProject,
        createCycle,
        updateCycleStatus,
        resetToSampleData,
        exportDataJSON,
        importDataJSON,

        filteredIssues,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
