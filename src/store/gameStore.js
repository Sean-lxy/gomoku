import { create } from 'zustand'

// 初始化空棋盘
const createEmptyBoard = () => {
  return Array(15).fill(null).map(() => Array(15).fill(null))
}

// 检查是否有五子连珠
const checkWinner = (board, row, col, player) => {
  const directions = [
    [0, 1],   // 水平
    [1, 0],   // 垂直
    [1, 1],   // 对角线 \
    [1, -1],  // 反对角线 /
  ]

  for (const [dr, dc] of directions) {
    let count = 1

    // 正方向
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i
      const c = col + dc * i
      if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === player) {
        count++
      } else {
        break
      }
    }

    // 负方向
    for (let i = 1; i < 5; i++) {
      const r = row - dr * i
      const c = col - dc * i
      if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === player) {
        count++
      } else {
        break
      }
    }

    if (count >= 5) return true
  }

  return false
}

// 检查是否平局
const checkDraw = (board) => {
  return board.every(row => row.every(cell => cell !== null))
}

export const useGameStore = create((set, get) => ({
  // 棋盘状态
  board: createEmptyBoard(),
  
  // 当前玩家 (黑棋先行)
  currentPlayer: 'black',
  
  // 游戏模式: 'PvP' 双人, 'PvAI' 人机
  gameMode: 'PvAI',
  
  // AI 难度: 'easy', 'medium', 'hard'
  aiDifficulty: 'medium',
  
  // 获胜者
  winner: null,
  
  // 落子历史 (用于悔棋)
  history: [],
  
  // 最后一手
  lastMove: null,
  
  // AI 思考中
  isAIThinking: false,

  // 设置游戏模式
  setGameMode: (mode) => set({ gameMode: mode, winner: null }),

  // 设置 AI 难度
  setAIDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),

  // 落子
  placePiece: (row, col) => {
    const { board, currentPlayer, winner, isAIThinking, gameMode } = get()
    
    // 游戏结束或有AI在思考时不能落子
    if (winner || isAIThinking) return false
    if (board[row][col] !== null) return false

    // 人机模式下，玩家只能执黑棋
    if (gameMode === 'PvAI' && currentPlayer !== 'black') return false

    // 创建新棋盘
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = currentPlayer

    // 检查获胜
    const newWinner = checkWinner(newBoard, row, col, currentPlayer) ? currentPlayer : null
    const isDraw = !newWinner && checkDraw(newBoard)

    set({
      board: newBoard,
      currentPlayer: newWinner ? currentPlayer : (currentPlayer === 'black' ? 'white' : 'black'),
      winner: newWinner || (isDraw ? 'draw' : null),
      history: [...get().history, { row, col, player: currentPlayer }],
      lastMove: { row, col }
    })

    return true
  },

  // 悔棋
  undo: () => {
    const { history, winner, isAIThinking } = get()
    if (history.length === 0 || winner || isAIThinking) return

    const newHistory = [...history]
    const lastMove = newHistory.pop()
    
    // 如果是悔棋玩家的上一步，需要连退两步（人机模式）
    if (get().gameMode === 'PvAI' && newHistory.length > 0) {
      newHistory.pop()
    }

    // 重建棋盘
    const newBoard = createEmptyBoard()
    newHistory.forEach(move => {
      newBoard[move.row][move.col] = move.player
    })

    const newLastMove = newHistory.length > 0 
      ? newHistory[newHistory.length - 1] 
      : null

    set({
      board: newBoard,
      currentPlayer: newHistory.length === 0 ? 'black' : 
        (newHistory[newHistory.length - 1].player === 'black' ? 'white' : 'black'),
      winner: null,
      history: newHistory,
      lastMove: newLastMove
    })
  },

  // 重新开始
  reset: () => set({
    board: createEmptyBoard(),
    currentPlayer: 'black',
    winner: null,
    history: [],
    lastMove: null,
    isAIThinking: false
  }),

  // 设置 AI 思考状态
  setAIThinking: (thinking) => set({ isAIThinking: thinking })
}))
