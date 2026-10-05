import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { NavigationSidebar } from './components/NavigationSidebar';
import { ChatPage } from './pages/ChatPage';
import { ServerPage } from './pages/ServerPage';
import { ServerConfigPage } from './pages/ServerConfigPage';
import { ServerLogsPage } from './pages/ServerLogsPage';
import { ModelManagementPage } from './pages/ModelManagementPage';
import { ModelDiscoveryPage } from './pages/ModelDiscoveryPage';
import { HubRepoPage } from './pages/HubRepoPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { EngineBadge } from './components/CommonBadges';
import {
  Menu,
  MessageSquare,
  Server,
  FolderOpen,
  Compass,
  Download,
  Settings,
  Terminal,
  Sun,
  Moon,
  Info,
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    activePage,
    navigateTo,
    runtimeStatus,
    activeEngine,
    isDark,
    themeMode,
    setThemeMode,
    toastMessage,
    downloadTasks,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isServerRunning = runtimeStatus === 'ready';
  const activeDownloadsCount = downloadTasks.filter(
    (t: any) => t.status === 'running' || t.status === 'downloading' || t.status === 'queued'
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFC] dark:bg-[#091120] text-slate-900 dark:text-slate-100 font-sans">
      {/* Push / Overlay Sidebar */}
      <NavigationSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Application Bar */}
        <header className="h-14 sm:h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0E172A]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Name */}
            <div
              onClick={() => navigateTo('chat')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <img
                src="/assets/app_icon.svg"
                alt="ServLlama Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                ServLlama
              </span>
            </div>
          </div>

          {/* Quick Nav Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl">
            <button
              onClick={() => navigateTo('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePage === 'chat'
                  ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => navigateTo('server')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePage === 'server' || activePage === 'serverConfig' || activePage === 'serverLogs'
                  ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Server</span>
              {isServerRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => navigateTo('models')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePage === 'models'
                  ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Models</span>
            </button>

            <button
              onClick={() => navigateTo('discover')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePage === 'discover' || activePage === 'repoDetail'
                  ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => navigateTo('downloads')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                activePage === 'downloads'
                  ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Downloads</span>
              {activeDownloadsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#4C82FF] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeDownloadsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Header Status Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <EngineBadge engine={activeEngine} compact />
              <div
                onClick={() => navigateTo('server')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                  isServerRunning
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-300 dark:border-slate-700 text-slate-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isServerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{isServerRunning ? 'Online' : 'Stopped'}</span>
              </div>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings Link */}
            <button
              onClick={() => navigateTo('settings')}
              className={`p-2 rounded-xl transition-colors ${
                activePage === 'settings'
                  ? 'text-[#4C82FF] bg-[#4C82FF]/10'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activePage === 'chat' && <ChatPage onOpenSidebar={() => setSidebarOpen(true)} />}
          {activePage === 'server' && <ServerPage />}
          {activePage === 'serverConfig' && <ServerConfigPage />}
          {activePage === 'serverLogs' && <ServerLogsPage />}
          {activePage === 'models' && <ModelManagementPage />}
          {activePage === 'discover' && <ModelDiscoveryPage />}
          {activePage === 'repoDetail' && <HubRepoPage />}
          {activePage === 'downloads' && <DownloadsPage />}
          {activePage === 'settings' && <SettingsPage />}
          {activePage === 'about' && <AboutPage />}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
