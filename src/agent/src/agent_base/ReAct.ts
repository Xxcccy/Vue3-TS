import { LLMClient } from './LLM_Client'
import { ToolExecutor, search } from './tools'

/**
 * ReAct 提示词模板
 */
const REACT_PROMPT_TEMPLATE = `
请注意，你是一个有能力调用外部工具的智能助手。

可用工具如下：
{tools}

请严格按照以下格式进行回应：

Thought: 你的思考过程，用于分析问题、拆解任务和规划下一步行动。
Action: 你决定采取的行动，必须是以下格式之一：
- \`{{tool_name}}[{{tool_input}}]\`：调用一个可用工具。
- \`Finish[最终答案]\`：当你认为已经获得最终答案时。
- 当你收集到足够的信息，能够回答用户的最终问题时，你必须在\`Action:\`字段后使用 \`Finish[最终答案]\` 来输出最终答案。


现在，请开始解决以下问题：
Question: {question}
History: {history}
`

class ReActAgent {
  private history: string[] = []

  constructor(
    private llmClient: LLMClient,
    private toolExecutor: ToolExecutor,
    private maxSteps: number = 5,
  ) {}

  /**
   * 主运行逻辑
   */
  public async run(question: string): Promise<string | null> {
    this.history = []
    let currentStep = 0

    while (currentStep < this.maxSteps) {
      currentStep++
      console.log(`\n--- 第 ${currentStep} 步 ---`)

      // 1. 准备上下文
      const toolsDesc = this.toolExecutor.getAvailableTools()
      const historyStr = this.history.join('\n')
      const prompt = REACT_PROMPT_TEMPLATE.replace('{tools}', toolsDesc)
        .replace('{question}', question)
        .replace('{history}', historyStr)

      // 2. 这里的 think 必须是异步调用
      const responseText = await this.llmClient.invoke([
        { role: 'user', content: prompt },
      ])

      if (!responseText) {
        console.error('错误：LLM 未能返回有效响应。')
        break
      }

      // 3. 解析思考与行动
      const { thought, action } = this.parseOutput(responseText)

      if (thought) console.log(`\n🤔 思考: ${thought}`)
      if (!action) {
        console.warn('警告：未能解析出有效的 Action，流程终止。')
        break
      }

      // 4. 判断是否结束
      if (action.startsWith('Finish')) {
        const finalAnswer = this.parseActionInput(action)
        console.log(`🎉 最终答案: ${finalAnswer}`)
        return finalAnswer
      }

      // 5. 执行工具调用
      const [toolName, toolInput] = this.parseAction(action)

      if (!toolName || toolInput === null) {
        this.history.push(
          'Observation: 无效的 Action 格式，请确保使用 ToolName[Input] 格式。',
        )
        continue
      }

      console.log(`🎬 行动: ${toolName}[${toolInput}]`)

      const toolFunction = this.toolExecutor.getTool(toolName)
      let observation: string

      try {
        if (toolFunction) {
          // 在 TS 中，外部工具通常也是异步的 (Promise)
          observation = await toolFunction(toolInput)
        } else {
          observation = `错误：未找到名为 '${toolName}' 的工具。`
        }
      } catch (err: any) {
        observation = `工具执行异常: ${err.message}`
      }

      console.log(`👀 观察: ${observation}`)

      // 6. 更新历史记录
      this.history.push(`Action: ${action}`)
      this.history.push(`Observation: ${observation}`)
    }

    currentStep === this.maxSteps && console.log('已达到最大步数，流程终止。')
    return null
  }

  /**
   * 解析 LLM 输出的 Thought 和 Action
   */
  private parseOutput(text: string): {
    thought: string | null
    action: string | null
  } {
    // 使用 s 标志 (dotAll) 让 . 匹配换行符
    const thoughtMatch = text.match(/Thought:\s*([\s\S]*?)(?=\nAction:|$)/i)
    const actionMatch = text.match(/Action:\s*([\s\S]*?)$/i)

    return {
      thought: thoughtMatch ? thoughtMatch[1].trim() : null,
      action: actionMatch ? actionMatch[1].trim() : null,
    }
  }

  /**
   * 解析 Action 详情：Tool[Input]
   */
  private parseAction(actionText: string): [string | null, string | null] {
    const match = actionText.match(/^(\w+)\[([\s\S]*)\]$/)
    return match ? [match[1], match[2]] : [null, null]
  }

  /**
   * 专门解析 Finish[...] 中的内容
   */
  private parseActionInput(actionText: string): string {
    const match = actionText.match(/\w+\[([\s\S]*)\]/)
    return match ? match[1].trim() : ''
  }
}

function main() {
  const llm = new LLMClient()
  const tool_executor = new ToolExecutor()
  const search_desc =
    '一个网页搜索引擎。当你需要回答关于时事、事实以及在你的知识库中找不到的信息时，应使用此工具。'
  tool_executor.registerTool('Search', search_desc, search)
  const agent = new ReActAgent(llm, tool_executor)
  const question = '英伟达最新显卡是什么型号？它的主要卖点是什么？'
  agent.run(question)
}

main()
