import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HubRepoDetail, HubRepoFile, ModelHubSource } from '../types/models';
import { EngineBadge, ModelFormatBadge } from '../components/CommonBadges';
import { FormatUtils } from '../utils/format';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  HardDrive,
  FileCheck,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
} from 'lucide-react';

export const HubRepoPage: React.FC = () => {
  const {
    t,
    goBack,
    activeRepo,
    enqueueDownload,
    navigateTo,
    showToast,
  } = useApp();

  const [repoDetail, setRepoDetail] = useState<HubRepoDetail | null>(null);
  const [selectedFile, setSelectedFile] = useState<HubRepoFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeRepo) return;
    setLoading(true);

    const isMnn = activeRepo.engine === 'mnn';
    const cleanName = activeRepo.repoId.split('/').pop() || activeRepo.repoId;
    const ownerName = activeRepo.repoId.split('/')[0] || 'community';

    setTimeout(() => {
      let files: HubRepoFile[] = [];
      if (isMnn) {
        files = [
          {
            path: 'mnn_model.bundle',
            fileName: 'mnn_model.bundle',
            sizeBytes: 1.4 * 1024 * 1024 * 1024,
            quantLabel: '4-bit INT4',
            isMmproj: false,
            isGguf: false,
            isMnnModel: true,
          },
          {
            path: 'mnn_model_fp16.bundle',
            fileName: 'mnn_model_fp16.bundle',
            sizeBytes: 2.2 * 1024 * 1024 * 1024,
            quantLabel: '16-bit FP16',
            isMmproj: false,
            isGguf: false,
            isMnnModel: true,
          },
        ];
      } else {
        files = [
          {
            path: `${cleanName}-Q4_K_M.gguf`,
            fileName: `${cleanName}-Q4_K_M.gguf`,
            sizeBytes: 1.15 * 1024 * 1024 * 1024,
            quantLabel: 'Q4_K_M',
            isMmproj: false,
            isGguf: true,
            isMnnModel: false,
          },
          {
            path: `${cleanName}-Q5_K_M.gguf`,
            fileName: `${cleanName}-Q5_K_M.gguf`,
            sizeBytes: 1.38 * 1024 * 1024 * 1024,
            quantLabel: 'Q5_K_M',
            isMmproj: false,
            isGguf: true,
            isMnnModel: false,
          },
          {
            path: `${cleanName}-Q8_0.gguf`,
            fileName: `${cleanName}-Q8_0.gguf`,
            sizeBytes: 1.95 * 1024 * 1024 * 1024,
            quantLabel: 'Q8_0',
            isMmproj: false,
            isGguf: true,
            isMnnModel: false,
          },
          {
            path: `${cleanName}-mmproj-f16.gguf`,
            fileName: `${cleanName}-mmproj-f16.gguf`,
            sizeBytes: 380 * 1024 * 1024,
            quantLabel: 'mmproj (Vision)',
            isMmproj: true,
            isGguf: true,
            isMnnModel: false,
          },
        ];
      }

      setRepoDetail({
        summary: {
          repoId: activeRepo.repoId,
          owner: ownerName,
          name: cleanName,
          source: activeRepo.source,
          engine: activeRepo.engine,
          downloads: 14200,
          likes: 890,
          tags: ['llm', 'conversational', activeRepo.engine],
        },
        revision: 'main',
        files,
      });

      setSelectedFile(files[0]);
      setLoading(false);
    }, 200);
  }, [activeRepo]);

  if (!activeRepo) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No repository selected.</p>
        <button
          onClick={() => navigateTo('discover')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#4C82FF] text-white"
        >
          Return to Discovery
        </button>
      </div>
    );
  }

  const handleStartDownload = () => {
    if (!selectedFile) return;

    const res = enqueueDownload({
      engine: activeRepo.engine,
      source: activeRepo.source,
      repoId: activeRepo.repoId,
      revision: 'main',
      modelName: selectedFile.path.replace(/\.gguf$/, '').replace(/\.bundle$/, ''),
      files: [selectedFile],
      quantLabel: selectedFile.quantLabel,
    });

    if (res.ok) {
      showToast('Download added to queue');
      navigateTo('downloads');
    } else {
      showToast(res.error || 'Failed to start download');
    }
  };

  const hubUrl =
    activeRepo.source === 'huggingFace'
      ? `https://huggingface.co/${activeRepo.repoId}`
      : `https://modelscope.cn/models/${activeRepo.repoId}`;

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
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {activeRepo.source === 'huggingFace' ? '🤗 Hugging Face' : '🤖 ModelScope'}
              </span>
              <EngineBadge engine={activeRepo.engine} compact />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 break-all">
              {activeRepo.repoId}
            </h1>
          </div>
        </div>

        <a
          href={hubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#4C82FF] border border-slate-200 dark:border-slate-800 hover:border-[#4C82FF]/40 transition-colors"
        >
          <span>View on Web</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-[#4C82FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Fetching repository file tree...</p>
        </div>
      ) : (
        repoDetail && (
          <div className="space-y-6">
            {/* Description & Overview */}
            <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Repository {repoDetail.summary.name} by {repoDetail.summary.owner}. Ready for on-device inference.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>{repoDetail.summary.downloads.toLocaleString()} downloads</span>
                <span>•</span>
                <span>{repoDetail.summary.likes.toLocaleString()} likes</span>
              </div>
            </div>

            {/* Quantization / File Options */}
            <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <Layers className="w-4 h-4 text-[#4C82FF]" />
                  <span>Select Quantization Weight</span>
                </div>
                <span className="text-xs text-slate-400">
                  {repoDetail.files.length} package variations
                </span>
              </div>

              <div className="space-y-2.5">
                {repoDetail.files.map((file) => {
                  const isSelected = selectedFile?.path === file.path;

                  return (
                    <div
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#4C82FF] bg-[#4C82FF]/5 dark:bg-[#4C82FF]/10 ring-1 ring-[#4C82FF]/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {file.quantLabel}
                          </span>
                          {file.isMmproj && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Vision Projector
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-slate-500 truncate max-w-sm sm:max-w-md">
                          {file.path}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                          {FormatUtils.bytes(file.sizeBytes)}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#4C82FF] bg-[#4C82FF] text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 fill-current" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Download CTA Bar */}
            <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Target File to Download:</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono truncate max-w-xs sm:max-w-md">
                  {selectedFile?.path}
                </div>
              </div>

              <button
                onClick={handleStartDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#4C82FF] text-white hover:bg-[#3D6FE5] shadow-md shadow-[#4C82FF]/20 transition-all shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Model</span>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
