import { getJson } from 'serpapi'
import 'dotenv/config'

const apiKey = process.env.SERPAPI_API_KEY
/**
 * 定义搜索结果的接口结构
 */
interface OrganicResult {
  title?: string
  snippet?: string
  link?: string
}

interface SerpResponse {
  answer_box?: {
    answer?: string
    [key: string]: any
  }
  answer_box_list?: string[]
  knowledge_graph?: {
    description?: string
    [key: string]: any
  }
  organic_results?: OrganicResult[]
}

/**
 * 基于 SerpApi 的网页搜索引擎工具
 * @param query 搜索查询词
 */
export async function search(query: string): Promise<string> {
  console.log(`🔍 正在执行 [SerpApi] 网页搜索: ${query}`)

  try {
    if (!apiKey) {
      return '错误：SERPAPI_API_KEY 未在环境变量中配置。'
    }

    const params = {
      engine: 'google',
      q: query,
      api_key: apiKey,
      gl: 'cn',
      hl: 'zh-cn',
    }

    // 将回调包装成 Promise，正确等待异步结果
    const results: SerpResponse = await new Promise(resolve => {
      getJson(params, (results: SerpResponse) => {
        resolve(results)
      })
    })

    // 智能解析逻辑
    if (results.answer_box_list && results.answer_box_list.length > 0) {
      return results.answer_box_list.join('\n')
    }

    if (results.answer_box?.answer) {
      return results.answer_box.answer
    }

    if (results.knowledge_graph?.description) {
      return results.knowledge_graph.description
    }

    if (results.organic_results && results.organic_results.length > 0) {
      // 返回前三个有机结果的摘要
      const snippets = results.organic_results
        .slice(0, 3)
        .map((res, i) => `[${i + 1}] ${res.title || ''}\n${res.snippet || ''}`)

      return snippets.join('\n\n')
    }

    return '未找到相关搜索结果。'
  } catch (error: any) {
    return `搜索时发生错误: ${error.message}`
  }
}

/**
 * 工具执行器类
 */
export class ToolExecutor {
  private tools: Map<string, { description: string; func: Function }>

  constructor() {
    this.tools = new Map()
  }

  /**
   * 向工具箱中注册一个新工具
   */
  registerTool(name: string, description: string, func: Function): void {
    if (this.tools.has(name)) {
      console.warn(`警告：工具 '${name}' 已存在，将被覆盖。`)
    }

    this.tools.set(name, { description, func })
    console.log(`工具 '${name}' 已注册。`)
  }

  /**
   * 根据名称获取一个工具的执行函数
   */
  getTool(name: string): Function | undefined {
    return this.tools.get(name)?.func
  }

  /**
   * 获取所有可用工具的格式化描述字符串
   */
  getAvailableTools(): string {
    const toolList: string[] = []
    this.tools.forEach((info, name) => {
      toolList.push(`- ${name}: ${info.description}`)
    })
    return toolList.join('\n')
  }
}

/**
 * --- 工具初始化与使用示例 ---
 */
async function main() {
  // 1. 初始化工具执行器
  const toolExecutor = new ToolExecutor()

  // 2. 注册我们的实战搜索工具
  const searchDescription =
    '一个网页搜索引擎。当你需要回答关于时事、事实以及在你的知识库中找不到的信息时，应使用此工具。'

  // 注意：在 TS 中注册函数时，确保作用域正确
  toolExecutor.registerTool('Search', searchDescription, search)

  // 3. 打印可用的工具
  console.log('\n--- 可用的工具 ---')
  console.log(toolExecutor.getAvailableTools())

  // 4. 智能体的 Action 调用
  const toolName = 'Search'
  const toolInput = '英伟达最新的GPU型号是什么'

  console.log(`\n--- 执行 Action: ${toolName}['${toolInput}'] ---`)

  const toolFunction = toolExecutor.getTool(toolName)

  if (toolFunction) {
    try {
      // 5. 因为搜索是网络请求，需要使用 await 等待异步结果
      const observation = await toolFunction(toolInput)
      console.log('--- 观察 (Observation) ---')
      console.log(observation)
    } catch (error) {
      console.error('执行工具时发生错误:', error)
    }
  } else {
    console.log(`错误：未找到名为 '${toolName}' 的工具。`)
  }
}

// 执行入口函数
main()
