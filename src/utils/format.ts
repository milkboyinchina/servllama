export const FormatUtils = {
  bytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    const decimals = unitIndex >= 3 ? 2 : unitIndex >= 2 ? 1 : 0;
    return `${value.toFixed(decimals)} ${units[unitIndex]}`;
  },

  duration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins < 60) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  },

  extractQuantLabel(fileName: string): string | undefined {
    const match = fileName.match(
      /(Q[2-8]_[A-Z0-9_]+|IQ[1-4]_[A-Z0-9_]+|F16|BF16|FP16|Q4_0|Q8_0)/i
    );
    return match ? match[1].toUpperCase() : undefined;
  },
};

export function buildLlamaServerLaunchArgs(
  settings: {
    listenMode: 'localhost' | 'allInterfaces';
    port: number;
    apiKey: string;
    contextSize: number;
    batchSize: number;
    cpuThreads: number;
    parallelSlots: number;
    imageMaxTokens: number;
    flashAttentionMode: 'auto' | 'enabled' | 'disabled';
    useMmap: boolean;
    logEnabled: boolean;
    logLevel: 'error' | 'warning' | 'info' | 'debug';
    llamaCppBackend: 'cpu' | 'opencl' | 'hexagon';
    llamaCppGpuLayers: number;
  },
  options: {
    modelPath: string;
    modelAlias: string;
    mmprojPath?: string;
    offloadDeviceName?: string;
  }
): string[] {
  const host = settings.listenMode === 'localhost' ? '127.0.0.1' : '0.0.0.0';
  const flashAttn =
    settings.flashAttentionMode === 'auto'
      ? 'auto'
      : settings.flashAttentionMode === 'enabled'
        ? 'on'
        : 'off';
  const logVerbosity =
    settings.logLevel === 'error'
      ? '1'
      : settings.logLevel === 'warning'
        ? '2'
        : settings.logLevel === 'info'
          ? '3'
          : '4';

  const args: string[] = [
    '--host',
    host,
    '--port',
    `${settings.port}`,
    '--model',
    options.modelPath,
    '--alias',
    options.modelAlias,
    '--ctx-size',
    `${settings.contextSize}`,
    '--batch-size',
    `${settings.batchSize}`,
    '--threads',
    `${settings.cpuThreads}`,
    '--parallel',
    `${settings.parallelSlots}`,
    '--image-max-tokens',
    `${settings.imageMaxTokens}`,
    '--flash-attn',
    flashAttn,
  ];

  if (options.mmprojPath) {
    args.push('--mmproj', options.mmprojPath);
  }
  if (!settings.useMmap) {
    args.push('--no-mmap');
  }
  if (settings.apiKey.trim().length > 0) {
    args.push('--api-key', settings.apiKey.trim());
  }
  if (settings.logEnabled) {
    args.push('--log-verbosity', logVerbosity);
  } else {
    args.push('--log-disable');
  }

  if (settings.llamaCppBackend === 'cpu') {
    args.push('--device', 'none');
  } else {
    const fallback = settings.llamaCppBackend === 'opencl' ? 'GPUOpenCL' : 'HTP0';
    args.push(
      '--device',
      options.offloadDeviceName || fallback,
      '-ngl',
      `${settings.llamaCppGpuLayers}`
    );
  }

  return args;
}
