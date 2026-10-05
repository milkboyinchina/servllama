# ServLlama Web

<div align="center">
  <img src="public/assets/app_icon.svg" alt="ServLlama icon" width="112" />
  <h1>ServLlama</h1>
  <p><strong>Self-contained local LLM inference server and chat client</strong></p>
</div>

## Overview

ServLlama is a self-contained local LLM server and chat client, combining model discovery and downloads, switching between the llama.cpp (GGUF) and MNN inference engines, server controls, real-time log viewing, and interactive chat in a unified web application.

## Key Features

- **Dual Inference Engine Management**: llama.cpp (GGUF) and Alibaba MNN runtime options, with CPU, Hexagon NPU (HTP), and OpenCL/Vulkan hardware acceleration profiles.
- **Interactive Chat Interface**: Streaming token generation, collapsible reasoning traces, Markdown formatting, image input for multimodal vision models, message version branches, and session history search.
- **Model Hub Discovery**: Browse curated models and search Hugging Face and ModelScope repositories with automatic quantization and mmproj vision projector identification.
- **Download Manager**: Manage weight downloads with pause/resume, download speed and ETA estimation, mirror source switching, and staging cache cleanup.
- **Server Lifecycle & OpenAI-compatible API**: Configure host interfaces (0.0.0.0 / 127.0.0.1), ports, API keys, context sizes, threads, batch sizes, and live CLI launch arguments.
- **Live Server Logs**: Search and filter by engine channel and level (info, warning, error, debug) with real-time autoscrolling.
- **Multilingual & Theming**: English and Simplified Chinese localization, system/light/dark modes.

## Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build production bundle
npm run build

# Type check and lint
npm run lint
```
