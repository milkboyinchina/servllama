import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Cpu,
  Layers,
  ExternalLink,
  Code,
  Terminal,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t, goBack } = useApp();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          About ServLlama
        </h1>
      </div>

      {/* Brand Hero */}
      <div className="bg-white dark:bg-[#111A2E] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-xs">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#4C82FF] to-indigo-600 p-0.5 shadow-lg shadow-[#4C82FF]/20 flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-white dark:bg-[#0D1526] flex items-center justify-center">
            <img
              src="/assets/app_icon.svg"
              alt="ServLlama"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            ServLlama
          </h2>
          <p className="text-xs font-mono font-semibold text-[#4C82FF] mt-1">
            v1.2.2 (Release 26) • arm64-v8a
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Open-source local LLM inference server and chat client. Brings high-performance GGUF & MNN models to Snapdragon Hexagon NPU, OpenCL, and multi-threaded CPU.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <a
            href="https://github.com/milkboyinchina/servllama"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Code className="w-4 h-4" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Inference Engine Manifest Specs */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Terminal className="w-4 h-4 text-[#4C82FF]" />
          <span>Bundled Engine Specifications</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-medium">llama-server Core</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
              b4816 (OpenAI API compliant)
            </div>
            <div className="text-[11px] text-slate-500">
              Native arm64 binary with child-process lifecycle
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-medium">Qualcomm Hexagon NPU</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
              HTP v68, v69, v73, v75, v79
            </div>
            <div className="text-[11px] text-slate-500">
              Qualcomm FastRPC & Hexagon DSP offload
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-medium">Alibaba MNN Engine</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
              MNN LLM 3.0+
            </div>
            <div className="text-[11px] text-slate-500">
              OpenCL & Vulkan backends for mobile GPUs
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-medium">Multimodal Projection</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
              CLIP / SigLIP mmproj
            </div>
            <div className="text-[11px] text-slate-500">
              GGUF vision encoder attachments
            </div>
          </div>
        </div>
      </div>

      {/* Open Source Licenses */}
      <div className="bg-white dark:bg-[#111A2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Open Source Licenses</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          ServLlama is released under the Apache-2.0 License. Bundled llama.cpp binaries are licensed under the MIT License. MNN is developed by Alibaba Group and licensed under Apache-2.0.
        </p>

        <div className="text-xs font-mono text-slate-400 pt-1">
          Copyright &copy; 2026 ArkaneFans. All rights reserved.
        </div>
      </div>
    </div>
  );
};
