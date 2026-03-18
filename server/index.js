import express from 'express'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const API_KEY = process.env.MINIMAX_API_KEY
const BASE_URL = 'https://api.minimax.chat/v1'

// 棋盘转文本
const formatBoard = (board) => {
  return board.map(row => row.map(cell => {
    if (cell === null) return '.'
    if (cell === 'black') return 'X'
    return 'O'
  }).join('')).join('\n')
}

// AI 落子接口
app.post('/api/ai-move', async (req, res) => {
  const { board } = req.body
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'API Key 未配置' })
  }

  const boardText = formatBoard(board)
  
  const systemPrompt = `你是一个五子棋AI。15x15棋盘，X=黑棋，O=白棋，.=空位。轮到白棋(O)落子。

返回格式：{"row":数字,"col":数字}
例如：{"row":7,"col":7}
只返回JSON，不要其他内容。`

  const userPrompt = `棋盘状态：
${boardText}
白棋应该下在哪？`

  try {
    const response = await axios.post(
      `${BASE_URL}/text/chatcompletion_v2`,
      {
        model: 'MiniMax-M2.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 256
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    let content = response.data.choices?.[0]?.message?.content || ''
    // 清理 markdown
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    // 解析 JSON
    let match = content.match(/\{(\d+),(\d+)\}/)
    if (match) {
      return res.json({ row: parseInt(match[1]), col: parseInt(match[2]) })
    }

    match = content.match(/"row":\s*(\d+),\s*"col":\s*(\d+)/)
    if (match) {
      return res.json({ row: parseInt(match[1]), col: parseInt(match[2]) })
    }

    res.status(400).json({ error: '无法解析响应', content })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 AI 服务运行在 http://localhost:${PORT}`)
})
