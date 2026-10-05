import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  History,
  Server,
  Box,
  Settings,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    t,
    sessions,
    selectedSessionId,
    selectSession,
    createSession,
    deleteSession,
    renameSession,
    sessionSearchQuery,
    setSessionSearchQuery,
    navigateTo,
    runtimeStatus,
    downloadTasks,
  } = useApp();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState('');

  const activeDownloadsCount = downloadTasks.filter((t) => t.status === 'running' || t.status === 'queued').length;
  const isServerOnline = runtimeStatus === 'ready';

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(sessionSearchQuery.toLowerCase().trim())
  );

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingText(currentTitle);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingText.trim()) {
      renameSession(id, editingText.trim());
    }
    setEditingId(null);
  };

  const handleSelectSession = (id: string) => {
    selectSession(id);
    navigateTo('chat');
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleActionClick = (page: 'server' | 'models' | 'settings') => {
    navigateTo(page);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile scrim overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-76 bg-white dark:bg-[#0c1626] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header: Search & History & Close */}
        <div className="p-4 pb-2 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={sessionSearchQuery}
              onChange={(e) => setSessionSearchQuery(e.target.value)}
              placeholder={t.chatSearchHint}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-xs rounded-full border border-transparent focus:border-[#4C82FF] focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            onClick={() => {
              navigateTo('history');
              if (window.innerWidth < 1024) onClose();
            }}
            title={t.drawerAllHistoryTooltip}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-2">
          <button
            onClick={() => {
              createSession();
              navigateTo('chat');
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-[#4C82FF] hover:bg-[#3B6BF5] rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.chatNewSession}</span>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {sessionSearchQuery ? t.chatSessionNotFound : t.chatSessionEmpty}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = session.id === selectedSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-[#4C82FF] font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-[#4C82FF]" />
                  {isEditing ? (
                    <form
                      onSubmit={(e) => saveRename(session.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <input
                        autoFocus
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => saveRename(session.id)}
                        className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-slate-900 border border-[#4C82FF] rounded focus:outline-none"
                      />
                    </form>
                  ) : (
                    <span className="flex-1 truncate">{session.title}</span>
                  )}

                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 text-slate-400">
                      <button
                        onClick={(e) => startRename(session.id, session.title, e)}
                        title={t.chatRenameSessionTitle}
                        className="p-1 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        title={t.commonDelete}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 mx-3" />

        {/* Bottom Navigation Blocks */}
        <div className="p-3 space-y-2">
          {/* Server */}
          <button
            onClick={() => handleActionClick('server')}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Server className="w-4 h-4 text-slate-500" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#0c1626] ${
                    isServerOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </div>
              <span className="text-xs font-semibold">{t.drawerServer}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Model Management */}
          <button
            onClick={() => handleActionClick('models')}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Box className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold">{t.modelLibraryTitle}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {activeDownloadsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#4C82FF] text-white rounded-full">
                  {activeDownloadsCount}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleActionClick('settings')}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold">{t.drawerSettings}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
};
