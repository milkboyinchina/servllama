import React from 'react';
import { useApp } from '../context/AppContext';
import { buildLlamaServerLaunchArgs } from '../utils/format';
import {
  ArrowLeft,
  RotateCcw,
  Server,
  Sliders,
  Terminal,
  Shield,
  Zap,
  Check,
  AlertCircle,
  Copy,
} from 'lucide-react';

export const ServerConfigPage: React.FC = () => {
  const {
    t,
    goBack,
    serverSettings,
    updateServerSettings,
    resetServerSettings,
    selectedModelId,
    libraryModels,
    showToast,
  } = useApp();

  const selectedModel = libraryModels.find((m) => m.id === selectedModelId);
  const cliArgs = buildLlamaServerLaunchArgs(serverSettings, {
    modelPath: selectedModel ? `/data/models/${selectedModel.name}` : '/data/models/model.gguf',
    modelAlias: selectedModel?.name || 'default-model',
  });

  const handleCopyCli = () => {
    navigator.clipboard.writeText(`llama-server ${cliArgs.join(' ')}`);
    showToast('CLI arguments copied');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Server Configuration
            </h1>
            <p className="text-xs text-slate-500">
              Fine-tune launch flags, network binding, and acceleration parameters
            </p>
          </div>
        </div>

        <button
          onClick={resetServerSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-800 hover:border-rose-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Network & Security Settings */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Shield className="w-4 h-4 text-[#4C82FF]" />
          <span>Network & Binding</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Host Interface
            </label>
            <select
              value={serverSettings.listenMode}
              onChange={(e) => updateServerSettings({ listenMode: e.target.value as any })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="allInterfaces">0.0.0.0 (All interfaces / LAN)</option>
              <option value="localhost">127.0.0.1 (Localhost only)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Port
            </label>
            <input
              type="number"
              value={serverSettings.port}
              onChange={(e) => updateServerSettings({ port: parseInt(e.target.value) || 8080 })}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              API Key Authorization (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave empty for open local access, or enter Bearer token"
              value={serverSettings.apiKey || ''}
              onChange={(e) => updateServerSettings({ apiKey: e.target.value })}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Model Execution & Context Settings */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Sliders className="w-4 h-4 text-[#4C82FF]" />
          <span>Execution Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Context Window Size (n_ctx)
            </label>
            <input
              type="number"
              step="512"
              min="512"
              max="65536"
              value={serverSettings.contextSize}
              onChange={(e) => updateServerSettings({ contextSize: parseInt(e.target.value) || 2048 })}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              CPU Worker Threads
            </label>
            <input
              type="number"
              min="1"
              max="32"
              value={serverSettings.cpuThreads}
              onChange={(e) => updateServerSettings({ cpuThreads: parseInt(e.target.value) || 4 })}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Batch Size (n_batch)
            </label>
            <input
              type="number"
              step="64"
              value={serverSettings.batchSize}
              onChange={(e) => updateServerSettings({ batchSize: parseInt(e.target.value) || 512 })}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Parallel Slots (n_parallel)
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={serverSettings.parallelSlots}
              onChange={(e) => updateServerSettings({ parallelSlots: parseInt(e.target.value) || 1 })}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Flash Attention
              </div>
              <div className="text-[11px] text-slate-500">
                Accelerates attention computation and saves memory if supported by the kernel
              </div>
            </div>
            <select
              value={serverSettings.flashAttentionMode}
              onChange={(e) => updateServerSettings({ flashAttentionMode: e.target.value as any })}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="disabled">Disabled</option>
              <option value="auto">Auto</option>
              <option value="enabled">Enabled</option>
            </select>
          </label>
        </div>
      </div>

      {/* CLI Launch Preview */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Terminal className="w-4 h-4 text-[#4C82FF]" />
            <span>CLI Command Preview</span>
          </div>
          <button
            onClick={handleCopyCli}
            className="flex items-center gap-1 text-xs text-[#4C82FF] hover:underline font-semibold"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 break-all select-all leading-relaxed">
          llama-server {cliArgs.join(' ')}
        </div>
      </div>
    </div>
  );
};
