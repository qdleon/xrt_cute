/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CommandMenu } from './components/modals/CommandMenu';
import { IssueDrawer } from './components/modals/IssueDrawer';
import { NewIssueModal } from './components/modals/NewIssueModal';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CalendarView } from './components/views/CalendarView';
import { CyclesView } from './components/views/CyclesView';
import { DailyTaskLedgerView } from './components/views/DailyTaskLedgerView';
import { GanttView } from './components/views/GanttView';
import { KanbanView } from './components/views/KanbanView';
import { ListView } from './components/views/ListView';
import { TeamWorkloadView } from './components/views/TeamWorkloadView';
import { ProjectProvider, useProject } from './context/ProjectContext';

const MainViewRenderer: React.FC = () => {
  const { viewMode } = useProject();

  switch (viewMode) {
    case 'ledger':
      return <DailyTaskLedgerView />;
    case 'kanban':
      return <KanbanView />;
    case 'list':
      return <ListView />;
    case 'gantt':
      return <GanttView />;
    case 'calendar':
      return <CalendarView />;
    case 'cycles':
      return <CyclesView />;
    case 'team':
      return <TeamWorkloadView />;
    default:
      return <DailyTaskLedgerView />;
  }
};

const WorkspaceLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* 240px Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <TopHeader />
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <MainViewRenderer />
        </div>
      </main>

      {/* Slide-out Issue Detail Inspector Drawer */}
      <IssueDrawer />

      {/* Fast Issue Composer Modal */}
      <NewIssueModal />

      {/* Global Command Palette (Cmd+K) */}
      <CommandMenu />
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <WorkspaceLayout />
    </ProjectProvider>
  );
}
