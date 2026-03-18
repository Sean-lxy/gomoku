import axios from 'axios'

// MiniMax API 配置
const API_KEY = import.meta.env.VITE_MINIMAX_API_KEY
const BASE_URL = 'https://api.minimax.chat/v1'

// 棋盘转文本描述
const formatBoard = (board) => {
  const symbols = { null: '·', black: '●', white: '○' }
  return board.map((row, i) => 
    `${i} ${row.map(cell => symbols[cell]).join(' ')}`
  ).join('\n')
}

// 调用 MiniMax AI 获取落子
export const getAIMoveFromMiniMax = async (board) => {
  console.log('🤖 调用 MiniMax AI...')
  
  if (!API_KEY) {
    console.error('❌ 请配置 VITE_MINIMAX_API_KEY 环境变量')
    return null
  }

  const boardText = formatBoard(board)
  
  const systemPrompt = `你是一个五子棋高手。请根据当前棋盘给出白棋的下一步落子位置。

规则：
- 15x15 棋盘，行列从0到14
- 黑棋已下，现在轮到白棋
- 需要阻止黑棋连成五子，同时尝试让白棋连成五子
- 返回格式必须是JSON：{"row": 数字, "col": 数字}
- 只返回JSON，不要其他内容`

  const userPrompt = `当前棋盘状态：
${boardText}

请给出白棋的下一步坐标（row和col）。`

  try {
    console.log('📤 发送请求到 MiniMax...')
    
    const response = await axios.post(
      `${BASE_URL}/text/chatcompletion_v2`,
      {
        model: 'MiniMax-M2.5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    console.log('📥 响应:', response.data)
    
    // 处理不同的响应格式
    let content = ''
    if (response.data.choices?.[0]?.message?.content) {
      content = response.data.choices[0].message.content
    } else if (response.data.choices?.[0]?.message?.assistant_output?.text) {
      content = response.data.choices[0].message.assistant_output.text
    } else if (response.data.choices?.[0]?.delta?.content) {
      content = response.data.choices[0].delta.content
    }
    
    console.log('📝 AI 内容:', content)
    
    // 解析 JSON 响应 - 尝试多种格式
    try {
      // 尝试直接解析整个 content
      const result = JSON.parse(content)
      console.log('✅ 解析结果:', result)
      
      if (result.row !== undefined && result.col !== undefined) {
        const row = parseInt(result.row)
        const col = parseInt(result.col)
        if (row >= 0 && row < 15 && col >= 0 && col < 15) {
          console.log('✅ 返回坐标:', [row, col])
          return [row, col]
        }
      }
    } catch (e) {
      // 如果直接解析失败，尝试用正则提取
      console.log('🔄 尝试正则提取...')
      const match = content.match(/\{[^}]+\}/)
      if (match) {
        try {
          const result = JSON.parse(match[0].replace(/\s+/g, ' ').trim())
          console.log('✅ 正则解析结果:', result)
          
          const row = parseInt(result.row)
          const col = parseInt(result.col)
          if (row >= 0 && row < 15 && col >= 0 && col < 15) {
            console.log('✅ 返回坐标:', [row, col])
            return [row, col]
          }
        } catch (e2) {
          console.error('❌ 正则解析失败:', e2)
        }
      }
    }
    
    console.error('❌ AI 返回格式错误:', content)
    return null
    
  } catch (error) {
    console.error('❌ MiniMax API 错误:', error.response?.data || error.message)
    return null
  }
}
