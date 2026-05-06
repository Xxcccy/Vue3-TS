/**
 * 智能搜索助手 - 基于 LangGraph + Tavily API 的真实搜索系统
 * 1. 理解用户需求
 * 2. 使用Tavily API真实搜索信息
 * 3. 生成基于搜索结果的回答
 */

import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages'
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
} from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import 'dotenv/config'
import * as readline from 'readline'
import { tavily } from '@tavily/core'

// 环境变量配置
const LLM_MODEL_ID = process.env.LLM_MODEL_ID || 'gpt-4o-mini'
const LLM_API_KEY = process.env.LLM_API_KEY
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1'
const TAVILY_API_KEY = process.env.TAVILY_API_KEY

// 定义状态结构
interface SearchStateValues {
  messages: BaseMessage[]
  user_query: string
  search_query: string
  search_results: string
  final_answer: string
  step: string
}

// 使用 Annotation.Root 定义状态
const SearchState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (existing, update) => [...existing, ...update],
    default: () => [],
  }),
  user_query: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
  search_query: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
  search_results: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
  final_answer: Annotation<string>({
    reducer: (_, update) => update,
    default: () => '',
  }),
  step: Annotation<string>({
    reducer: (_, update) => update,
    default: () => 'start',
  }),
})

// 初始化LLM模型
const llm = new ChatOpenAI({
  model: LLM_MODEL_ID,
  apiKey: LLM_API_KEY,
  configuration: {
    baseURL: LLM_BASE_URL,
  },
  temperature: 0.7,
})

const tavily_client = tavily({ apiKey: TAVILY_API_KEY })

// Tavily搜索函数
async function tavilySearch(query: string) {
  return await tavily_client.search(query, {
    searchDepth: 'basic',
    includeAnswer: true,
    includeRawContent: false,
    maxResults: 5,
  })
}

// 步骤1：理解用户查询并生成搜索关键词（流式输出）
async function understandQueryNode(
  state: typeof SearchState.State,
): Promise<Partial<SearchStateValues>> {
  // 获取最新的用户消息
  let userMessage = ''
  for (let i = state.messages.length - 1; i >= 0; i--) {
    const msg = state.messages[i]
    if (msg instanceof HumanMessage) {
      userMessage = msg.content as string
      break
    }
  }

  const understandPrompt = `分析用户的查询："${userMessage}"

请完成两个任务：
1. 简洁总结用户想要了解什么
2. 生成最适合搜索的关键词（中英文均可，要精准）

格式：
理解：[用户需求总结]
搜索词：[最佳搜索关键词]`

  // 流式输出
  process.stdout.write('🧠 正在理解您的需求: ')
  let responseText = ''

  const stream = await llm.stream([new SystemMessage(understandPrompt)])
  for await (const chunk of stream) {
    const content = chunk.content as string
    responseText += content
    process.stdout.write(content)
  }
  process.stdout.write('\n')

  // 提取搜索关键词
  let searchQuery = userMessage // 默认使用原始查询

  if (responseText.includes('搜索词：')) {
    searchQuery = responseText.split('搜索词：')[1].trim().split('\n')[0]
  } else if (responseText.includes('搜索关键词：')) {
    searchQuery = responseText.split('搜索关键词：')[1].trim().split('\n')[0]
  }

  return {
    user_query: responseText,
    search_query: searchQuery,
    step: 'understood',
    messages: [new AIMessage(`我理解您的需求：${responseText}`)],
  }
}

// 步骤2：使用Tavily API进行真实搜索
async function tavilySearchNode(
  state: typeof SearchState.State,
): Promise<Partial<SearchStateValues>> {
  const searchQuery = state.search_query

  try {
    console.log(`🔍 正在搜索: ${searchQuery}`)

    // 调用Tavily搜索API
    const response = await tavilySearch(searchQuery)

    // 处理搜索结果
    let searchResults = ''

    // 优先使用Tavily的综合答案
    if (response.answer) {
      searchResults = `综合答案：\n${response.answer}\n\n`
    }

    // 添加具体的搜索结果
    if (response.results && response.results.length > 0) {
      searchResults += '相关信息：\n'
      response.results.slice(0, 3).forEach((result, i) => {
        searchResults += `${i + 1}. ${result.title}\n${result.content}\n来源：${result.url}\n\n`
      })
    }

    if (!searchResults) {
      searchResults = '抱歉，没有找到相关信息。'
    }

    return {
      search_results: searchResults,
      step: 'searched',
      messages: [
        new AIMessage('✅ 搜索完成！找到了相关信息，正在为您整理答案...'),
      ],
    }
  } catch (error) {
    const errorMsg = `搜索时发生错误: ${(error as Error).message}`
    console.log(`❌ ${errorMsg}`)

    return {
      search_results: `搜索失败：${errorMsg}`,
      step: 'search_failed',
      messages: [new AIMessage('❌ 搜索遇到问题，我将基于已有知识为您回答')],
    }
  }
}

// 步骤3：基于搜索结果生成最终答案（流式输出）
async function generateAnswerNode(
  state: typeof SearchState.State,
): Promise<Partial<SearchStateValues>> {
  let promptText: string

  // 检查是否有搜索结果
  if (state.step === 'search_failed') {
    // 如果搜索失败，基于LLM知识回答
    promptText = `搜索API暂时不可用，请基于您的知识回答用户的问题：

用户问题：${state.user_query}

请提供一个有用的回答，并说明这是基于已有知识的回答。`
  } else {
    // 基于搜索结果生成答案
    promptText = `基于以下搜索结果为用户提供完整、准确的答案：

用户问题：${state.user_query}

搜索结果：
${state.search_results}

请要求：
1. 综合搜索结果，提供准确、有用的回答
2. 如果是技术问题，提供具体的解决方案或代码
3. 引用重要信息的来源
4. 回答要结构清晰、易于理解
5. 如果搜索结果不够完整，请说明并提供补充建议`
  }

  // 流式输出最终答案
  process.stdout.write('\n💡 最终回答:\n')
  let finalAnswer = ''

  const stream = await llm.stream([new SystemMessage(promptText)])
  for await (const chunk of stream) {
    const content = chunk.content as string
    finalAnswer += content
    process.stdout.write(content)
  }
  process.stdout.write('\n')

  return {
    final_answer: finalAnswer,
    step: 'completed',
    messages: [new AIMessage(finalAnswer)],
  }
}

// 创建搜索助手工作流
function createSearchAssistant() {
  const workflow = new StateGraph(SearchState)
    // 添加三个节点
    .addNode('understand', understandQueryNode)
    .addNode('search', tavilySearchNode)
    .addNode('answer', generateAnswerNode)
    // 设置线性流程
    .addEdge(START, 'understand')
    .addEdge('understand', 'search')
    .addEdge('search', 'answer')
    .addEdge('answer', END)

  // 编译图
  const memory = new MemorySaver()
  return workflow.compile({ checkpointer: memory })
}

// 主函数
async function main() {
  // 检查API密钥
  if (!TAVILY_API_KEY) {
    console.log('❌ 错误：请在环境变量中配置TAVILY_API_KEY')
    return
  }

  if (!LLM_API_KEY) {
    console.log('❌ 错误：请在环境变量中配置LLM_API_KEY')
    return
  }

  const app = createSearchAssistant()

  console.log('🔍 智能搜索助手启动！')
  console.log('我会使用Tavily API为您搜索最新、最准确的信息')
  console.log('支持各种问题：新闻、技术、知识问答等')
  console.log("(输入 'quit' 退出)\n")

  let sessionCount = 0

  // 创建命令行交互接口
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const prompt = (query: string): Promise<string> => {
    return new Promise(resolve => {
      rl.question(query, resolve)
    })
  }

  while (true) {
    const userInput = await prompt('🤔 您想了解什么: ')

    const trimmedInput = userInput.trim()

    if (['quit', 'q', '退出', 'exit'].includes(trimmedInput.toLowerCase())) {
      console.log('感谢使用！再见！👋')
      rl.close()
      break
    }

    if (!trimmedInput) {
      continue
    }

    sessionCount++
    const config = {
      configurable: { thread_id: `search-session-${sessionCount}` },
    }

    // 初始状态
    const initialState: SearchStateValues = {
      messages: [new HumanMessage(trimmedInput)],
      user_query: '',
      search_query: '',
      search_results: '',
      final_answer: '',
      step: 'start',
    }

    try {
      console.log('\n' + '='.repeat(60))

      // 执行工作流（流式输出已在各节点中完成）
      const stream = await app.stream(initialState, config)

      for await (const output of stream) {
        for (const [nodeName] of Object.entries(output)) {
          // 搜索阶段输出
          if (nodeName === 'search') {
            console.log('✅ 搜索完成！正在为您整理答案...')
          }
        }
      }

      console.log('\n' + '='.repeat(60) + '\n')
    } catch (error) {
      console.log(`❌ 发生错误: ${(error as Error).message}`)
      console.log('请重新输入您的问题。\n')
    }
  }
}

main().catch(console.error)
