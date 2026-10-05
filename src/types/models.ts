export type InferenceEngine = 'llama_cpp' | 'mnn';

export type EngineRuntimeStatus = 'idle' | 'preparing' | 'ready' | 'stopping' | 'error';

export type EngineRuntimePhase =
  | 'loadingModel'
  | 'startingServer'
  | 'verifying'
  | 'unloadingModel'
  | 'stoppingServer';

export type ServerListenMode = 'localhost' | 'allInterfaces';
export type FlashAttentionMode = 'auto' | 'enabled' | 'disabled';
export type ServerLogLevel = 'error' | 'warning' | 'info' | 'debug';
export type LlamaCppBackend = 'cpu' | 'opencl' | 'hexagon';
export type MnnBackend = 'cpu' | 'opencl' | 'vulkan' | 'hexagon';
export type MnnPrecision = 'low' | 'high';

export interface ServerLaunchSettings {
  listenMode: ServerListenMode;
  port: number;
  apiKey: string;
  contextSize: number;
  cpuThreads: number;
  batchSize: number;
  parallelSlots: number;
  imageMaxTokens: number;
  flashAttentionMode: FlashAttentionMode;
  useMmap: boolean;
  logEnabled: boolean;
  logLevel: ServerLogLevel;
  llamaCppBackend: LlamaCppBackend;
  llamaCppGpuLayers: number;
  mnnBackend: MnnBackend;
  mnnUseMmap: boolean;
  mnnPrecision: MnnPrecision;
  mnnThreadNum: number;
}

export const DEFAULT_SERVER_SETTINGS: ServerLaunchSettings = {
  listenMode: 'localhost',
  port: 8080,
  apiKey: '',
  contextSize: 4096,
  cpuThreads: 4,
  batchSize: 2048,
  parallelSlots: 1,
  imageMaxTokens: 256,
  flashAttentionMode: 'disabled',
  useMmap: true,
  logEnabled: true,
  logLevel: 'info',
  llamaCppBackend: 'cpu',
  llamaCppGpuLayers: 99,
  mnnBackend: 'cpu',
  mnnUseMmap: true,
  mnnPrecision: 'low',
  mnnThreadNum: 4,
};

export type ModelHubSource = 'huggingFace' | 'modelScope';

export type ModelCapability = 'chinese' | 'english' | 'vision' | 'toolCalling';

export type ModelFeasibility = 'comfortable' | 'tight' | 'notEnoughMemory' | 'unknown';

export interface LibraryModel {
  id: string;
  runtimeId: string;
  name: string;
  engine: InferenceEngine;
  sizeBytes: number;
  supportsVision: boolean;
  supportsToolCalling: boolean;
  isVisionEnabled: boolean;
  repoId?: string;
  source?: ModelHubSource;
  revision?: string;
  quantLabel?: string;
  mmprojFilePath?: string;
  availableMmprojs: Record<string, string>; // repoFilePath -> localPath
  warnings: string[];
  importedAt: string;
}

export interface CatalogEntry {
  id: string;
  engine: InferenceEngine;
  displayName: string;
  vendor: string;
  parameterLabel: string;
  summaryKey: string;
  capabilities: ModelCapability[];
  sources: {
    huggingface?: string;
    modelscope?: string;
  };
  recommendedQuant?: string;
}

export interface HubRepoFile {
  path: string;
  fileName: string;
  sizeBytes: number;
  quantLabel?: string;
  isMmproj: boolean;
  isGguf: boolean;
  isMnnModel: boolean;
  sha256?: string;
}

export interface HubRepoSummary {
  source: ModelHubSource;
  engine: InferenceEngine;
  repoId: string;
  owner: string;
  name: string;
  downloads: number;
  likes: number;
  lastModified?: string;
  fileCount?: number;
  tags: string[];
}

export interface HubRepoDetail {
  summary: HubRepoSummary;
  files: HubRepoFile[];
  revision: string;
}

export type DownloadStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'failed'
  | 'downloaded'
  | 'completed';

export interface DownloadTask {
  id: string;
  engine: InferenceEngine;
  source: ModelHubSource;
  repoId: string;
  revision: string;
  modelName: string;
  requestedModelName: string;
  wasAutoRenamed: boolean;
  quantLabel?: string;
  targetModelId?: string; // if downloading mmproj for an existing model
  files: HubRepoFile[];
  status: DownloadStatus;
  receivedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
  errorDetail?: string;
  createdAt: string;
}

export interface ChatMessageVersion {
  id: string;
  content: string;
  reasoning?: string;
  imageAttachments: string[];
  createdAt: string;
}

export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  versions: ChatMessageVersion[];
  activeVersionIndex: number;
  createdAt: string;
}

export interface ChatSessionRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  modelId?: string;
  engine?: InferenceEngine;
}

export type LogChannel = 'engine' | 'server' | 'model' | 'download';
export type LogLevel = 'error' | 'warning' | 'info' | 'debug';

export interface AppLogEntry {
  id: string;
  timestamp: string;
  channel: LogChannel;
  level: LogLevel;
  message: string;
}

export type ThemeModeOption = 'system' | 'light' | 'dark';
export type LocaleModeOption = 'system' | 'zh' | 'en';
export type HuggingFaceRoute = 'auto' | 'official' | 'mirror';

export interface DownloadSettings {
  huggingFaceRoute: HuggingFaceRoute;
  huggingFaceToken: string;
  modelScopeToken: string;
  wifiOnly: boolean;
  maxConcurrentTasks: number;
}
