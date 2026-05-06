# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个用于实验 LLM（大语言模型）集成的 AI 应用项目。使用 TypeScript 和 OpenAI SDK 创建可配置的 LLM 客户端。

## 常用命令

```bash
# 开发模式 - 直接运行 TypeScript
npm run dev

# 构建 - 编译 TypeScript 为 JavaScript
npm run build

# 运行编译后的代码
npm start
```

## 环境配置

创建 `.env` 文件并配置以下变量：
- `LLM_API_KEY` - LLM 服务的 API 密钥
- `LLM_BASE_URL` - LLM API 端点的基础 URL
- `LLM_MODEL_ID` - 模型标识符（默认为 "gpt-4o"）

## 架构说明

### 源码结构
- `src/agent_base/` - 核心 LLM 客户端实现
  - `LLM_Client.ts` - 支持流式输出的主客户端类
- `src/agent_framework/` -（计划中）Agent 框架组件

### LLMClient 类
`src/agent_base/LLM_Client.ts` 中的 `LLMClient` 类提供以下功能：
- 通过构造函数参数或环境变量进行可配置初始化
- 通过 `invoke()` 方法实现流式聊天补全
- 实时块回调，支持渐进式输出
- 内置 API 错误处理

该客户端使用 OpenAI SDK，但通过可配置的 `baseURL` 可以兼容 OpenAI 兼容的 API。

## TypeScript 配置

- 编译目标：ES2020
- 模块系统：ESNext（bundler 解析）
- 输出目录：`dist/`
- 启用严格模式
