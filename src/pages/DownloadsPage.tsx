import React from 'react';
import { useApp } from '../context/AppContext';
import { DownloadTask } from '../types/models';
import { EngineBadge, ModelFormatBadge } from '../components/CommonBadges';
import { FormatUtils } from '../utils/format';
import {
  Download,
  Pause,
  Play,
  XCircle,
  RefreshCw,
  HardDrive,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const DownloadsPage: React.FC = () => {
  const {
    t,
    downloadTasks,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    switchDownloadSource,
    orphanedStagingBytes,
    clearOrphanedStaging,
    navigateTo,
    showToast,
  } = useApp();

  const handleClearStaging = () => {
    clearOrphanedStaging();
    showToast('Staging cache cleared');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Download Manager
          </h1>
          <p className="text-xs text-slate-500">
            Monitor active weights downloads, pause/resume, and manage local storage
          </p>
        </div>

        {orphanedStagingBytes > 0 && (
          <button
            onClick={handleClearStaging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Staging ({FormatUtils.bytes(orphanedStagingBytes)})</span>
          </button>
        )}
      </div>

      {/* Task List */}
      {downloadTasks.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111A2E]/50 space-y-3">
          <Download className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No downloads in progress
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our curated model catalogue or open Hugging Face / ModelScope repositories to pull weights directly.
          </p>
          <button
            onClick={() => navigateTo('discover')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4C82FF] text-white hover:bg-[#3D6FE5]"
          >
            Discover Models
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {downloadTasks.map((task) => {
            const percent =
              task.totalBytes > 0
                ? Math.min(100, Math.round((task.receivedBytes / task.totalBytes) * 100))
                : 0;

            const isDone = task.status === 'completed' || task.status === 'downloaded';
            const isPaused = task.status === 'paused';
            const isRunning = task.status === 'running';
            const isFailed = task.status === 'failed';
            const remainingBytes = Math.max(0, task.totalBytes - task.receivedBytes);
            const etaSeconds =
              task.speedBytesPerSec > 0 ? Math.round(remainingBytes / task.speedBytesPerSec) : 0;

            return (
              <div
                key={task.id}
                className="bg-white dark:bg-[#111A2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <EngineBadge engine={task.engine} compact />
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {task.source === 'huggingFace' ? 'HF' : 'ModelScope'}
                      </span>
                      {task.quantLabel && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                          {task.quantLabel}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm sm:max-w-md">
                      {task.modelName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono truncate">{task.repoId}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {isDone && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                    {isRunning && (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#4C82FF] bg-[#4C82FF]/10 px-2.5 py-1 rounded-full">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Downloading ({percent}%)
                      </span>
                    )}
                    {isPaused && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full">
                        <Pause className="w-3.5 h-3.5" />
                        Paused
                      </span>
                    )}
                    {isFailed && (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isDone
                          ? 'bg-emerald-500'
                          : isFailed
                          ? 'bg-rose-500'
                          : isPaused
                          ? 'bg-amber-500'
                          : 'bg-[#4C82FF]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>
                      {FormatUtils.bytes(task.receivedBytes)} / {FormatUtils.bytes(task.totalBytes)}
                    </span>
                    {isRunning && (
                      <span>
                        {FormatUtils.speed(task.speedBytesPerSec)} • {FormatUtils.eta(etaSeconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => switchDownloadSource(task.id)}
                    className="text-xs text-slate-500 hover:text-[#4C82FF] flex items-center gap-1 font-medium transition-colors"
                    title="Switch between Hugging Face and ModelScope mirror"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Switch Mirror Source</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isRunning && (
                      <button
                        onClick={() => pauseDownload(task.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {isPaused && (
                      <button
                        onClick={() => resumeDownload(task.id)}
                        className="p-1.5 rounded-lg text-[#4C82FF] hover:bg-[#4C82FF]/10"
                        title="Resume"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                    {!isDone && (
                      <button
                        onClick={() => cancelDownload(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Cancel"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {isDone && (
                      <button
                        onClick={() => navigateTo('models')}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-[#4C82FF] hover:bg-[#4C82FF]/10"
                      >
                        View in Library &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
