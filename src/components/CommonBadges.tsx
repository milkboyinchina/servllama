import React from 'react';
import { InferenceEngine } from '../types/models';

interface EngineBadgeProps {
  engine: InferenceEngine;
  compact?: boolean;
}

export const EngineBadge: React.FC<EngineBadgeProps> = ({ engine, compact = false }) => {
  const isLlama = engine === 'llama_cpp';
  const color = isLlama ? 'text-[#3B6BF5] dark:text-[#7DA2FF]' : 'text-[#E5601F] dark:text-[#E0703A]';
  const dotColor = isLlama ? 'bg-[#3B6BF5] dark:bg-[#7DA2FF]' : 'bg-[#E5601F] dark:bg-[#E0703A]';

  return (
    <div className={`inline-flex items-center gap-1.5 font-semibold ${compact ? 'text-xs' : 'text-xs'} ${color}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{isLlama ? 'llama.cpp · GGUF' : 'MNN'}</span>
    </div>
  );
};

export const ModelFormatBadge: React.FC<{ engine: InferenceEngine; size?: number }> = ({
  engine,
  size = 36,
}) => {
  const isLlama = engine === 'llama_cpp';
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none ${
        isLlama
          ? 'bg-[#3B6BF5]/10 text-[#3B6BF5] dark:bg-[#7DA2FF]/20 dark:text-[#7DA2FF]'
          : 'bg-[#E5601F]/10 text-[#E5601F] dark:bg-[#E0703A]/20 dark:text-[#E0703A]'
      }`}
    >
      {isLlama ? 'GGUF' : 'MNN'}
    </div>
  );
};

export type NoticeTone = 'warning' | 'danger' | 'ok' | 'idle';

export const NoticeBanner: React.FC<{
  tone: NoticeTone;
  message: string;
  icon?: React.ReactNode;
}> = ({ tone, message, icon }) => {
  const style = {
    warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60',
    danger: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800/60',
    ok: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60',
    idle: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700',
  }[tone];

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-2xl border text-xs leading-relaxed ${style}`}>
      {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
      <div className="flex-1">{message}</div>
    </div>
  );
};
