import { CatalogEntry, HubRepoDetail, HubRepoSummary, LibraryModel } from '../types/models';

export const BUNDLED_MODEL_CATALOG: CatalogEntry[] = [
  {
    id: 'qwen3.5-0.8b-gguf',
    engine: 'llama_cpp',
    displayName: 'Qwen3.5-0.8B',
    vendor: 'Qwen',
    parameterLabel: '0.8B',
    summaryKey: 'verifiedSmallGeneralist',
    capabilities: ['chinese', 'vision', 'toolCalling'],
    sources: {
      huggingface: 'unsloth/Qwen3.5-0.8B-GGUF',
      modelscope: 'unsloth/Qwen3.5-0.8B-GGUF',
    },
    recommendedQuant: 'Q4_K_M',
  },
  {
    id: 'qwen3.5-2b-gguf',
    engine: 'llama_cpp',
    displayName: 'Qwen3.5-2B',
    vendor: 'Qwen',
    parameterLabel: '2B',
    summaryKey: 'verifiedBalanced',
    capabilities: ['chinese', 'vision', 'toolCalling'],
    sources: {
      huggingface: 'unsloth/Qwen3.5-2B-GGUF',
      modelscope: 'unsloth/Qwen3.5-2B-GGUF',
    },
    recommendedQuant: 'Q4_K_M',
  },
  {
    id: 'qwen3.5-4b-gguf',
    engine: 'llama_cpp',
    displayName: 'Qwen3.5-4B',
    vendor: 'Qwen',
    parameterLabel: '4B',
    summaryKey: 'verifiedStrong',
    capabilities: ['chinese', 'vision', 'toolCalling'],
    sources: {
      huggingface: 'unsloth/Qwen3.5-4B-GGUF',
      modelscope: 'unsloth/Qwen3.5-4B-GGUF',
    },
    recommendedQuant: 'Q4_K_M',
  },
  {
    id: 'lfm2.5-2.6b-gguf',
    engine: 'llama_cpp',
    displayName: 'LFM2.5-2.6B',
    vendor: 'Liquid AI',
    parameterLabel: '2.6B',
    summaryKey: 'verifiedLfm25',
    capabilities: ['chinese', 'english'],
    sources: {
      huggingface: 'LiquidAI/LFM2.5-2.6B-GGUF',
      modelscope: 'LiquidAI/LFM2.5-2.6B-GGUF',
    },
    recommendedQuant: 'Q4_K_M',
  },
  {
    id: 'qwen3.5-0.8b-mnn',
    engine: 'mnn',
    displayName: 'Qwen3.5-0.8B-MNN',
    vendor: 'Qwen',
    parameterLabel: '0.8B',
    summaryKey: 'verifiedMnnSmall',
    capabilities: ['chinese', 'vision', 'toolCalling'],
    sources: {
      huggingface: 'taobao-mnn/Qwen3.5-0.8B-MNN',
      modelscope: 'MNN/Qwen3.5-0.8B-MNN',
    },
  },
  {
    id: 'qwen3.5-2b-mnn',
    engine: 'mnn',
    displayName: 'Qwen3.5-2B-MNN',
    vendor: 'Qwen',
    parameterLabel: '2B',
    summaryKey: 'verifiedMnnEveryday',
    capabilities: ['chinese', 'vision', 'toolCalling'],
    sources: {
      huggingface: 'taobao-mnn/Qwen3.5-2B-MNN',
      modelscope: 'MNN/Qwen3.5-2B-MNN',
    },
  },
  {
    id: 'qwen3.5-4b-mnn',
    engine: 'mnn',
    displayName: 'Qwen3.5-4B-MNN',
    vendor: 'Qwen',
    parameterLabel: '4B',
    summaryKey: 'verifiedMnnBalanced',
    capabilities: ['chinese', 'vision', 'toolCalling'],
    sources: {
      huggingface: 'taobao-mnn/Qwen3.5-4B-MNN',
      modelscope: 'MNN/Qwen3.5-4B-MNN',
    },
  },
  {
    id: 'gemma-4-e2b-it-mnn',
    engine: 'mnn',
    displayName: 'Gemma-4-E2B-IT-MNN',
    vendor: 'Google',
    parameterLabel: 'E2B',
    summaryKey: 'verifiedGemma4E2B',
    capabilities: ['english', 'vision'],
    sources: {
      huggingface: 'taobao-mnn/gemma-4-E2B-it-MNN',
      modelscope: 'MNN/gemma-4-E2B-it-MNN',
    },
  },
  {
    id: 'gemma-4-e4b-it-mnn',
    engine: 'mnn',
    displayName: 'Gemma-4-E4B-IT-MNN',
    vendor: 'Google',
    parameterLabel: 'E4B',
    summaryKey: 'verifiedGemma4E4B',
    capabilities: ['english', 'vision'],
    sources: {
      huggingface: 'taobao-mnn/gemma-4-E4B-it-MNN',
      modelscope: 'MNN/gemma-4-E4B-it-MNN',
    },
  },
];

export const INITIAL_LIBRARY_MODELS: LibraryModel[] = [
  {
    id: 'llama_cpp:qwen3.5-0.8b-q4_k_m',
    runtimeId: 'Qwen3.5-0.8B-Q4_K_M',
    name: 'Qwen3.5-0.8B-Q4_K_M',
    engine: 'llama_cpp',
    sizeBytes: 612 * 1024 * 1024,
    supportsVision: true,
    supportsToolCalling: true,
    isVisionEnabled: true,
    repoId: 'unsloth/Qwen3.5-0.8B-GGUF',
    source: 'huggingFace',
    revision: 'main',
    quantLabel: 'Q4_K_M',
    mmprojFilePath: '/data/user/0/com.arkanefans.servllama/files/models/qwen3.5-0.8b/mmproj-F16.gguf',
    availableMmprojs: {
      'mmproj-F16.gguf': '/data/user/0/com.arkanefans.servllama/files/models/qwen3.5-0.8b/mmproj-F16.gguf',
    },
    warnings: [],
    importedAt: '2026-09-20T10:15:00Z',
  },
  {
    id: 'llama_cpp:lfm2.5-2.6b-q4_k_m',
    runtimeId: 'LFM2.5-2.6B-Q4_K_M',
    name: 'LFM2.5-2.6B-Q4_K_M',
    engine: 'llama_cpp',
    sizeBytes: 1680 * 1024 * 1024,
    supportsVision: false,
    supportsToolCalling: false,
    isVisionEnabled: false,
    repoId: 'LiquidAI/LFM2.5-2.6B-GGUF',
    source: 'huggingFace',
    revision: 'main',
    quantLabel: 'Q4_K_M',
    availableMmprojs: {},
    warnings: [],
    importedAt: '2026-09-24T14:30:00Z',
  },
  {
    id: 'mnn:qwen3.5-0.8b-mnn',
    runtimeId: 'Qwen3.5-0.8B-MNN',
    name: 'Qwen3.5-0.8B-MNN',
    engine: 'mnn',
    sizeBytes: 575 * 1024 * 1024,
    supportsVision: true,
    supportsToolCalling: true,
    isVisionEnabled: true,
    repoId: 'taobao-mnn/Qwen3.5-0.8B-MNN',
    source: 'modelScope',
    revision: 'master',
    availableMmprojs: {},
    warnings: [],
    importedAt: '2026-09-28T09:00:00Z',
  },
  {
    id: 'mnn:gemma-4-e2b-it-mnn',
    runtimeId: 'Gemma-4-E2B-IT-MNN',
    name: 'Gemma-4-E2B-IT-MNN',
    engine: 'mnn',
    sizeBytes: 1420 * 1024 * 1024,
    supportsVision: true,
    supportsToolCalling: false,
    isVisionEnabled: true,
    repoId: 'taobao-mnn/gemma-4-E2B-it-MNN',
    source: 'huggingFace',
    revision: 'main',
    availableMmprojs: {},
    warnings: [],
    importedAt: '2026-10-01T16:40:00Z',
  },
];

export function buildRepoDetailFallback(
  repoId: string,
  source: 'huggingFace' | 'modelScope',
  engine: 'llama_cpp' | 'mnn'
): HubRepoDetail {
  const parts = repoId.split('/');
  const owner = parts[0] || 'community';
  const name = parts[1] || repoId;
  const baseName = name.replace(/-GGUF$/i, '').replace(/-MNN$/i, '');

  const isSmall = /0\.8b|0\.5b|1b/i.test(repoId);
  const isMid = /2b|2\.6b|3b|e2b/i.test(repoId);
  const baseSizeMb = isSmall ? 540 : isMid ? 1450 : 2680;
  const hasVision = /qwen3\.5|gemma-4|vl|vision/i.test(repoId);

  const summary: HubRepoSummary = {
    source,
    engine,
    repoId,
    owner,
    name,
    downloads: isSmall ? 48200 : isMid ? 31900 : 19400,
    likes: isSmall ? 412 : isMid ? 285 : 198,
    lastModified: '2026-09-18T12:00:00Z',
    tags: engine === 'mnn' ? ['mnn', 'mobile', 'llm'] : ['gguf', 'llama.cpp', 'quantized'],
  };

  if (engine === 'mnn') {
    return {
      summary: { ...summary, fileCount: 6 },
      revision: source === 'modelScope' ? 'master' : 'main',
      files: [
        {
          path: 'config.json',
          fileName: 'config.json',
          sizeBytes: 4210,
          isMmproj: false,
          isGguf: false,
          isMnnModel: false,
        },
        {
          path: 'llm_config.json',
          fileName: 'llm_config.json',
          sizeBytes: 2180,
          isMmproj: false,
          isGguf: false,
          isMnnModel: false,
        },
        {
          path: 'tokenizer.txt',
          fileName: 'tokenizer.txt',
          sizeBytes: 3420 * 1024,
          isMmproj: false,
          isGguf: false,
          isMnnModel: false,
        },
        {
          path: 'llm.mnn',
          fileName: 'llm.mnn',
          sizeBytes: 1840 * 1024,
          isMmproj: false,
          isGguf: false,
          isMnnModel: true,
        },
        {
          path: 'llm.mnn.weight',
          fileName: 'llm.mnn.weight',
          sizeBytes: baseSizeMb * 1024 * 1024,
          isMmproj: false,
          isGguf: false,
          isMnnModel: false,
        },
        ...(hasVision
          ? [
              {
                path: 'visual.mnn',
                fileName: 'visual.mnn',
                sizeBytes: 280 * 1024 * 1024,
                isMmproj: false,
                isGguf: false,
                isMnnModel: true,
              },
            ]
          : []),
      ],
    };
  }

  return {
    summary: { ...summary, fileCount: hasVision ? 6 : 4 },
    revision: 'main',
    files: [
      {
        path: `${baseName}-Q4_0.gguf`,
        fileName: `${baseName}-Q4_0.gguf`,
        sizeBytes: Math.round(baseSizeMb * 0.92 * 1024 * 1024),
        quantLabel: 'Q4_0',
        isMmproj: false,
        isGguf: true,
        isMnnModel: false,
      },
      {
        path: `${baseName}-Q4_K_M.gguf`,
        fileName: `${baseName}-Q4_K_M.gguf`,
        sizeBytes: Math.round(baseSizeMb * 1.0 * 1024 * 1024),
        quantLabel: 'Q4_K_M',
        isMmproj: false,
        isGguf: true,
        isMnnModel: false,
      },
      {
        path: `${baseName}-Q5_K_M.gguf`,
        fileName: `${baseName}-Q5_K_M.gguf`,
        sizeBytes: Math.round(baseSizeMb * 1.18 * 1024 * 1024),
        quantLabel: 'Q5_K_M',
        isMmproj: false,
        isGguf: true,
        isMnnModel: false,
      },
      {
        path: `${baseName}-Q8_0.gguf`,
        fileName: `${baseName}-Q8_0.gguf`,
        sizeBytes: Math.round(baseSizeMb * 1.65 * 1024 * 1024),
        quantLabel: 'Q8_0',
        isMmproj: false,
        isGguf: true,
        isMnnModel: false,
      },
      ...(hasVision
        ? [
            {
              path: 'mmproj-F16.gguf',
              fileName: 'mmproj-F16.gguf',
              sizeBytes: 384 * 1024 * 1024,
              isMmproj: true,
              isGguf: true,
              isMnnModel: false,
            },
            {
              path: 'mmproj-Q8_0.gguf',
              fileName: 'mmproj-Q8_0.gguf',
              sizeBytes: 210 * 1024 * 1024,
              isMmproj: true,
              isGguf: true,
              isMnnModel: false,
            },
          ]
        : []),
    ],
  };
}
