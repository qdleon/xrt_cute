export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'canceled';

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Issue {
  id: string; // e.g., 'ENG-101'
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  points: number; // 0, 1, 2, 3, 5, 8, 13
  assigneeId: string;
  projectId: string;
  cycleId?: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  department?: string; // e.g. '研发部', '市场部', '设计中心', '个人事务'
  notes?: string;      // 备注信息
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  icon: string;
  description: string;
  leadMemberId: string;
  color: string;
}

export interface Cycle {
  id: string;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  description: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  capacityPoints: number;
}

export interface Activity {
  id: string;
  issueId: string;
  memberId: string;
  action: string;
  details?: string;
  timestamp: string;
}

export type ViewMode = 'ledger' | 'kanban' | 'list' | 'gantt' | 'calendar' | 'cycles' | 'team';

export interface FilterState {
  search: string;
  priority: IssuePriority | 'all';
  status: IssueStatus | 'all';
  assigneeId: string | 'all';
  cycleId: string | 'all';
  projectId: string | 'all';
}
