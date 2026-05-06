import OpenAI from 'openai'
import 'dotenv/config'

// 定义构造函数的配置接口
interface LLMConfig {
  apiKey?: string
  baseURL?: string
  model?: string
  systemPrompt?: string
}

export class LLMClient {
  private client: OpenAI
  private model: string
  private systemPrompt: string

  constructor(config: LLMConfig = {}) {
    // 优先使用传入的参数，否则回退到环境变量
    const apiKey = config.apiKey || process.env.LLM_API_KEY
    const baseURL = config.baseURL || process.env.LLM_BASE_URL

    this.model = config.model || process.env.LLM_MODEL_ID || 'gpt-4o'
    this.systemPrompt = config.systemPrompt || ''

    if (!apiKey) {
      throw new Error('模型ID、API密钥和服务地址必须被提供或在.env文件中定义。')
    }

    this.client = new OpenAI({
      apiKey,
      baseURL,
    })
  }

  /**
   * 通用的对话方法
   * @param prompt 用户输入
   * @param onChunk 每一块数据到达时的回调函数
   * @param options 可选的覆盖参数（如 temperature）
   */
  async invoke(
    prompt: Record<string, string>[],
    options: Partial<OpenAI.Chat.ChatCompletionCreateParamsStreaming> = {},
    onChunk: (text: string) => void = text => process.stdout.write(text),
  ): Promise<string> {
    let fullResponse = ''

    console.log(`🧠 正在调用 ${this.model} 模型...`)
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: prompt as any,
        stream: true, // 开启流式模式
        ...options,
      })

      console.log('✅ 大语言模型响应成功:')
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        fullResponse += content

        // 如果提供了回调函数，则实时推送内容
        if (onChunk && content) {
          onChunk(content)
        }
      }

      return fullResponse
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * 内部错误处理逻辑
   */
  private handleError(error: unknown): void {
    if (error instanceof OpenAI.APIError) {
      console.error(
        `[LLM Error] Status: ${error.status} | Message: ${error.message}`,
      )
    } else {
      console.error('[Non-API Error]:', error)
    }
  }
}

// async function main() {
//   const llmClient = new LLMClient()

//   const exampleMessages = [
//     {
//       role: 'system',
//       content: 'You are a helpful assistant that writes TypeScript code.',
//     },
//     { role: 'user', content: '写一个快速排序算法' },
//   ]

//   console.log('--- 调用LLM ---')
//   const responseText = await llmClient.invoke(exampleMessages)
//   if (responseText) {
//     console.log('\n\n--- 完整模型响应 ---')
//     console.log(responseText)
//   }
// }

// main()
