import axios from 'axios'

// 生产环境用相对路径（通过 nginx 代理），开发环境用配置的 URL
const API_BASE_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:3001') : '/api'

// 棋盘转文本描述 (简化版)
const formatBoard = (board) => {
  return board.map(row => row.map(cell => {
    if (cell === null) return '.'
    if (cell === 'black') return 'X'
    return 'O'
  }).join('')).join('\n')
}

// 调用服务端 AI 接口
export const getAIMoveFromMiniMax = async (board) => {
  console.log('🤖 调用服务端 AI...')
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/ai-move`,
      { board },
      { timeout: 15000 }
    )
    
    console.log('✅ AI 返回:', response.data)
    
    if (response.data.row !== undefined && response.data.col !== undefined) {
      const row = parseInt(response.data.row)
      const col = parseInt(response.data.col)
      if (row >= 0 && row < 15 && col >= 0 && col < 15) {
        return [row, col]
      }
    }
    
    console.error('❌ AI 返回格式错误:', response.data)
    return null
    
  } catch (error) {
    console.error('❌ 服务端 API 错误:', error.response?.data || error.message)
    return null
  }
}
