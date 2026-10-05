import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { InferenceEngine, LibraryModel, ChatMessageRecord } from '../types/models';
import { EngineBadge, ModelFormatBadge } from '../components/CommonBadges';
import { FormatUtils } from '../utils/format';
import {
  Menu,
  SquarePen,
  ChevronDown,
  ChevronRight,
  Send,
  Square,
  Server,
  Cpu,
  Image as ImageIcon,
  X,
  Copy,
  Edit3,
  RotateCw,
  Trash2,
  Check,
  ChevronLeft,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ChatPageProps {
  onOpenSidebar: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onOpenSidebar }) => {
  const {
    t,
    sessions,
    selectedSessionId,
    messagesBySession,
    activeEngine,
    runtimeStatus,
    runtimePhase,
    activeModelId,
    selectedModelId,
    libraryModels,
    selectModelForEngine,
    activateModel,
    startServer,
    stopServer,
    toggleServer,
    createSession,
    sendMessage,
    stopStreaming,
    isStreaming,
    streamingContent,
    streamingReasoning,
    pendingImages,
    addPendingImage,
    removePendingImage,
    editMessage,
    regenerateMessage,
    deleteMessage,
    selectMessageVersion,
    showToast,
    navigateTo,
    switchEngine,
  } = useApp();

  const [inputContent, setInputContent] = useState('');
  const [showModelSheet, setShowModelSheet] = useState(false);
  const [showEngineSheet, setShowEngineSheet] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [openReasoningMap, setOpenReasoningMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find((s) => s.id === selectedSessionId);
  const messages: ChatMessageRecord[] = currentSession ? messagesBySession[currentSession.id] || [] : [];

  const isServerRunning = runtimeStatus === 'ready';
  const isServerBusy = runtimeStatus === 'preparing' || runtimeStatus === 'stopping';

  const activeModel = libraryModels.find(
    (m) => m.engine === activeEngine && (m.runtimeId === activeModelId || m.runtimeId === selectedModelId)
  );

  const displayModelName = activeModel?.name || activeModelId || selectedModelId || t.serverNoModelSelected;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, streamingReasoning]);

  const handleSend = () => {
    if (!inputContent.trim() && pendingImages.length === 0) return;
    sendMessage(inputContent);
    setInputContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t.chatMessageCopied);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast(t.chatImageSizeExceeded);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        addPendingImage(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addSampleTestImage = () => {
    // Standard red test apple icon representation
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100">
      <circle cx="50" cy="55" r="35" fill="#EF4444" />
      <circle cx="65" cy="55" r="30" fill="#DC2626" />
      <path d="M50 20 Q55 10 65 15" stroke="#16A34A" stroke-width="4" fill="none" stroke-linecap="round" />
      <ellipse cx="60" cy="18" rx="8" ry="4" fill="#22C55E" transform="rotate(-20 60 18)" />
    </svg>`;
    const dataUrl = `data:image/svg+xml;base64,${btoa(sampleSvg)}`;
    addPendingImage(dataUrl);
  };

  const toggleReasoning = (id: string) => {
    setOpenReasoningMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFC] dark:bg-[#091120] relative overflow-hidden">
      {/* Top App Bar */}
      <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c1626]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center Title + Subtitle */}
        <div
          onClick={() => setShowModelSheet(true)}
          className="flex flex-col items-center cursor-pointer px-3 py-1 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors max-w-xs sm:max-w-md"
        >
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
            {currentSession?.title || t.chatNewSession}
          </span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span>{activeEngine === 'llama_cpp' ? 'llama.cpp' : 'MNN'}</span>
            <span>/</span>
            <span className="truncate max-w-[150px]">{displayModelName}</span>
            <ChevronDown className="w-3 h-3" />
          </span>
        </div>

        <button
          onClick={() => createSession()}
          title={t.chatCreateSessionTooltip}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Empty Hero State when no messages or server stopped */}
          {messages.length === 0 && !isStreaming ? (
            <div className="py-12 px-4 text-center max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-[#4C82FF]/15 to-[#4C82FF]/5 flex items-center justify-center text-[#4C82FF] mb-4 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                {t.chatHeroTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {!isServerRunning
                  ? t.chatHeroDescriptionStartServer
                  : !activeModelId
                  ? t.chatHeroDescriptionSelectModel
                  : t.chatHeroDescriptionReady}
              </p>

              <div className="w-full flex flex-col gap-2.5">
                {!isServerRunning ? (
                  <button
                    onClick={() => setShowEngineSheet(true)}
                    disabled={isServerBusy}
                    className="w-full py-3 px-4 rounded-2xl bg-[#4C82FF] hover:bg-[#3B6BF5] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Server className="w-4 h-4" />
                    <span>{isServerBusy ? t.chatStartingServer : t.chatStartServer}</span>
                  </button>
                ) : !activeModelId ? (
                  <button
                    onClick={() => setShowModelSheet(true)}
                    className="w-full py-3 px-4 rounded-2xl bg-[#4C82FF] hover:bg-[#3B6BF5] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{t.chatSelectModel}</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-300">
                    {t.chatHeroDescriptionReady}
                  </div>
                )}

                <button
                  onClick={() => navigateTo('discover')}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                >
                  {t.discoverTitle}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Message List */}
              {messages.map((message) => {
                const isUser = message.role === 'user';
                const version = message.versions[message.activeVersionIndex] || message.versions[0];
                const totalVersions = message.versions.length;
                const hasMultipleVersions = totalVersions > 1;

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col group ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    {/* User / Assistant Bubble */}
                    <div
                      className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-[#4C82FF] text-white rounded-tr-sm'
                          : 'bg-white dark:bg-[#0c1626] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-tl-sm'
                      }`}
                    >
                      {/* Image attachments if any */}
                      {version?.imageAttachments && version.imageAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {version.imageAttachments.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Attachment"
                              className="w-24 h-24 object-cover rounded-xl border border-white/20 dark:border-black/20"
                            />
                          ))}
                        </div>
                      )}

                      {/* Reasoning Process (<think>) for assistant */}
                      {!isUser && version?.reasoning && (
                        <div className="mb-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden">
                          <button
                            onClick={() => toggleReasoning(message.id)}
                            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#4C82FF]" />
                              <span>{t.chatReasoningProcess}</span>
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                openReasoningMap[message.id] ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {openReasoningMap[message.id] && (
                            <div className="p-3 pt-0 text-[11px] text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap border-t border-slate-200/40 dark:border-slate-800/40">
                              {version.reasoning}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="whitespace-pre-wrap">{version?.content}</div>
                    </div>

                    {/* Bottom Metadata & Controls (Copy, Edit, Regenerate, Versions) */}
                    <div className="flex items-center gap-2 mt-1.5 px-2 text-[10px] text-slate-400 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Version Selector */}
                      {hasMultipleVersions && (
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 rounded-md px-1.5 py-0.5">
                          <button
                            disabled={message.activeVersionIndex <= 0}
                            onClick={() => selectMessageVersion(message.id, message.activeVersionIndex - 1)}
                            className="disabled:opacity-30 hover:text-slate-900 dark:hover:text-slate-100"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <span>
                            {message.activeVersionIndex + 1}/{totalVersions}
                          </span>
                          <button
                            disabled={message.activeVersionIndex >= totalVersions - 1}
                            onClick={() => selectMessageVersion(message.id, message.activeVersionIndex + 1)}
                            className="disabled:opacity-30 hover:text-slate-900 dark:hover:text-slate-100"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleCopyText(version?.content || '')}
                        title={t.chatCopyMessage}
                        className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-0.5"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      {isUser ? (
                        <button
                          onClick={() => setEditingMessage({ id: message.id, content: version?.content || '' })}
                          title={t.chatEditMessage}
                          className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-0.5"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => regenerateMessage(message.id)}
                          title={t.chatRegenerateMessage}
                          className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-0.5"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteMessage(message.id)}
                        title={t.commonDelete}
                        className="hover:text-red-500 flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Streaming Assistant Response preview */}
              {isStreaming && (
                <div className="flex flex-col items-start">
                  <div className="max-w-[85%] rounded-3xl rounded-tl-sm p-4 text-xs leading-relaxed shadow-2xs bg-white dark:bg-[#0c1626] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800">
                    {streamingReasoning && (
                      <div className="mb-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 p-3 text-[11px] text-slate-500 font-mono whitespace-pre-wrap">
                        <div className="flex items-center gap-1.5 font-bold mb-1 text-slate-600 dark:text-slate-300">
                          <Sparkles className="w-3 h-3 text-[#4C82FF] animate-pulse" />
                          <span>{t.chatReasoningProcess}</span>
                        </div>
                        {streamingReasoning}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {streamingContent || (
                        <span className="inline-block w-2 h-4 bg-[#4C82FF] animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Chat Input Bar */}
      <footer className="p-3 sm:p-4 bg-white/90 dark:bg-[#0c1626]/90 border-t border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-sm focus-within:border-[#4C82FF] transition-all">
          {/* Pending Image Attachments Strip */}
          {pendingImages.length > 0 && (
            <div className="flex items-center gap-2 px-2 pt-1 pb-2 overflow-x-auto">
              {pendingImages.map((img, index) => (
                <div key={index} className="relative group shrink-0">
                  <img
                    src={img}
                    alt="Pending upload"
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                  />
                  <button
                    onClick={() => removePendingImage(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea Input */}
          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              !isServerRunning
                ? t.chatInputHintStartServer
                : isServerBusy
                ? t.chatInputHintLoadingModel
                : !activeModelId
                ? t.chatInputHintSelectModel
                : t.chatInputHintEnterMessage
            }
            className="w-full px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 bg-transparent resize-none focus:outline-none min-h-[40px] max-h-32"
          />

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1">
            <div className="flex items-center gap-1.5">
              {/* Server toggle button */}
              <button
                onClick={toggleServer}
                disabled={isServerBusy}
                title={isServerRunning ? t.serverStop : t.serverStart}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Server className="w-4 h-4" />
                <span
                  className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${
                    isServerRunning ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </button>

              {/* Model selection button */}
              <button
                onClick={() => setShowModelSheet(true)}
                disabled={isServerBusy}
                title={t.chatSelectModel}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Cpu className="w-4 h-4" />
              </button>

              {/* Image attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title={t.chatAttachImage}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {/* Quick sample test image */}
              <button
                onClick={addSampleTestImage}
                title="Add Test Image"
                className="hidden sm:inline-flex px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                + Test Image
              </button>
            </div>

            {/* Send or Stop Streaming button */}
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                title={t.chatStop}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-xs"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!isServerRunning || (!inputContent.trim() && pendingImages.length === 0)}
                title={t.chatSend}
                className="p-2 rounded-full bg-[#4C82FF] hover:bg-[#3B6BF5] disabled:opacity-40 disabled:hover:bg-[#4C82FF] text-white transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Model Selection Sheet Modal */}
      {showModelSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#0c1626] w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.chatSelectModel}
                </h3>
                <EngineBadge engine={activeEngine} />
              </div>
              <button
                onClick={() => setShowModelSheet(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {libraryModels.filter((m) => m.engine === activeEngine).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t.modelLibraryEmptyTitle}
                </div>
              ) : (
                libraryModels
                  .filter((m) => m.engine === activeEngine)
                  .map((model) => {
                    const isSelected = model.runtimeId === activeModelId;
                    return (
                      <div
                        key={model.id}
                        onClick={async () => {
                          setShowModelSheet(false);
                          if (isServerRunning) {
                            await activateModel(model.runtimeId, activeEngine);
                          } else {
                            selectModelForEngine(model.runtimeId, activeEngine);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#4C82FF] bg-[#4C82FF]/5 dark:bg-[#4C82FF]/10'
                            : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ModelFormatBadge engine={model.engine} size={36} />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {model.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {FormatUtils.bytes(model.sizeBytes)} ·{' '}
                              {model.supportsVision ? 'Vision' : 'Text'}
                            </div>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-[#4C82FF]" />}
                      </div>
                    );
                  })
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowModelSheet(false);
                  navigateTo('models');
                }}
                className="text-xs font-semibold text-[#4C82FF] hover:underline"
              >
                {t.modelManagementTitle}
              </button>
              <button
                onClick={() => {
                  setShowModelSheet(false);
                  navigateTo('discover');
                }}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                {t.discoverTitle}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Engine Selection Sheet Modal */}
      {showEngineSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#0c1626] w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t.chatChooseEngineToStart}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  switchEngine('llama_cpp');
                  setShowEngineSheet(false);
                  startServer('llama_cpp');
                }}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#3B6BF5] hover:bg-[#3B6BF5]/5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B6BF5]" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      llama.cpp
                    </div>
                    <div className="text-[10px] text-slate-400">
                      GGUF models with CPU/NPU acceleration
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  switchEngine('mnn');
                  setShowEngineSheet(false);
                  startServer('mnn');
                }}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#E5601F] hover:bg-[#E5601F]/5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5601F]" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      MNN
                    </div>
                    <div className="text-[10px] text-slate-400">
                      MNN models with mobile CPU/GPU optimization
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <button
              onClick={() => setShowEngineSheet(false)}
              className="mt-3 w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {t.commonCancel}
            </button>
          </div>
        </div>
      )}

      {/* Edit Message Sheet Modal */}
      {editingMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#0c1626] w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t.chatEditMessageTitle}
            </h3>
            <textarea
              value={editingMessage.content}
              onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
              rows={4}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:border-[#4C82FF] focus:outline-none mb-3"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingMessage(null)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {t.commonCancel}
              </button>
              <button
                onClick={() => {
                  editMessage(editingMessage.id, editingMessage.content);
                  setEditingMessage(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#4C82FF] hover:bg-[#3B6BF5] rounded-xl shadow-xs"
              >
                {t.commonSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
