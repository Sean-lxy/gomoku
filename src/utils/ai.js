// 五子棋 AI 算法

// 棋型评估分数
const SCORES = {
  // 活四 (oooo) - 立即获胜
  OPEN_FOUR: 100000,
  // 冲四 (oooo|) - 威胁获胜
  FOUR: 10000,
  // 活三 (ooo) - 强威胁
  OPEN_THREE: 1000,
  // 眠三 (oo-|) - 中等威胁
  THREE: 100,
  // 活二 (oo) - 潜力
  OPEN_TWO: 100,
  // 眠二 (o-|) - 小潜力
  TWO: 10,
  // 活一 (o)
  ONE: 1
}

// 评估单个方向
const evaluateDirection = (board, row, col, dr, dc, player) => {
  let count = 0
  let openEnds = 0
  let blocked = 0

  // 正方向计数
  for (let i = 1; i < 5; i++) {
    const r = row + dr * i
    const c = col + dc * i
    if (r < 0 || r >= 15 || c < 0 || c >= 15) {
      blocked++
      break
    }
    if (board[r][c] === player) {
      count++
    } else if (board[r][c] === null) {
      openEnds++
      break
    } else {
      blocked++
      break
    }
  }

  // 负方向计数
  for (let i = 1; i < 5; i++) {
    const r = row - dr * i
    const c = col - dc * i
    if (r < 0 || r >= 15 || c < 0 || c >= 15) {
      blocked++
      break
    }
    if (board[r][c] === player) {
      count++
    } else if (board[r][c] === null) {
      openEnds++
      break
    } else {
      blocked++
      break
    }
  }

  // 根据连子数和开放端数给分
  if (count >= 4) return SCORES.OPEN_FOUR
  if (count === 3) {
    if (openEnds === 2) return SCORES.OPEN_THREE
    if (openEnds === 1) return SCORES.FOUR
  }
  if (count === 2) {
    if (openEnds === 2) return SCORES.OPEN_TWO
    if (openEnds === 1) return SCORES.THREE
  }
  if (count === 1) {
    if (openEnds >= 1) return SCORES.TWO
    return SCORES.ONE
  }

  return 0
}

// 评估空位分数
const evaluatePosition = (board, row, col, player) => {
  if (row < 0 || row >= 15 || col < 0 || col >= 15 || board[row][col] !== null) {
    return -Infinity
  }

  const opponent = player === 'black' ? 'white' : 'black'
  let score = 0

  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]

  for (const [dr, dc] of directions) {
    score += evaluateDirection(board, row, col, dr, dc, player)
    score += evaluateDirection(board, row, col, dr, dc, opponent) * 0.9
  }

  return score
}

// 获取所有可落子的位置（效率优化：只考虑已有棋子周围）
const getCandidatePositions = (board) => {
  const candidates = new Set()
  const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] !== null) {
        for (const [dr, dc] of directions) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && board[nr][nc] === null) {
            candidates.add(`${nr},${nc}`)
          }
        }
      }
    }
  }

  // 如果棋盘为空，返回中心点
  if (candidates.size === 0) {
    return [[7, 7]]
  }

  // 转换为数组
  return Array.from(candidates).map(s => {
    const [r, c] = s.split(',').map(Number)
    return [r, c]
  })
}

// 检查获胜
const checkWin = (board, player) => {
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] !== player) continue

      // 水平
      if (c + 4 < 15 && board[r][c + 1] === player && board[r][c + 2] === player &&
          board[r][c + 3] === player && board[r][c + 4] === player) return true
      // 垂直
      if (r + 4 < 15 && board[r + 1][c] === player && board[r + 2][c] === player &&
          board[r + 3][c] === player && board[r + 4][c] === player) return true
      // 对角线 \
      if (r + 4 < 15 && c + 4 < 15 && board[r + 1][c + 1] === player && board[r + 2][c + 2] === player &&
          board[r + 3][c + 3] === player && board[r + 4][c + 4] === player) return true
      // 反对角线 /
      if (r + 4 < 15 && c - 4 >= 0 && board[r + 1][c - 1] === player && board[r + 2][c - 2] === player &&
          board[r + 3][c - 3] === player && board[r + 4][c - 4] === player) return true
    }
  }
  return false
}

// 评估整个棋盘
const evaluateBoard = (board, player) => {
  const opponent = player === 'black' ? 'white' : 'black'
  let score = 0

  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] === null) continue

      for (const [dr, dc] of directions) {
        let lineLength = 1
        
        // 正方向
        for (let i = 1; i < 5; i++) {
          const nr = r + dr * i
          const nc = c + dc * i
          if (nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && board[nr][nc] === board[r][c]) {
            lineLength++
          } else {
            break
          }
        }

        if (lineLength >= 5) {
          score += board[r][c] === player ? SCORES.OPEN_FOUR : -SCORES.OPEN_FOUR
        }
      }
    }
  }

  return score
}

// AI 落子
export const getAIMove = (board, difficulty) => {
  const player = 'white'
  const candidates = getCandidatePositions(board)

  if (candidates.length === 0) return [7, 7]

  switch (difficulty) {
    case 'easy':
      return easyAI(candidates)
    case 'medium':
      return mediumAI(board, candidates, player)
    case 'hard':
      return hardAI(board, candidates, player)
    default:
      return mediumAI(board, candidates, player)
  }
}

// 简单 AI：随机落子
const easyAI = (candidates) => {
  const idx = Math.floor(Math.random() * candidates.length)
  return candidates[idx]
}

// 中等 AI：贪心算法，选择分数最高的位置
const mediumAI = (board, candidates, player) => {
  let bestScore = -Infinity
  let bestMove = candidates[0]

  for (const [row, col] of candidates) {
    const score = evaluatePosition(board, row, col, player)
    if (score > bestScore) {
      bestScore = score
      bestMove = [row, col]
    }
  }

  return bestMove
}

// 困难 AI：Minimax + Alpha-Beta 剪枝
const hardAI = (board, candidates, player) => {
  let bestScore = -Infinity
  let bestMove = candidates[0]

  // 排序候选位置，优先检查高分位置（提高剪枝效率）
  const sortedCandidates = candidates
    .map(([row, col]) => ({
      pos: [row, col],
      score: evaluatePosition(board, row, col, player)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // 只考虑前10个高分位置

  for (const { pos: [row, col] } of sortedCandidates) {
    // 尝试落子
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = player

    const score = minimax(newBoard, 2, -Infinity, Infinity, false, player)
    
    if (score > bestScore) {
      bestScore = score
      bestMove = [row, col]
    }
  }

  return bestMove
}

// Minimax 算法
const minimax = (board, depth, alpha, beta, isMaximizing, player) => {
  const opponent = player === 'black' ? 'white' : 'black'

  // 检查获胜
  if (checkWin(board, player)) return 100000 + depth
  if (checkWin(board, opponent)) return -100000 - depth
  if (depth === 0) {
    return evaluateBoard(board, player)
  }

  const candidates = getCandidatePositions(board).slice(0, 8)

  if (isMaximizing) {
    let maxScore = -Infinity
    for (const [row, col] of candidates) {
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = player
      const score = minimax(newBoard, depth - 1, alpha, beta, false, player)
      maxScore = Math.max(score, maxScore)
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }
    return maxScore
  } else {
    let minScore = Infinity
    for (const [row, col] of candidates) {
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = opponent
      const score = minimax(newBoard, depth - 1, alpha, beta, true, player)
      minScore = Math.min(score, minScore)
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return minScore
  }
}
