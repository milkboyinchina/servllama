import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InferenceEngine, LibraryModel } from '../types/models';
import { EngineBadge, ModelFormatBadge } from '../components/CommonBadges';
import { GgufModelSettingsSheet } from '../components/GgufModelSettingsSheet';
import { FormatUtils } from '../utils/format';
import {
  Search,
  Plus,
  Settings,
  Trash2,
  Edit2,
  HardDrive,
  Eye,
  CheckCircle2,
  Compass,
  FilePlus,
  FolderPlus,
  Play,
  X,
  Sliders,
} from 'lucide-react';

export const ModelManagementPage: React.FC = () => {
  const {
    t,
    libraryModels,
    activeEngine,
    selectedModelByEngine,
    selectModelForEngine,
    deleteLibraryModel,
    renameLibraryModel,
    importLocalModel,
    navigateTo,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [engineFilter, setEngineFilter] = useState<'all' | InferenceEngine>('all');
  const [modelToConfigure, setModelToConfigure] = useState<LibraryModel | null>(null);

  // Rename modal state
  const [modelToRename, setModelToRename] = useState<LibraryModel | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  // Add local model modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importName, setImportName] = useState('');
  const [importEngine, setImportEngine] = useState<InferenceEngine>('llama_cpp');
  const [importSupportsVision, setImportSupportsVision] = useState(false);

  // Filtered models
  const filteredModels = libraryModels.filter((m) => {
    if (engineFilter !== 'all' && m.engine !== engineFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        (m.quantLabel && m.quantLabel.toLowerCase().includes(q)) ||
        (m.repoId && m.repoId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenRename = (model: LibraryModel) => {
    setModelToRename(model);
    setRenameInputValue(model.name);
  };

  const handleConfirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelToRename || !renameInputValue.trim()) return;
    const res = renameLibraryModel(modelToRename.id, renameInputValue.trim());
    if (res.ok) {
      showToast('Model renamed');
    } else {
      showToast(res.error || 'Failed to rename');
    }
    setModelToRename(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete model "${name}"?`)) {
      deleteLibraryModel(id);
      showToast('Model removed');
    }
  };

  const handleCreateImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importName.trim()) return;
    importLocalModel({
      name: importName.trim(),
      engine: importEngine,
      sizeBytes: importEngine === 'llama_cpp' ? 2.4 * 1024 * 1024 * 1024 : 1.8 * 1024 * 1024 * 1024,
      supportsVision: importSupportsVision,
      supportsToolCalling: false,
    });
    setImportName('');
    setShowImportModal(false);
    showToast('Model added to library');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Model Management
          </h1>
          <p className="text-xs text-slate-500">
            {libraryModels.length} models installed • Ready for local inference
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('discover')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-[#4C82FF]" />
            <span>Discover Hub</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#4C82FF] text-white hover:bg-[#3D6FE5] shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Import Model</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search installed models..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#4C82FF]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold shrink-0">
          {(['all', 'llama_cpp', 'mnn'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setEngineFilter(filter)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                engineFilter === filter
                  ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {filter === 'all'
                ? 'All'
                : filter === 'llama_cpp'
                ? 'llama.cpp'
                : 'MNN'}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111A2E]/50 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No models match your search
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try a different search term or discover popular weights from Hugging Face & ModelScope.
          </p>
          <button
            onClick={() => navigateTo('discover')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4C82FF] text-white hover:bg-[#3D6FE5]"
          >
            Browse Model Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModels.map((m) => {
            const isSelectedForEngine = selectedModelByEngine[m.engine] === m.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all bg-white dark:bg-[#111A2E] ${
                  isSelectedForEngine
                    ? 'border-[#4C82FF] ring-1 ring-[#4C82FF]/30 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <EngineBadge engine={m.engine} compact />
                        <ModelFormatBadge engine={m.engine} />
                        {m.supportsVision && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300">
                            <Eye className="w-3 h-3" />
                            Vision
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[280px]">
                        {m.name}
                      </h3>
                    </div>

                    {isSelectedForEngine && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#4C82FF] bg-[#4C82FF]/10 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-slate-400" />
                      {FormatUtils.bytes(m.sizeBytes)}
                    </span>
                    <span>•</span>
                    <span>{m.quantLabel || 'Q4_K_M'}</span>
                    {m.source && (
                      <>
                        <span>•</span>
                        <span>{m.source}</span>
                      </>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono truncate select-all bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    ID: {m.id}
                  </div>
                </div>

                {/* Model Action Buttons */}
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenRename(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={t.commonRename || 'Rename'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setModelToConfigure(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#4C82FF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Settings"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title={t.commonDelete || 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      selectModelForEngine(m.id, m.engine);
                      showToast(`Selected ${m.name} for ${m.engine}`);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isSelectedForEngine
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                        : 'bg-[#4C82FF] hover:bg-[#3D6FE5] text-white shadow-xs'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isSelectedForEngine ? 'Active Choice' : 'Select'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Model Settings Sheet */}
      {modelToConfigure && (
        <GgufModelSettingsSheet
          model={modelToConfigure}
          onClose={() => setModelToConfigure(null)}
        />
      )}

      {/* Rename Model Modal */}
      {modelToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleConfirmRename}
            className="bg-white dark:bg-[#111A2E] rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.commonRename || 'Rename Model'}
            </h3>
            <input
              type="text"
              value={renameInputValue}
              onChange={(e) => setRenameInputValue(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#4C82FF]"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModelToRename(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.commonCancel || 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4C82FF] text-white hover:bg-[#3D6FE5]"
              >
                {t.commonSave || 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import Local Model Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateImport}
            className="bg-white dark:bg-[#111A2E] rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Import Model
              </h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Model Name
              </label>
              <input
                type="text"
                placeholder="e.g. Llama-3.2-3B-Instruct.gguf"
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#4C82FF]"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Inference Engine
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportEngine('llama_cpp')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    importEngine === 'llama_cpp'
                      ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  llama.cpp (GGUF)
                </button>
                <button
                  type="button"
                  onClick={() => setImportEngine('mnn')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    importEngine === 'mnn'
                      ? 'border-[#4C82FF] bg-[#4C82FF]/10 text-[#4C82FF]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  MNN (Directory)
                </button>
              </div>
            </div>

            {importEngine === 'llama_cpp' && (
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={importSupportsVision}
                  onChange={(e) => setImportSupportsVision(e.target.checked)}
                  className="rounded-sm text-[#4C82FF] focus:ring-[#4C82FF]"
                />
                <span>Supports Vision (Multimodal mmproj)</span>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.commonCancel || 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4C82FF] text-white hover:bg-[#3D6FE5]"
              >
                Import
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
