import React from 'react';
import { useApp } from '../context/AppContext';
import { InferenceEngine } from '../types/models';
import { EngineBadge, NoticeBanner, ModelFormatBadge } from '../components/CommonBadges';
import { FormatUtils } from '../utils/format';
import {
  Play,
  Square,
  Server,
  Cpu,
  Layers,
  Settings2,
  Terminal,
  ExternalLink,
  Copy,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  Sliders,
  Zap,
  Trash2,
} from 'lucide-react';

export const ServerPage: React.FC = () => {
  const {
    t,
    activeEngine,
    switchEngine,
    runtimeStatus,
    runtimePhase,
    activeModelId,
    selectedModelId,
    libraryModels,
    serverSettings,
    updateServerSettings,
    toggleServer,
    displayUrl,
    exposesLanWithoutApiKey,
    mnnMmapCacheBytes,
    clearMnnMmapCache,
    probeBackends,
    isProbingBackends,
    navigateTo,
    selectModelForEngine,
    showToast,
    logs,
  } = useApp();

  const isRunning = runtimeStatus === 'ready';
  const isTransitioning = runtimeStatus === 'preparing' || runtimeStatus === 'stopping';

  const engineModels = libraryModels.filter((m) => m.engine === activeEngine);
  const selectedModel = libraryModels.find((m) => m.id === selectedModelId);
  const runningModel = libraryModels.find((m) => m.id === activeModelId);

  const handleCopyUrl = () => {
    if (!displayUrl) return;
    navigator.clipboard.writeText(displayUrl);
    showToast('API URL copied to clipboard');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Warnings */}
      {exposesLanWithoutApiKey && (
        <NoticeBanner
          tone="warning"
          message="Notice: Server is bound to 0.0.0.0 without an API key. Devices on your local network can access inference."
        />
      )}

      {/* Engine Selector */}
      <div className="flex items-center justify-between p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl w-full max-w-md">
        <button
          onClick={() => switchEngine('llama_cpp')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeEngine === 'llama_cpp'
              ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          llama.cpp (GGUF)
        </button>
        <button
          onClick={() => switchEngine('mnn')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeEngine === 'mnn'
              ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          MNN (Alibaba)
        </button>
      </div>

      {/* Runtime Hero Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-white to-slate-50 dark:from-[#111A2E] dark:via-[#111A2E] dark:to-[#0D1526] border border-slate-200/80 dark:border-slate-800 shadow-lg dark:shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <EngineBadge engine={activeEngine} />
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isRunning
                      ? 'bg-emerald-500 animate-pulse'
                      : isTransitioning
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {runtimeStatus === 'ready'
                    ? t.serverStatusRunning || 'Running'
                    : runtimeStatus === 'preparing'
                    ? 'Starting'
                    : runtimeStatus === 'stopping'
                    ? 'Stopping'
                    : t.serverStatusStopped || 'Stopped'}
                </span>
                {runtimePhase && (
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {runtimePhase}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {isRunning
                  ? runningModel?.name || 'Local Inference Server'
                  : selectedModel?.name || 'Ready to Launch'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isRunning
                  ? `${activeEngine === 'llama_cpp' ? 'llama-server' : 'MNN LLM'} is listening for OpenAI API calls`
                  : 'Configure options below and start the server to serve local requests'}
              </p>
            </div>

            {/* API Endpoints */}
            {isRunning && displayUrl && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-800 dark:text-slate-200">
                  <Terminal className="w-3.5 h-3.5 text-[#4C82FF]" />
                  <span>{displayUrl}</span>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1 hover:text-[#4C82FF] rounded-md transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Base URL: <code className="font-mono text-slate-700 dark:text-slate-300">{displayUrl}/v1</code>
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleServer()}
              disabled={isTransitioning}
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold shadow-md transition-all ${
                isRunning
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : 'bg-[#4C82FF] hover:bg-[#3D6FE5] text-white shadow-[#4C82FF]/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>{t.serverStop || 'Stop Server'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.serverStart || 'Start Server'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Model Selection & Quick Hardware Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Picker Card */}
        <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Layers className="w-4 h-4 text-[#4C82FF]" />
              <span>Active Model</span>
            </div>
            <button
              onClick={() => navigateTo('models')}
              className="text-xs text-[#4C82FF] hover:underline font-semibold flex items-center gap-1"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Models Library</span>
            </button>
          </div>

          {engineModels.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500">
                No models available for this engine yet.
              </p>
              <button
                onClick={() => navigateTo('discover')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#4C82FF] text-white hover:bg-[#3D6FE5]"
              >
                Discover Models
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {engineModels.map((m) => {
                const isSelected = selectedModelId === m.id;
                const isCurrentRunning = activeModelId === m.id && isRunning;
                return (
                  <div
                    key={m.id}
                    onClick={() => selectModelForEngine(m.id, activeEngine)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#4C82FF] bg-[#4C82FF]/5 dark:bg-[#4C82FF]/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {FormatUtils.bytes(m.sizeBytes)} • {m.quantLabel || 'Q4_K_M'}
                      </div>
                    </div>
                    {isCurrentRunning ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {t.chatModelStatusLoaded || 'Loaded'}
                      </span>
                    ) : isSelected ? (
                      <span className="w-2 h-2 rounded-full bg-[#4C82FF]" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Backend & Hardware Settings */}
        <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Cpu className="w-4 h-4 text-[#4C82FF]" />
              <span>Hardware Acceleration</span>
            </div>
            <button
              onClick={probeBackends}
              disabled={isProbingBackends}
              className="text-xs text-slate-500 hover:text-[#4C82FF] flex items-center gap-1 font-medium transition-colors"
              title="Probe hardware capabilities"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProbingBackends ? 'animate-spin' : ''}`} />
              <span>{isProbingBackends ? 'Probing...' : 'Probe'}</span>
            </button>
          </div>

          {activeEngine === 'llama_cpp' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Acceleration Backend
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateServerSettings({ llamaCppBackend: 'cpu' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      serverSettings.llamaCppBackend === 'cpu'
                        ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    CPU
                  </button>
                  <button
                    type="button"
                    onClick={() => updateServerSettings({ llamaCppBackend: 'hexagon' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      serverSettings.llamaCppBackend === 'hexagon'
                        ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Hexagon NPU (DSP)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">
                    CPU Threads
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={serverSettings.cpuThreads}
                    onChange={(e) => updateServerSettings({ cpuThreads: parseInt(e.target.value) || 4 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">
                    Context Size
                  </label>
                  <input
                    type="number"
                    min="512"
                    step="512"
                    value={serverSettings.contextSize}
                    onChange={(e) => updateServerSettings({ contextSize: parseInt(e.target.value) || 2048 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  MNN Forward Type
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  {(['cpu', 'opencl', 'vulkan'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => updateServerSettings({ mnnBackend: b })}
                      className={`py-2 px-2 rounded-xl border text-center uppercase transition-all ${
                        serverSettings.mnnBackend === b
                          ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {mnnMmapCacheBytes > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      mmap Cache
                    </div>
                    <div className="text-slate-500 font-mono">
                      {FormatUtils.bytes(mnnMmapCacheBytes)}
                    </div>
                  </div>
                  <button
                    onClick={clearMnnMmapCache}
                    className="px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigateTo('serverConfig')}
              className="text-xs text-[#4C82FF] hover:underline font-semibold flex items-center gap-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>All Server Parameters &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Logs Snippet */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Terminal className="w-4 h-4 text-[#4C82FF]" />
            <span>Server Logs</span>
          </div>
          <button
            onClick={() => navigateTo('serverLogs')}
            className="text-xs text-[#4C82FF] hover:underline font-semibold"
          >
            View live logs &rarr;
          </button>
        </div>

        <div className="h-32 overflow-hidden rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-300 space-y-1">
          {logs.slice(-5).map((log) => (
            <div key={log.id} className="truncate">
              <span className="text-slate-500 mr-2">[{log.channel}]</span>
              <span
                className={
                  log.level === 'error'
                    ? 'text-rose-400 font-semibold'
                    : log.level === 'warning'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-500 italic py-2">No server output logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
