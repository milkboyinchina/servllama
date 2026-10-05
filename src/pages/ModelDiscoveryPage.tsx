import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InferenceEngine, ModelHubSource, CatalogEntry } from '../types/models';
import { BUNDLED_MODEL_CATALOG } from '../data/catalog';
import { EngineBadge, ModelFormatBadge } from '../components/CommonBadges';
import {
  Compass,
  Search,
  ExternalLink,
  Download,
  Flame,
  Globe,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle,
} from 'lucide-react';

export const ModelDiscoveryPage: React.FC = () => {
  const { t, activeEngine, openRepoDetail, downloadSettings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState<ModelHubSource>('huggingFace');
  const [selectedEngine, setSelectedEngine] = useState<'all' | InferenceEngine>('all');

  const filteredCatalog = BUNDLED_MODEL_CATALOG.filter((item) => {
    if (selectedEngine !== 'all' && item.engine !== selectedEngine) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const repo = item.sources.huggingface || item.sources.modelscope || '';
      return (
        item.displayName.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        repo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCustomRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const cleanRepoId = searchQuery.trim().replace(/^https?:\/\/[^/]+\//, '');
    openRepoDetail(cleanRepoId, selectedHub, selectedEngine === 'all' ? activeEngine : selectedEngine);
  };

  const getItemRepo = (item: CatalogEntry): string => {
    if (selectedHub === 'huggingFace') {
      return item.sources.huggingface || item.sources.modelscope || item.id;
    }
    return item.sources.modelscope || item.sources.huggingface || item.id;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4C82FF] uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Model Hub Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Curated Local AI Weights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Discover lightweight GGUF models for CPU/Hexagon and optimized MNN packages for mobile & edge devices.
          </p>
        </div>

        {/* Hub Source Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setSelectedHub('huggingFace')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedHub === 'huggingFace'
                ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>🤗 Hugging Face</span>
          </button>
          <button
            onClick={() => setSelectedHub('modelScope')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedHub === 'modelScope'
                ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>🤖 ModelScope</span>
          </button>
        </div>
      </div>

      {/* Search & Direct Repo Navigation */}
      <form onSubmit={handleCustomRepoSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog or paste repo (e.g. Qwen/Qwen2.5-0.5B-Instruct-GGUF)..."
            className="w-full text-xs pl-9 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#4C82FF] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            {(['all', 'llama_cpp', 'mnn'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedEngine(filter)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedEngine === filter
                    ? 'bg-white dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'llama_cpp' ? 'GGUF' : 'MNN'}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#4C82FF] text-white hover:bg-[#3D6FE5] flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <span>Open Repo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Catalog Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Recommended For Mobile & Edge</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((item) => {
            const repo = getItemRepo(item);
            const hasVision = item.capabilities.includes('vision');

            return (
              <div
                key={item.id}
                onClick={() => openRepoDetail(repo, selectedHub, item.engine)}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800 hover:border-[#4C82FF]/60 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <EngineBadge engine={item.engine} compact />
                      <ModelFormatBadge engine={item.engine} />
                    </div>
                    {hasVision && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300">
                        <Eye className="w-3 h-3" />
                        Vision
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#4C82FF] transition-colors">
                      {item.displayName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                      {repo}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.vendor} • {item.parameterLabel} • {item.summaryKey}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {item.recommendedQuant || 'Q4_K_M'}
                  </span>
                  <span className="text-[#4C82FF] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Browse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
