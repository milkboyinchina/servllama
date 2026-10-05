import React from 'react';
import { useApp } from '../context/AppContext';
import { ThemeModeOption, LocaleModeOption, HuggingFaceRoute } from '../types/models';
import { FormatUtils } from '../utils/format';
import {
  Moon,
  Sun,
  Globe,
  Wifi,
  Download,
  Clock,
  HardDrive,
  Info,
  Layers,
  ChevronRight,
  Shield,
  Trash2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    t,
    themeMode,
    setThemeMode,
    localeMode,
    setLocaleMode,
    chatTimeoutSeconds,
    setChatTimeoutSeconds,
    downloadSettings,
    updateDownloadSettings,
    orphanedStagingBytes,
    clearOrphanedStaging,
    navigateTo,
    showToast,
  } = useApp();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure app appearance, inference timeouts, network policies, and download mirrors
        </p>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Sun className="w-4 h-4 text-[#4C82FF]" />
          <span>Appearance & Language</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['system', 'light', 'dark'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setThemeMode(mode)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    themeMode === mode
                      ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Language / 语言
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocaleMode('system')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  localeMode === 'system'
                    ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                System
              </button>
              <button
                type="button"
                onClick={() => setLocaleMode('en')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  localeMode === 'en'
                    ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLocaleMode('zh')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  localeMode === 'zh'
                    ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                简体中文
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat & Generation Parameters */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Clock className="w-4 h-4 text-[#4C82FF]" />
          <span>Chat & Inference Timeouts</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Streaming Generation Timeout
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[30, 60, 120, 300].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setChatTimeoutSeconds(sec)}
                className={`py-2 px-2 rounded-xl border text-xs font-mono font-semibold transition-all ${
                  chatTimeoutSeconds === sec
                    ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Download & Network Mirror Policies */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Download className="w-4 h-4 text-[#4C82FF]" />
          <span>Download Policies & Hub Sources</span>
        </div>

        {/* WiFi-only toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-slate-500" />
              <span>Download via Wi-Fi only</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Prevent cellular network consumption for multi-GB model weights
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={downloadSettings.wifiOnly}
              onChange={(e) => updateDownloadSettings({ wifiOnly: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#4C82FF]"></div>
          </label>
        </div>

        {/* Hugging Face Route */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Hugging Face Route
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['auto', 'official', 'mirror'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateDownloadSettings({ huggingFaceRoute: r })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                  downloadSettings.huggingFaceRoute === r
                    ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Max concurrent */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Concurrent Downloads
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateDownloadSettings({ maxConcurrentTasks: num })}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  downloadSettings.maxConcurrentTasks === num
                    ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {num} {num === 1 ? 'Task' : 'Tasks'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Storage and Maintenance */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <HardDrive className="w-4 h-4 text-[#4C82FF]" />
          <span>Storage & System Info</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-mono space-y-1">
          <div className="text-slate-400 font-sans font-medium">Model Directory:</div>
          <div className="text-slate-700 dark:text-slate-300 select-all break-all">
            /data/user/0/com.arkanefans.servllama/files/models
          </div>
        </div>

        {orphanedStagingBytes > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/60 text-xs">
            <div>
              <div className="font-semibold text-rose-800 dark:text-rose-200">
                Orphaned Staging Cache
              </div>
              <div className="text-slate-500 font-mono">
                {FormatUtils.bytes(orphanedStagingBytes)} temporary files
              </div>
            </div>
            <button
              onClick={() => {
                clearOrphanedStaging();
                showToast('Cache cleared');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        )}
      </div>

      {/* About Navigation Tile */}
      <div
        onClick={() => navigateTo('about')}
        className="bg-white dark:bg-[#111A2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-[#4C82FF]/60 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#4C82FF]/10 text-[#4C82FF]">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#4C82FF] transition-colors">
              About ServLlama
            </div>
            <div className="text-xs text-slate-500">
              Version 1.2.2 (Build 26) • llama-server b4816 • Hexagon NPU & MNN
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
