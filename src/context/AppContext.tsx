import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  InferenceEngine,
  EngineRuntimeStatus,
  EngineRuntimePhase,
  ServerLaunchSettings,
  DEFAULT_SERVER_SETTINGS,
  LibraryModel,
  DownloadTask,
  ChatSessionRecord,
  ChatMessageRecord,
  AppLogEntry,
  ThemeModeOption,
  LocaleModeOption,
  DownloadSettings,
  ModelHubSource,
  HubRepoFile,
  LogChannel,
  LogLevel,
} from '../types/models';
import { translations, TranslationDict } from '../l10n/translations';
import { INITIAL_LIBRARY_MODELS } from '../data/catalog';
import { buildLlamaServerLaunchArgs, FormatUtils } from '../utils/format';

export type ActivePage =
  | 'chat'
  | 'server'
  | 'serverConfig'
  | 'serverLogs'
  | 'models'
  | 'discover'
  | 'repoDetail'
  | 'downloads'
  | 'settings'
  | 'about'
  | 'history';

export interface ActiveRepoContext {
  repoId: string;
  source: ModelHubSource;
  engine: InferenceEngine;
}

interface AppContextValue {
  // Navigation
  activePage: ActivePage;
  navigateTo: (page: ActivePage) => void;
  goBack: () => void;
  activeRepo: ActiveRepoContext | null;
  openRepoDetail: (repoId: string, source: ModelHubSource, engine: InferenceEngine) => void;

  // Theme & Locale
  themeMode: ThemeModeOption;
  setThemeMode: (mode: ThemeModeOption) => void;
  isDark: boolean;
  localeMode: LocaleModeOption;
  setLocaleMode: (mode: LocaleModeOption) => void;
  lang: 'en' | 'zh';
  t: TranslationDict;

  // Toast notification
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Runtime & Server
  activeEngine: InferenceEngine;
  runtimeStatus: EngineRuntimeStatus;
  runtimePhase: EngineRuntimePhase | null;
  startedAt: number | null;
  activeModelId: string | null;
  selectedModelByEngine: Record<InferenceEngine, string | null>;
  selectedModelId: string | null;
  serverSettings: ServerLaunchSettings;
  updateServerSettings: (partial: Partial<ServerLaunchSettings>) => void;
  resetServerSettings: () => void;
  switchEngine: (engine: InferenceEngine) => void;
  selectModelForEngine: (runtimeId: string, engine?: InferenceEngine) => void;
  activateModel: (runtimeId: string, engine?: InferenceEngine) => Promise<void>;
  startServer: (engineOverride?: InferenceEngine, modelOverride?: string) => Promise<void>;
  stopServer: () => Promise<void>;
  toggleServer: () => Promise<void>;
  displayUrl: string;
  exposesLanWithoutApiKey: boolean;
  mnnMmapCacheBytes: number;
  clearMnnMmapCache: () => void;
  probeBackends: () => void;
  isProbingBackends: boolean;

  // Models Library
  libraryModels: LibraryModel[];
  importLocalModel: (params: {
    name: string;
    engine: InferenceEngine;
    sizeBytes: number;
    supportsVision: boolean;
    supportsToolCalling: boolean;
  }) => LibraryModel;
  deleteLibraryModel: (id: string) => boolean;
  renameLibraryModel: (id: string, newName: string) => { ok: boolean; finalName?: string; error?: string };
  toggleModelVision: (id: string, enabled: boolean) => void;
  selectModelMmproj: (id: string, mmprojPath: string) => void;
  importLocalMmproj: (id: string, fileName: string) => void;
  removeModelMmproj: (id: string, mmprojKey?: string) => void;

  // Downloads
  downloadTasks: DownloadTask[];
  downloadSettings: DownloadSettings;
  updateDownloadSettings: (partial: Partial<DownloadSettings>) => void;
  enqueueDownload: (params: {
    engine: InferenceEngine;
    source: ModelHubSource;
    repoId: string;
    revision: string;
    modelName: string;
    files: HubRepoFile[];
    quantLabel?: string;
    targetModelId?: string;
  }) => { ok: boolean; task?: DownloadTask; error?: string };
  pauseDownload: (taskId: string) => void;
  resumeDownload: (taskId: string) => void;
  cancelDownload: (taskId: string) => void;
  switchDownloadSource: (taskId: string) => void;
  orphanedStagingBytes: number;
  clearOrphanedStaging: () => void;

  // Chat
  sessions: ChatSessionRecord[];
  selectedSessionId: string;
  messagesBySession: Record<string, ChatMessageRecord[]>;
  sessionSearchQuery: string;
  setSessionSearchQuery: (q: string) => void;
  createSession: () => string;
  selectSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  isStreaming: boolean;
  streamingContent: string;
  streamingReasoning: string;
  pendingImages: string[];
  addPendingImage: (dataUrl: string) => void;
  removePendingImage: (index: number) => void;
  clearPendingImages: () => void;
  sendMessage: (content: string, images?: string[]) => Promise<void>;
  stopStreaming: () => void;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => void;
  selectMessageVersion: (messageId: string, versionIndex: number) => void;
  chatTimeoutSeconds: number;
  setChatTimeoutSeconds: (sec: number) => void;

  // Logs
  logs: AppLogEntry[];
  appendLog: (channel: LogChannel, level: LogLevel, message: string) => void;
  clearLogs: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'servllama_state_v1';

const INITIAL_SESSIONS: ChatSessionRecord[] = [
  {
    id: 'session-welcome',
    title: 'Local OpenAI API & Reasoning Test',
    createdAt: '2026-10-05T07:30:00Z',
    updatedAt: '2026-10-05T07:32:00Z',
    modelId: 'Qwen3.5-0.8B-Q4_K_M',
    engine: 'llama_cpp',
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessageRecord[]> = {
  'session-welcome': [
    {
      id: 'msg-1',
      sessionId: 'session-welcome',
      role: 'user',
      activeVersionIndex: 0,
      createdAt: '2026-10-05T07:30:10Z',
      versions: [
        {
          id: 'v-1',
          content: 'How can other apps on my phone or LAN call ServLlama?',
          imageAttachments: [],
          createdAt: '2026-10-05T07:30:10Z',
        },
      ],
    },
    {
      id: 'msg-2',
      sessionId: 'session-welcome',
      role: 'assistant',
      activeVersionIndex: 0,
      createdAt: '2026-10-05T07:30:18Z',
      versions: [
        {
          id: 'v-2',
          reasoning:
            'The user is asking about connecting external clients to the local ServLlama inference server. I should explain the OpenAI-compatible endpoints (/v1/models and /v1/chat/completions), the default localhost bind (127.0.0.1:8080), and how to enable LAN access with an optional Bearer API key.',
          content: `ServLlama exposes an **OpenAI-compatible HTTP API** directly from the active inference engine (\`llama.cpp\` or \`MNN\`).

### 1. Check Available Models
\`\`\`bash
curl http://127.0.0.1:8080/v1/models
\`\`\`

### 2. Stream Chat Completions
\`\`\`bash
curl -N http://127.0.0.1:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Qwen3.5-0.8B-Q4_K_M",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
\`\`\`

- **Same device**: Point any OpenAI client to \`http://127.0.0.1:8080/v1\`.
- **Other devices on Wi-Fi / LAN**: Open **Server → Server config**, set **Listen scope** to **Listen on all** (\`0.0.0.0\`), and configure an **API key** for security.`,
          imageAttachments: [],
          createdAt: '2026-10-05T07:30:18Z',
        },
      ],
    },
  ],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navStack, setNavStack] = useState<ActivePage[]>(['chat']);
  const [activeRepo, setActiveRepo] = useState<ActiveRepoContext | null>(null);

  const [themeMode, setThemeMode] = useState<ThemeModeOption>('light');
  const [localeMode, setLocaleMode] = useState<LocaleModeOption>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeEngine, setActiveEngine] = useState<InferenceEngine>('llama_cpp');
  const [runtimeStatus, setRuntimeStatus] = useState<EngineRuntimeStatus>('ready');
  const [runtimePhase, setRuntimePhase] = useState<EngineRuntimePhase | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(() => Date.now() - 14 * 60 * 1000);
  const [activeModelId, setActiveModelId] = useState<string | null>('Qwen3.5-0.8B-Q4_K_M');
  const [selectedModelByEngine, setSelectedModelByEngine] = useState<
    Record<InferenceEngine, string | null>
  >({
    llama_cpp: 'Qwen3.5-0.8B-Q4_K_M',
    mnn: 'Qwen3.5-0.8B-MNN',
  });

  const [serverSettings, setServerSettings] = useState<ServerLaunchSettings>(DEFAULT_SERVER_SETTINGS);
  const [mnnMmapCacheBytes, setMnnMmapCacheBytes] = useState<number>(148 * 1024 * 1024);
  const [isProbingBackends, setIsProbingBackends] = useState(false);

  const [libraryModels, setLibraryModels] = useState<LibraryModel[]>(INITIAL_LIBRARY_MODELS);
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([]);
  const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>({
    huggingFaceRoute: 'auto',
    huggingFaceToken: '',
    modelScopeToken: '',
    wifiOnly: true,
    maxConcurrentTasks: 2,
  });
  const [orphanedStagingBytes, setOrphanedStagingBytes] = useState<number>(64 * 1024 * 1024);

  const [sessions, setSessions] = useState<ChatSessionRecord[]>(INITIAL_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('session-welcome');
  const [messagesBySession, setMessagesBySession] =
    useState<Record<string, ChatMessageRecord[]>>(INITIAL_MESSAGES);
  const [sessionSearchQuery, setSessionSearchQuery] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [streamingReasoning, setStreamingReasoning] = useState<string>('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [chatTimeoutSeconds, setChatTimeoutSeconds] = useState<number>(120);

  const [logs, setLogs] = useState<AppLogEntry[]>(() => {
    const now = new Date();
    const fmt = (offsetSec: number) =>
      new Date(now.getTime() - offsetSec * 1000).toISOString();
    return [
      {
        id: 'log-1',
        timestamp: fmt(840),
        channel: 'server',
        level: 'info',
        message: 'Preparing llama.cpp runtime (libllama-server.so v0.4.1)',
      },
      {
        id: 'log-2',
        timestamp: fmt(838),
        channel: 'engine',
        level: 'info',
        message:
          'llama-server launch args: --host 127.0.0.1 --port 8080 --model /data/user/0/com.arkanefans.servllama/files/models/qwen3.5-0.8b/Qwen3.5-0.8B-Q4_K_M.gguf --alias Qwen3.5-0.8B-Q4_K_M --ctx-size 4096 --batch-size 2048 --threads 4 --parallel 1 --image-max-tokens 256 --flash-attn off --mmproj /data/user/0/com.arkanefans.servllama/files/models/qwen3.5-0.8b/mmproj-F16.gguf --log-verbosity 3 --device none',
      },
      {
        id: 'log-3',
        timestamp: fmt(835),
        channel: 'model',
        level: 'info',
        message: 'Loaded model Qwen3.5-0.8B-Q4_K_M (612.0 MB, multimodal projector attached)',
      },
      {
        id: 'log-4',
        timestamp: fmt(834),
        channel: 'server',
        level: 'info',
        message: 'HTTP server listening on http://127.0.0.1:8080 (GET /health -> 200 OK)',
      },
    ];
  });

  const streamAbortRef = useRef<boolean>(false);
  const startCancelRef = useRef<boolean>(false);

  // Load persisted preferences from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.themeMode) setThemeMode(parsed.themeMode);
        if (parsed.localeMode) setLocaleMode(parsed.localeMode);
        if (parsed.serverSettings) {
          setServerSettings((prev) => ({ ...prev, ...parsed.serverSettings }));
        }
        if (parsed.libraryModels && Array.isArray(parsed.libraryModels) && parsed.libraryModels.length > 0) {
          setLibraryModels(parsed.libraryModels);
        }
        if (parsed.sessions && Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
          setSessions(parsed.sessions);
        }
        if (parsed.messagesBySession) {
          setMessagesBySession(parsed.messagesBySession);
        }
        if (parsed.chatTimeoutSeconds) {
          setChatTimeoutSeconds(parsed.chatTimeoutSeconds);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          themeMode,
          localeMode,
          serverSettings,
          libraryModels,
          sessions,
          messagesBySession,
          chatTimeoutSeconds,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [
    themeMode,
    localeMode,
    serverSettings,
    libraryModels,
    sessions,
    messagesBySession,
    chatTimeoutSeconds,
  ]);

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const lang: 'en' | 'zh' =
    localeMode === 'zh'
      ? 'zh'
      : localeMode === 'en'
        ? 'en'
        : typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')
          ? 'zh'
          : 'en';

  const t = translations[lang];

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const appendLog = useCallback(
    (channel: LogChannel, level: LogLevel, message: string) => {
      if (!serverSettings.logEnabled) return;
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          channel,
          level,
          message,
        },
      ]);
    },
    [serverSettings.logEnabled]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const activePage = navStack[navStack.length - 1] || 'chat';

  const navigateTo = useCallback((page: ActivePage) => {
    setNavStack((prev) => {
      if (prev[prev.length - 1] === page) return prev;
      return [...prev, page];
    });
  }, []);

  const goBack = useCallback(() => {
    setNavStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : ['chat']));
  }, []);

  const openRepoDetail = useCallback(
    (repoId: string, source: ModelHubSource, engine: InferenceEngine) => {
      setActiveRepo({ repoId, source, engine });
      navigateTo('repoDetail');
    },
    [navigateTo]
  );

  const selectedModelId = selectedModelByEngine[activeEngine];

  const displayUrl = `http://${
    serverSettings.listenMode === 'localhost' ? '127.0.0.1' : '192.168.1.108'
  }:${serverSettings.port}`;

  const exposesLanWithoutApiKey =
    serverSettings.listenMode === 'allInterfaces' && serverSettings.apiKey.trim().length === 0;

  const updateServerSettings = useCallback(
    (partial: Partial<ServerLaunchSettings>) => {
      setServerSettings((prev) => {
        const next = { ...prev, ...partial };
        return next;
      });
    },
    []
  );

  const resetServerSettings = useCallback(() => {
    setServerSettings(DEFAULT_SERVER_SETTINGS);
    appendLog('server', 'info', 'Server configuration restored to defaults.');
    showToast(t.serverConfigStatusSaved);
  }, [appendLog, showToast, t.serverConfigStatusSaved]);

  const switchEngine = useCallback(
    (engine: InferenceEngine) => {
      if (runtimeStatus !== 'idle' && runtimeStatus !== 'error') {
        showToast(t.modelLibrarySwitchEngineBlocked);
        return;
      }
      setActiveEngine(engine);
      appendLog('engine', 'info', `Switched active inference engine to ${engine === 'llama_cpp' ? 'llama.cpp' : 'MNN'}`);
    },
    [runtimeStatus, showToast, t.modelLibrarySwitchEngineBlocked, appendLog]
  );

  const selectModelForEngine = useCallback(
    (runtimeId: string, engine?: InferenceEngine) => {
      const targetEngine = engine || activeEngine;
      setSelectedModelByEngine((prev) => ({
        ...prev,
        [targetEngine]: runtimeId,
      }));
    },
    [activeEngine]
  );

  const stopServer = useCallback(async () => {
    if (runtimeStatus === 'idle') return;
    startCancelRef.current = true;
    setRuntimeStatus('stopping');
    setRuntimePhase('unloadingModel');
    appendLog('model', 'info', `Unloading model ${activeModelId || ''}...`);
    await new Promise((r) => setTimeout(r, 250));
    setRuntimePhase('stoppingServer');
    appendLog('server', 'info', `Stopping ${activeEngine === 'llama_cpp' ? 'llama-server' : 'MNN'} HTTP service on port ${serverSettings.port}`);
    await new Promise((r) => setTimeout(r, 200));
    setRuntimeStatus('idle');
    setRuntimePhase(null);
    setStartedAt(null);
    setActiveModelId(null);
  }, [runtimeStatus, activeModelId, activeEngine, serverSettings.port, appendLog]);

  const startServer = useCallback(
    async (engineOverride?: InferenceEngine, modelOverride?: string) => {
      const targetEngine = engineOverride || activeEngine;
      const targetModelId =
        modelOverride || selectedModelByEngine[targetEngine];

      if (!targetModelId) {
        showToast(t.serverModelRequiredHint);
        return;
      }

      const modelObj = libraryModels.find(
        (m) => m.engine === targetEngine && m.runtimeId === targetModelId
      );

      startCancelRef.current = false;
      if (targetEngine !== activeEngine) {
        setActiveEngine(targetEngine);
      }
      setSelectedModelByEngine((prev) => ({
        ...prev,
        [targetEngine]: targetModelId,
      }));

      setRuntimeStatus('preparing');
      setRuntimePhase('loadingModel');

      if (targetEngine === 'llama_cpp') {
        const cliArgs = buildLlamaServerLaunchArgs(serverSettings, {
          modelPath: `/data/user/0/com.arkanefans.servllama/files/models/${targetModelId}.gguf`,
          modelAlias: targetModelId,
          mmprojPath:
            modelObj?.isVisionEnabled && modelObj?.mmprojFilePath
              ? modelObj.mmprojFilePath
              : undefined,
        });
        appendLog(
          'engine',
          'info',
          `Launching libllama-server.so ${cliArgs.join(' ')}`
        );
      } else {
        appendLog(
          'engine',
          'info',
          `Initializing MNN runtime (backend=${serverSettings.mnnBackend}, precision=${serverSettings.mnnPrecision}, threads=${serverSettings.mnnThreadNum}, mmap=${serverSettings.mnnUseMmap})`
        );
      }

      await new Promise((r) => setTimeout(r, 350));
      if (startCancelRef.current) return;

      setRuntimePhase('startingServer');
      appendLog(
        'model',
        'info',
        `Loading weights for ${targetModelId} (${FormatUtils.bytes(modelObj?.sizeBytes || 600 * 1024 * 1024)})`
      );
      await new Promise((r) => setTimeout(r, 350));
      if (startCancelRef.current) return;

      setRuntimePhase('verifying');
      appendLog(
        'server',
        'info',
        `Health check succeeded on http://${serverSettings.listenMode === 'localhost' ? '127.0.0.1' : '0.0.0.0'}:${serverSettings.port}/v1/models`
      );
      await new Promise((r) => setTimeout(r, 200));
      if (startCancelRef.current) return;

      setActiveModelId(targetModelId);
      setRuntimeStatus('ready');
      setRuntimePhase(null);
      setStartedAt(Date.now());
    },
    [
      activeEngine,
      selectedModelByEngine,
      libraryModels,
      serverSettings,
      appendLog,
      showToast,
      t.serverModelRequiredHint,
    ]
  );

  const activateModel = useCallback(
    async (runtimeId: string, engine?: InferenceEngine) => {
      const targetEngine = engine || activeEngine;
      selectModelForEngine(runtimeId, targetEngine);
      await startServer(targetEngine, runtimeId);
    },
    [activeEngine, selectModelForEngine, startServer]
  );

  const toggleServer = useCallback(async () => {
    if (runtimeStatus === 'preparing') {
      startCancelRef.current = true;
      setRuntimeStatus('idle');
      setRuntimePhase(null);
      appendLog('server', 'warning', 'Server startup cancelled by user.');
      return;
    }
    if (runtimeStatus === 'ready') {
      await stopServer();
    } else {
      await startServer();
    }
  }, [runtimeStatus, stopServer, startServer, appendLog]);

  const clearMnnMmapCache = useCallback(() => {
    const freed = FormatUtils.bytes(mnnMmapCacheBytes);
    setMnnMmapCacheBytes(0);
    appendLog('engine', 'info', `Cleared ${freed} of MNN mmap cache.`);
    showToast(`Cleared ${freed} of mmap cache`);
  }, [mnnMmapCacheBytes, appendLog, showToast]);

  const probeBackends = useCallback(() => {
    setIsProbingBackends(true);
    appendLog('engine', 'info', 'Probing hardware acceleration backends (CPU, OpenCL, Hexagon HTP)...');
    setTimeout(() => {
      setIsProbingBackends(false);
      appendLog('engine', 'info', 'Device probe finished: CPU available, OpenCL Adreno available, Hexagon HTP v75 available.');
    }, 500);
  }, [appendLog]);

  // Model Management operations
  const importLocalModel = useCallback(
    (params: {
      name: string;
      engine: InferenceEngine;
      sizeBytes: number;
      supportsVision: boolean;
      supportsToolCalling: boolean;
    }): LibraryModel => {
      const cleanBase = params.name.trim().replace(/\.gguf$/i, '');
      let finalName = cleanBase;
      let counter = 2;
      while (
        libraryModels.some(
          (m) => m.engine === params.engine && m.name.toLowerCase() === finalName.toLowerCase()
        )
      ) {
        finalName = `${cleanBase} (${counter})`;
        counter++;
      }

      const newModel: LibraryModel = {
        id: `${params.engine}:${finalName.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}-${Date.now()}`,
        runtimeId: finalName,
        name: finalName,
        engine: params.engine,
        sizeBytes: params.sizeBytes,
        supportsVision: params.supportsVision,
        supportsToolCalling: params.supportsToolCalling,
        isVisionEnabled: params.supportsVision,
        availableMmprojs: {},
        warnings: [],
        importedAt: new Date().toISOString(),
      };

      setLibraryModels((prev) => [newModel, ...prev]);
      appendLog('model', 'info', `Imported local ${params.engine} model: ${finalName} (${FormatUtils.bytes(params.sizeBytes)})`);
      showToast(
        finalName !== cleanBase
          ? `Model imported: ${finalName} (auto-renamed)`
          : `Model imported: ${finalName}`
      );
      return newModel;
    },
    [libraryModels, appendLog, showToast]
  );

  const deleteLibraryModel = useCallback(
    (id: string): boolean => {
      const target = libraryModels.find((m) => m.id === id);
      if (!target) return false;
      if (
        runtimeStatus === 'ready' &&
        activeEngine === target.engine &&
        activeModelId === target.runtimeId
      ) {
        showToast(t.modelLibraryActiveCannotDelete);
        return false;
      }
      setLibraryModels((prev) => prev.filter((m) => m.id !== id));
      setSelectedModelByEngine((prev) => {
        if (prev[target.engine] === target.runtimeId) {
          const remaining = libraryModels.filter(
            (m) => m.id !== id && m.engine === target.engine
          );
          return {
            ...prev,
            [target.engine]: remaining[0]?.runtimeId || null,
          };
        }
        return prev;
      });
      appendLog('model', 'info', `Deleted model from library: ${target.name}`);
      showToast(`Deleted: ${target.name}`);
      return true;
    },
    [
      libraryModels,
      runtimeStatus,
      activeEngine,
      activeModelId,
      showToast,
      t.modelLibraryActiveCannotDelete,
      appendLog,
    ]
  );

  const renameLibraryModel = useCallback(
    (id: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) {
        return { ok: false, error: 'Model name cannot be empty.' };
      }
      const target = libraryModels.find((m) => m.id === id);
      if (!target) {
        return { ok: false, error: 'Model not found.' };
      }
      const duplicate = libraryModels.some(
        (m) =>
          m.id !== id &&
          m.engine === target.engine &&
          m.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        return { ok: false, error: 'A model with the same name already exists.' };
      }

      setLibraryModels((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, name: trimmed, runtimeId: trimmed } : m
        )
      );
      setSelectedModelByEngine((prev) => ({
        ...prev,
        [target.engine]:
          prev[target.engine] === target.runtimeId ? trimmed : prev[target.engine],
      }));
      if (activeModelId === target.runtimeId && activeEngine === target.engine) {
        setActiveModelId(trimmed);
      }
      appendLog('model', 'info', `Renamed model "${target.name}" to "${trimmed}"`);
      showToast(`Renamed to ${trimmed}`);
      return { ok: true, finalName: trimmed };
    },
    [libraryModels, activeModelId, activeEngine, appendLog, showToast]
  );

  const toggleModelVision = useCallback((id: string, enabled: boolean) => {
    setLibraryModels((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              isVisionEnabled: enabled,
              supportsVision: enabled || Object.keys(m.availableMmprojs).length > 0 || m.supportsVision,
            }
          : m
      )
    );
  }, []);

  const selectModelMmproj = useCallback((id: string, mmprojPath: string) => {
    setLibraryModels((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, mmprojFilePath: mmprojPath, isVisionEnabled: true, supportsVision: true }
          : m
      )
    );
  }, []);

  const importLocalMmproj = useCallback(
    (id: string, fileName: string) => {
      const localPath = `/data/user/0/com.arkanefans.servllama/files/models/${fileName}`;
      setLibraryModels((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const nextMmprojs = { ...m.availableMmprojs, [fileName]: localPath };
          return {
            ...m,
            supportsVision: true,
            isVisionEnabled: true,
            mmprojFilePath: localPath,
            availableMmprojs: nextMmprojs,
          };
        })
      );
      appendLog('model', 'info', `Imported multimodal projector: ${fileName}`);
      showToast(`mmproj imported: ${fileName}`);
    },
    [appendLog, showToast]
  );

  const removeModelMmproj = useCallback(
    (id: string, mmprojKey?: string) => {
      setLibraryModels((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const nextMmprojs = { ...m.availableMmprojs };
          if (mmprojKey) {
            delete nextMmprojs[mmprojKey];
          } else {
            Object.keys(nextMmprojs).forEach((k) => delete nextMmprojs[k]);
          }
          const remainingPaths = Object.values(nextMmprojs);
          const nextSelected = remainingPaths[0] || undefined;
          return {
            ...m,
            mmprojFilePath: nextSelected,
            isVisionEnabled: nextSelected ? m.isVisionEnabled : false,
            availableMmprojs: nextMmprojs,
          };
        })
      );
      showToast('mmproj removed');
    },
    [showToast]
  );

  // Download Queue Progression Ticker
  useEffect(() => {
    const runningTasks = downloadTasks.filter((t) => t.status === 'running' || t.status === 'queued');
    if (runningTasks.length === 0) return;

    const interval = setInterval(() => {
      setDownloadTasks((prev) => {
        let activeCount = prev.filter((t) => t.status === 'running').length;
        const maxConcurrent = downloadSettings.maxConcurrentTasks;

        return prev.map((task) => {
          if (task.status === 'queued' && activeCount < maxConcurrent) {
            activeCount++;
            return {
              ...task,
              status: 'running',
              speedBytesPerSec: 18.5 * 1024 * 1024,
            };
          }
          if (task.status !== 'running') return task;

          const step = Math.max(task.totalBytes * 0.14, 15 * 1024 * 1024);
          const nextReceived = Math.min(task.totalBytes, task.receivedBytes + step);

          if (nextReceived >= task.totalBytes) {
            return {
              ...task,
              receivedBytes: task.totalBytes,
              speedBytesPerSec: 0,
              status: 'completed',
            };
          }

          return {
            ...task,
            receivedBytes: nextReceived,
            speedBytesPerSec: (14 + Math.random() * 8) * 1024 * 1024,
          };
        });
      });
    }, 800);

    return () => clearInterval(interval);
  }, [downloadTasks, downloadSettings.maxConcurrentTasks]);

  // Automatically finalize completed downloads into the library
  useEffect(() => {
    const completed = downloadTasks.filter((t) => t.status === 'completed');
    if (completed.length === 0) return;

    completed.forEach((task) => {
      if (task.targetModelId) {
        // Projector download for an existing model
        const file = task.files[0];
        if (file) {
          const localPath = `/data/user/0/com.arkanefans.servllama/files/models/${task.modelName}/${file.fileName}`;
          setLibraryModels((prev) =>
            prev.map((m) =>
              m.id === task.targetModelId
                ? {
                    ...m,
                    supportsVision: true,
                    isVisionEnabled: true,
                    mmprojFilePath: m.mmprojFilePath || localPath,
                    availableMmprojs: {
                      ...m.availableMmprojs,
                      [file.path]: localPath,
                    },
                  }
                : m
            )
          );
          showToast(`${file.fileName} has finished downloading`);
        }
      } else {
        // Full model download
        const hasMmproj = task.files.some((f) => f.isMmproj);
        const mmprojFile = task.files.find((f) => f.isMmproj);
        const localMmprojPath = mmprojFile
          ? `/data/user/0/com.arkanefans.servllama/files/models/${task.modelName}/${mmprojFile.fileName}`
          : undefined;

        const newModel: LibraryModel = {
          id: `${task.engine}:${task.modelName.toLowerCase()}-${Date.now()}`,
          runtimeId: task.modelName,
          name: task.modelName,
          engine: task.engine,
          sizeBytes: task.totalBytes,
          supportsVision: hasMmproj || /vl|vision|qwen3\.5|gemma-4/i.test(task.repoId),
          supportsToolCalling: /qwen3\.5|tool/i.test(task.repoId),
          isVisionEnabled: Boolean(localMmprojPath) || task.engine === 'mnn',
          repoId: task.repoId,
          source: task.source,
          revision: task.revision,
          quantLabel: task.quantLabel,
          mmprojFilePath: localMmprojPath,
          availableMmprojs:
            mmprojFile && localMmprojPath ? { [mmprojFile.path]: localMmprojPath } : {},
          warnings: [],
          importedAt: new Date().toISOString(),
        };

        setLibraryModels((prev) => {
          if (prev.some((m) => m.engine === newModel.engine && m.name === newModel.name)) {
            return prev;
          }
          return [newModel, ...prev];
        });
        appendLog(
          'download',
          'info',
          `Download completed and imported into library: ${task.modelName}`
        );
        showToast(`${task.modelName} has finished downloading`);
      }
    });

    setDownloadTasks((prev) => prev.filter((t) => t.status !== 'completed'));
  }, [downloadTasks, appendLog, showToast]);

  const enqueueDownload = useCallback(
    (params: {
      engine: InferenceEngine;
      source: ModelHubSource;
      repoId: string;
      revision: string;
      modelName: string;
      files: HubRepoFile[];
      quantLabel?: string;
      targetModelId?: string;
    }) => {
      const alreadyQueued = downloadTasks.some(
        (t) =>
          t.engine === params.engine &&
          t.repoId === params.repoId &&
          t.targetModelId === params.targetModelId &&
          t.files[0]?.path === params.files[0]?.path
      );
      if (alreadyQueued) {
        showToast(t.downloadErrorAlreadyQueued);
        return { ok: false, error: t.downloadErrorAlreadyQueued };
      }

      let finalName = params.modelName;
      let wasAutoRenamed = false;
      if (!params.targetModelId) {
        let counter = 2;
        while (
          libraryModels.some(
            (m) => m.engine === params.engine && m.name.toLowerCase() === finalName.toLowerCase()
          ) ||
          downloadTasks.some(
            (d) => d.engine === params.engine && d.modelName.toLowerCase() === finalName.toLowerCase()
          )
        ) {
          finalName = `${params.modelName} (${counter})`;
          wasAutoRenamed = true;
          counter++;
        }
      }

      const totalBytes = params.files.reduce((sum, f) => sum + Math.max(f.sizeBytes, 1024 * 1024), 0);
      const task: DownloadTask = {
        id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        engine: params.engine,
        source: params.source,
        repoId: params.repoId,
        revision: params.revision,
        modelName: finalName,
        requestedModelName: params.modelName,
        wasAutoRenamed,
        quantLabel: params.quantLabel,
        targetModelId: params.targetModelId,
        files: params.files,
        status: 'running',
        receivedBytes: Math.round(totalBytes * 0.08),
        totalBytes,
        speedBytesPerSec: 16.4 * 1024 * 1024,
        createdAt: new Date().toISOString(),
      };

      setDownloadTasks((prev) => [task, ...prev]);
      appendLog(
        'download',
        'info',
        `Started downloading ${finalName} from ${params.source === 'huggingFace' ? 'Hugging Face' : 'ModelScope'} (${FormatUtils.bytes(totalBytes)})`
      );
      showToast(`${finalName} added to download queue`);
      return { ok: true, task };
    },
    [downloadTasks, libraryModels, appendLog, showToast, t.downloadErrorAlreadyQueued]
  );

  const pauseDownload = useCallback((taskId: string) => {
    setDownloadTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'paused', speedBytesPerSec: 0 } : t
      )
    );
  }, []);

  const resumeDownload = useCallback((taskId: string) => {
    setDownloadTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'running', speedBytesPerSec: 15.2 * 1024 * 1024 }
          : t
      )
    );
  }, []);

  const cancelDownload = useCallback((taskId: string) => {
    setDownloadTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const switchDownloadSource = useCallback(
    (taskId: string) => {
      setDownloadTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const nextSource: ModelHubSource =
            t.source === 'huggingFace' ? 'modelScope' : 'huggingFace';
          appendLog(
            'download',
            'info',
            `Switched download source for ${t.modelName} to ${nextSource === 'huggingFace' ? 'Hugging Face' : 'ModelScope'}`
          );
          return {
            ...t,
            source: nextSource,
            status: 'running',
            speedBytesPerSec: 17.8 * 1024 * 1024,
          };
        })
      );
    },
    [appendLog]
  );

  const updateDownloadSettings = useCallback((partial: Partial<DownloadSettings>) => {
    setDownloadSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearOrphanedStaging = useCallback(() => {
    setOrphanedStagingBytes(0);
    showToast(t.settingsClearStagingDone);
  }, [showToast, t.settingsClearStagingDone]);

  // Chat Operations
  const createSession = useCallback((): string => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSessionRecord = {
      id: newId,
      title: t.chatNewSession,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelId: activeModelId || selectedModelId || undefined,
      engine: activeEngine,
    };
    setSessions((prev) => [newSession, ...prev]);
    setMessagesBySession((prev) => ({ ...prev, [newId]: [] }));
    setSelectedSessionId(newId);
    return newId;
  }, [t.chatNewSession, activeModelId, selectedModelId, activeEngine]);

  const selectSession = useCallback((id: string) => {
    setSelectedSessionId(id);
  }, []);

  const renameSession = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title: trimmed, updatedAt: new Date().toISOString() } : s
      )
    );
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (selectedSessionId === id) {
          setSelectedSessionId(remaining[0]?.id || '');
        }
        return remaining;
      });
      setMessagesBySession((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [selectedSessionId]
  );

  const addPendingImage = useCallback(
    (dataUrl: string) => {
      setPendingImages((prev) => {
        if (prev.length >= 5) {
          showToast(t.chatImageLimitExceeded);
          return prev;
        }
        return [...prev, dataUrl];
      });
    },
    [showToast, t.chatImageLimitExceeded]
  );

  const removePendingImage = useCallback((index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPendingImages = useCallback(() => {
    setPendingImages([]);
  }, []);

  const generateAssistantResponse = useCallback(
    async (
      sessionId: string,
      promptText: string,
      hasImages: boolean,
      targetAssistantMessageId?: string
    ) => {
      const modelLabel = activeModelId || selectedModelId || 'Qwen3.5-0.8B-Q4_K_M';
      const engineLabel = activeEngine === 'llama_cpp' ? 'llama.cpp' : 'MNN';

      const reasoningText = hasImages
        ? `Analyzing attached image tokens (${serverSettings.imageMaxTokens} max tokens) with ${modelLabel} on ${engineLabel} (${activeEngine === 'llama_cpp' ? serverSettings.llamaCppBackend.toUpperCase() : serverSettings.mnnBackend.toUpperCase()})... Extracting visual features and formulating a helpful response.`
        : `Processing prompt on local ${engineLabel} runtime using ${modelLabel} (ctx=${serverSettings.contextSize}, threads=${activeEngine === 'llama_cpp' ? serverSettings.cpuThreads : serverSettings.mnnThreadNum}). Structuring a concise, accurate answer.`;

      const lower = promptText.toLowerCase();
      let replyBody = '';
      if (hasImages) {
        replyBody = `I inspected your attached image using **${modelLabel}** (${engineLabel} vision projector enabled).\n\n- **Image token budget**: \`${serverSettings.imageMaxTokens}\` tokens\n- **Detected content**: Clear visual subject with sharp foreground contrast.\n\nYou can adjust **Image max tokens** in **Server → Server config** if you need higher-resolution visual detail or faster prefill speed.`;
      } else if (lower.includes('api') || lower.includes('curl') || lower.includes('openai')) {
        replyBody = `You can call this running **${modelLabel}** instance from any OpenAI-compatible client using \`${displayUrl}/v1\`:\n\n\`\`\`bash\ncurl -N ${displayUrl}/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  ${serverSettings.apiKey ? `-H "Authorization: Bearer ${serverSettings.apiKey}" \\\n  ` : ''}-d '{\n    "model": "${modelLabel}",\n    "messages": [{"role": "user", "content": "${promptText.replace(/"/g, '\\"').slice(0, 60)}"}],\n    "stream": true\n  }'\n\`\`\``;
      } else if (lower.includes('mnn') || lower.includes('gguf') || lower.includes('engine')) {
        replyBody = `Currently serving **${modelLabel}** on the **${engineLabel}** engine:\n\n- **Format**: ${activeEngine === 'llama_cpp' ? 'Single `.gguf` file (+ optional `mmproj` for vision)' : 'MNN exported directory (`llm.mnn`, `llm.mnn.weight`, `tokenizer.txt`)'}\n- **Active Backend**: \`${activeEngine === 'llama_cpp' ? serverSettings.llamaCppBackend.toUpperCase() : serverSettings.mnnBackend.toUpperCase()}\`\n- **Endpoint**: \`${displayUrl}\``;
      } else {
        replyBody = `Here is the response from **${modelLabel}** running locally via **${engineLabel}** on \`${displayUrl}\`:\n\n> "${promptText.slice(0, 120)}"\n\n1. **Local Execution**: All weights and KV cache (up to \`${serverSettings.contextSize}\` tokens) stay on your device.\n2. **Runtime Parameters**: Running with \`${activeEngine === 'llama_cpp' ? serverSettings.cpuThreads : serverSettings.mnnThreadNum}\` CPU threads and \`${serverSettings. useMmap ? 'mmap enabled' : 'mmap disabled'}\`.\n\nLet me know if you want to test code generation, reasoning, or vision inputs!`;
      }

      streamAbortRef.current = false;
      setIsStreaming(true);
      setStreamingReasoning('');
      setStreamingContent('');

      appendLog(
        'engine',
        'info',
        `POST /v1/chat/completions (model=${modelLabel}, stream=true)`
      );

      // Stream reasoning tokens
      const rWords = reasoningText.split(' ');
      let currentR = '';
      for (let i = 0; i < rWords.length; i++) {
        if (streamAbortRef.current) break;
        currentR += (i === 0 ? '' : ' ') + rWords[i];
        setStreamingReasoning(currentR);
        await new Promise((r) => setTimeout(r, 18));
      }

      // Stream content tokens
      const cWords = replyBody.split(' ');
      let currentC = '';
      for (let i = 0; i < cWords.length; i++) {
        if (streamAbortRef.current) break;
        currentC += (i === 0 ? '' : ' ') + cWords[i];
        setStreamingContent(currentC);
        await new Promise((r) => setTimeout(r, 20));
      }

      const finalVersion = {
        id: `v-${Date.now()}`,
        content: currentC || replyBody,
        reasoning: currentR || reasoningText,
        imageAttachments: [],
        createdAt: new Date().toISOString(),
      };

      setMessagesBySession((prev) => {
        const list = prev[sessionId] || [];
        if (targetAssistantMessageId) {
          return {
            ...prev,
            [sessionId]: list.map((m) =>
              m.id === targetAssistantMessageId
                ? {
                    ...m,
                    versions: [...m.versions, finalVersion],
                    activeVersionIndex: m.versions.length,
                  }
                : m
            ),
          };
        }
        const assistantRecord: ChatMessageRecord = {
          id: `msg-${Date.now()}-ai`,
          sessionId,
          role: 'assistant',
          versions: [finalVersion],
          activeVersionIndex: 0,
          createdAt: new Date().toISOString(),
        };
        return {
          ...prev,
          [sessionId]: [...list, assistantRecord],
        };
      });

      setIsStreaming(false);
      setStreamingReasoning('');
      setStreamingContent('');
    },
    [
      activeModelId,
      selectedModelId,
      activeEngine,
      serverSettings,
      displayUrl,
      appendLog,
    ]
  );

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      const trimmed = content.trim();
      const attachments = images ?? pendingImages;
      if (!trimmed && attachments.length === 0) return;

      if (runtimeStatus !== 'ready') {
        showToast(t.chatInputHintStartServer);
        return;
      }

      let targetSessionId = selectedSessionId;
      if (!targetSessionId || !sessions.some((s) => s.id === targetSessionId)) {
        targetSessionId = createSession();
      }

      const userMsg: ChatMessageRecord = {
        id: `msg-${Date.now()}-user`,
        sessionId: targetSessionId,
        role: 'user',
        activeVersionIndex: 0,
        createdAt: new Date().toISOString(),
        versions: [
          {
            id: `v-${Date.now()}`,
            content: trimmed,
            imageAttachments: attachments,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      setMessagesBySession((prev) => ({
        ...prev,
        [targetSessionId]: [...(prev[targetSessionId] || []), userMsg],
      }));

      // Auto-title session if it's the first user message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          const isDefaultTitle =
            s.title === translations.en.chatNewSession ||
            s.title === translations.zh.chatNewSession;
          return {
            ...s,
            title: isDefaultTitle && trimmed ? trimmed.slice(0, 38) : s.title,
            updatedAt: new Date().toISOString(),
            modelId: activeModelId || s.modelId,
            engine: activeEngine,
          };
        })
      );

      setPendingImages([]);
      await generateAssistantResponse(
        targetSessionId,
        trimmed || 'Attached image',
        attachments.length > 0
      );
    },
    [
      pendingImages,
      runtimeStatus,
      selectedSessionId,
      sessions,
      createSession,
      activeModelId,
      activeEngine,
      generateAssistantResponse,
      showToast,
      t.chatInputHintStartServer,
    ]
  );

  const stopStreaming = useCallback(() => {
    streamAbortRef.current = true;
  }, []);

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const trimmed = newContent.trim();
      if (!trimmed || !selectedSessionId) return;

      const list = messagesBySession[selectedSessionId] || [];
      const index = list.findIndex((m) => m.id === messageId);
      if (index === -1) return;

      const target = list[index];
      const currentVersion = target.versions[target.activeVersionIndex];
      const nextVersion = {
        id: `v-${Date.now()}`,
        content: trimmed,
        imageAttachments: currentVersion?.imageAttachments || [],
        createdAt: new Date().toISOString(),
      };

      const updatedMsg: ChatMessageRecord = {
        ...target,
        versions: [...target.versions, nextVersion],
        activeVersionIndex: target.versions.length,
      };

      // Keep messages up to edited user message, then regenerate assistant response
      const truncated = [...list.slice(0, index), updatedMsg];
      setMessagesBySession((prev) => ({
        ...prev,
        [selectedSessionId]: truncated,
      }));
      showToast(t.chatMessageUpdated);

      if (target.role === 'user' && runtimeStatus === 'ready') {
        await generateAssistantResponse(
          selectedSessionId,
          trimmed,
          nextVersion.imageAttachments.length > 0
        );
      }
    },
    [
      selectedSessionId,
      messagesBySession,
      runtimeStatus,
      generateAssistantResponse,
      showToast,
      t.chatMessageUpdated,
    ]
  );

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      if (!selectedSessionId || runtimeStatus !== 'ready') return;
      const list = messagesBySession[selectedSessionId] || [];
      const idx = list.findIndex((m) => m.id === messageId);
      if (idx === -1) return;

      const msg = list[idx];
      if (msg.role === 'assistant') {
        const prevUser = list
          .slice(0, idx)
          .reverse()
          .find((m) => m.role === 'user');
        const prompt =
          prevUser?.versions[prevUser.activeVersionIndex]?.content || 'Hello';
        const hasImages =
          (prevUser?.versions[prevUser.activeVersionIndex]?.imageAttachments
            .length || 0) > 0;
        await generateAssistantResponse(
          selectedSessionId,
          prompt,
          hasImages,
          msg.id
        );
      } else {
        const prompt = msg.versions[msg.activeVersionIndex]?.content || 'Hello';
        const hasImages =
          (msg.versions[msg.activeVersionIndex]?.imageAttachments.length || 0) >
          0;
        const nextAssistant = list[idx + 1];
        await generateAssistantResponse(
          selectedSessionId,
          prompt,
          hasImages,
          nextAssistant?.role === 'assistant' ? nextAssistant.id : undefined
        );
      }
    },
    [selectedSessionId, runtimeStatus, messagesBySession, generateAssistantResponse]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!selectedSessionId) return;
      setMessagesBySession((prev) => ({
        ...prev,
        [selectedSessionId]: (prev[selectedSessionId] || []).filter(
          (m) => m.id !== messageId
        ),
      }));
    },
    [selectedSessionId]
  );

  const selectMessageVersion = useCallback(
    (messageId: string, versionIndex: number) => {
      if (!selectedSessionId) return;
      setMessagesBySession((prev) => ({
        ...prev,
        [selectedSessionId]: (prev[selectedSessionId] || []).map((m) =>
          m.id === messageId
            ? {
                ...m,
                activeVersionIndex: Math.max(
                  0,
                  Math.min(m.versions.length - 1, versionIndex)
                ),
              }
            : m
        ),
      }));
    },
    [selectedSessionId]
  );

  return (
    <AppContext.Provider
      value={{
        activePage,
        navigateTo,
        goBack,
        activeRepo,
        openRepoDetail,
        themeMode,
        setThemeMode,
        isDark,
        localeMode,
        setLocaleMode,
        lang,
        t,
        toastMessage,
        showToast,
        activeEngine,
        runtimeStatus,
        runtimePhase,
        startedAt,
        activeModelId,
        selectedModelByEngine,
        selectedModelId,
        serverSettings,
        updateServerSettings,
        resetServerSettings,
        switchEngine,
        selectModelForEngine,
        activateModel,
        startServer,
        stopServer,
        toggleServer,
        displayUrl,
        exposesLanWithoutApiKey,
        mnnMmapCacheBytes,
        clearMnnMmapCache,
        probeBackends,
        isProbingBackends,
        libraryModels,
        importLocalModel,
        deleteLibraryModel,
        renameLibraryModel,
        toggleModelVision,
        selectModelMmproj,
        importLocalMmproj,
        removeModelMmproj,
        downloadTasks,
        downloadSettings,
        updateDownloadSettings,
        enqueueDownload,
        pauseDownload,
        resumeDownload,
        cancelDownload,
        switchDownloadSource,
        orphanedStagingBytes,
        clearOrphanedStaging,
        sessions,
        selectedSessionId,
        messagesBySession,
        sessionSearchQuery,
        setSessionSearchQuery,
        createSession,
        selectSession,
        renameSession,
        deleteSession,
        isStreaming,
        streamingContent,
        streamingReasoning,
        pendingImages,
        addPendingImage,
        removePendingImage,
        clearPendingImages,
        sendMessage,
        stopStreaming,
        editMessage,
        regenerateMessage,
        deleteMessage,
        selectMessageVersion,
        chatTimeoutSeconds,
        setChatTimeoutSeconds,
        logs,
        appendLog,
        clearLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
