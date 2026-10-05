import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LogChannel, LogLevel } from '../types/models';
import {
  Terminal,
  Trash2,
  Copy,
  Search,
  Filter,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';

export const ServerLogsPage: React.FC = () => {
  const { t, logs, clearLogs, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'all' | LogChannel>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | LogLevel>('all');
  const [autoScroll, setAutoScroll] = useState(true);

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (selectedChannel !== 'all' && log.channel !== selectedChannel) return false;
    if (selectedLevel !== 'all' && log.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.channel.toLowerCase().includes(q) ||
        log.timestamp.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.channel.toUpperCase()}] [${l.level.toUpperCase()}]: ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast('Logs copied to clipboard');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#4C82FF]" />
            <span>Server Logs</span>
          </h1>
          <p className="text-xs text-slate-500">
            {filteredLogs.length} entries • Live engine stdout/stderr and system orchestration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2.5 pb-4 shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#4C82FF]"
          />
        </div>

        {/* Channel Filter */}
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value as any)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100"
        >
          <option value="all">All Channels</option>
          <option value="server">Server</option>
          <option value="engine">Engine</option>
          <option value="model">Model</option>
          <option value="download">Download</option>
        </select>

        {/* Level Filter */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as any)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100"
        >
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="debug">Debug</option>
        </select>

        {/* Auto scroll toggle */}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            autoScroll
              ? 'bg-[#4C82FF]/10 text-[#4C82FF] border border-[#4C82FF]/30'
              : 'bg-white dark:bg-[#111A2E] text-slate-500 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Auto-scroll</span>
        </button>
      </div>

      {/* Terminal Output */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-2xl border border-slate-800 shadow-inner space-y-1.5 selection:bg-[#4C82FF]/30"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic py-8 text-center">
            No log entries match the current filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const timeStr = log.timestamp.split('T')[1]?.slice(0, 8) || log.timestamp;
            const levelColor =
              log.level === 'error'
                ? 'text-rose-400 bg-rose-950/60 font-semibold'
                : log.level === 'warning'
                ? 'text-amber-400'
                : log.level === 'debug'
                ? 'text-purple-400'
                : 'text-emerald-400';

            return (
              <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/60 p-0.5 rounded-sm">
                <span className="text-slate-600 shrink-0 select-none">{timeStr}</span>
                <span className="text-slate-500 uppercase shrink-0 text-[10px] w-14">
                  [{log.channel}]
                </span>
                <span className={`uppercase shrink-0 text-[10px] px-1 rounded-xs ${levelColor}`}>
                  {log.level}
                </span>
                <span className="break-all whitespace-pre-wrap leading-relaxed text-slate-300 flex-1">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
