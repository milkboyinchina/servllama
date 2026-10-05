import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LibraryModel } from '../types/models';
import { FormatUtils } from '../utils/format';
import { EngineBadge, ModelFormatBadge } from './CommonBadges';
import {
  X,
  Eye,
  Sliders,
  FileCheck,
  CheckCircle2,
  Trash2,
  HardDrive,
  FolderOpen,
} from 'lucide-react';

interface GgufModelSettingsSheetProps {
  model: LibraryModel;
  onClose: () => void;
}

export const GgufModelSettingsSheet: React.FC<GgufModelSettingsSheetProps> = ({
  model,
  onClose,
}) => {
  const {
    t,
    toggleModelVision,
    selectModelMmproj,
    importLocalMmproj,
    removeModelMmproj,
    showToast,
  } = useApp();

  const [customMmprojName, setCustomMmprojName] = useState('');
  const [showAddMmproj, setShowAddMmproj] = useState(false);

  const handleToggleVision = (e: React.ChangeEvent<HTMLInputElement>) => {
    toggleModelVision(model.id, e.target.checked);
  };

  const handleSelectMmproj = (path: string) => {
    selectModelMmproj(model.id, path);
    showToast('Vision projector selected');
  };

  const handleRemoveMmproj = (key?: string) => {
    removeModelMmproj(model.id, key);
    showToast('Projector removed');
  };

  const handleImportCustomMmproj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMmprojName.trim()) return;
    importLocalMmproj(model.id, customMmprojName.trim());
    setCustomMmprojName('');
    setShowAddMmproj(false);
    showToast('Projector added');
  };

  const availableMmprojEntries = Object.entries(model.availableMmprojs || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Model Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
              {model.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0A101D] border border-slate-200/60 dark:border-slate-800">
            <EngineBadge engine={model.engine} />
            <ModelFormatBadge engine={model.engine} />
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1 ml-auto">
              <HardDrive className="w-3.5 h-3.5" />
              {FormatUtils.bytes(model.sizeBytes)}
            </span>
          </div>

          {/* Model info stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="text-slate-400 font-medium">Quantization</div>
              <div className="text-slate-800 dark:text-slate-200 font-semibold mt-1 font-mono truncate">
                {model.quantLabel || 'Q4_K_M'}
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="text-slate-400 font-medium">Hub Source</div>
              <div className="text-slate-800 dark:text-slate-200 font-semibold mt-1 font-mono truncate">
                {model.source || 'Local File'}
              </div>
            </div>
          </div>

          {/* Vision capability toggle */}
          {model.engine === 'llama_cpp' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Multimodal Vision
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Enable vision projector for image input
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={model.isVisionEnabled}
                    onChange={handleToggleVision}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#4C82FF]"></div>
                </label>
              </div>

              {model.isVisionEnabled && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Vision Projector (mmproj)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddMmproj(true)}
                      className="text-xs text-[#4C82FF] hover:underline flex items-center gap-1 font-medium"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      Attach projector file
                    </button>
                  </div>

                  {/* List of associated mmproj files */}
                  {availableMmprojEntries.length > 0 ? (
                    <div className="space-y-2">
                      {availableMmprojEntries.map(([key, filePath]) => {
                        const isSelected = model.mmprojFilePath === filePath;
                        return (
                          <div
                            key={key}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                              isSelected
                                ? 'border-[#4C82FF] bg-[#4C82FF]/5 dark:bg-[#4C82FF]/10'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div
                              onClick={() => handleSelectMmproj(filePath)}
                              className="flex items-center gap-2 cursor-pointer truncate flex-1"
                            >
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-[#4C82FF] shrink-0" />
                              ) : (
                                <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate font-mono text-slate-700 dark:text-slate-300">
                                {key}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveMmproj(key)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                              title={t.commonDelete || 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic py-1">
                      No vision projector attached. Select or import one to parse images.
                    </div>
                  )}

                  {/* Custom add mmproj modal/drawer */}
                  {showAddMmproj && (
                    <form onSubmit={handleImportCustomMmproj} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Add mmproj filename / GGUF projector
                      </div>
                      <input
                        type="text"
                        value={customMmprojName}
                        onChange={(e) => setCustomMmprojName(e.target.value)}
                        placeholder="e.g. mmproj-model-f16.gguf"
                        className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#4C82FF]"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMmproj(false)}
                          className="px-2.5 py-1 text-xs rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          {t.commonCancel || 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-1 text-xs rounded-md bg-[#4C82FF] text-white hover:bg-[#3D6FE5]"
                        >
                          {t.commonSave || 'Save'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Model ID */}
          <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 font-medium">Model ID</span>
            <div className="font-mono text-slate-600 dark:text-slate-400 break-all select-all">
              {model.id}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#4C82FF] hover:bg-[#3D6FE5] text-white transition-colors"
          >
            {t.commonDone || 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
