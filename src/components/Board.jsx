import React, { useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { getAIMove } from '../utils/ai'
import { getAIMoveFromMiniMax } from '../utils/minimaxAi'

const Board = () => {
  const canvasRef = useRef(null)
  const { 
    board, 
    currentPlayer, 
    gameMode, 
    aiDifficulty, 
    winner,
    lastMove,
    placePiece
  } = useGameStore()

  // 触发 AI 落子 (当轮到白棋且游戏未结束时)
  useEffect(() => {
    // 跳过初始渲染，只在玩家落子后触发
    if (gameMode !== 'PvAI' || currentPlayer !== 'white' || winner) return
    
    console.log('🎯 AI 触发!')
    
    const timer = setTimeout(async () => {
      const state = useGameStore.getState()
      console.log('🎯 AI 开始计算')
      let aiMove
      
      if (aiDifficulty === 'minimax') {
        // MiniMax AI
        console.log('🎯 使用 MiniMax AI')
        aiMove = await getAIMoveFromMiniMax(state.board)
        console.log('🎯 MiniMax 返回:', aiMove)
        // 如果 API 调用失败，使用本地 AI 作为后备
        if (!aiMove) {
          console.log('🎯 回退到本地 AI')
          aiMove = getAIMove(state.board, 'hard')
        }
      } else {
        // 本地 AI
        aiMove = getAIMove(state.board, aiDifficulty)
      }
      
      console.log('🎯 AI 落子:', aiMove)
      if (aiMove) {
        console.log('🎯 调用 placePiece:', aiMove[0], aiMove[1])
        placePiece(aiMove[0], aiMove[1])
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [currentPlayer, gameMode, winner, aiDifficulty])

  const CELL_SIZE = 35
  const PADDING = 30
  const BOARD_SIZE = 15 * CELL_SIZE

  // 绘制棋盘
  const drawBoard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // 清空画布
    ctx.fillStyle = '#DEB887'
    ctx.fillRect(0, 0, BOARD_SIZE + PADDING * 2, BOARD_SIZE + PADDING * 2)

    // 画网格线
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 1

    for (let i = 0; i < 15; i++) {
      // 横线
      ctx.beginPath()
      ctx.moveTo(PADDING, PADDING + i * CELL_SIZE)
      ctx.lineTo(PADDING + BOARD_SIZE, PADDING + i * CELL_SIZE)
      ctx.stroke()

      // 竖线
      ctx.beginPath()
      ctx.moveTo(PADDING + i * CELL_SIZE, PADDING)
      ctx.lineTo(PADDING + i * CELL_SIZE, PADDING + BOARD_SIZE)
      ctx.stroke()
    }

    // 画星位 (天元和四角星)
    const starPoints = [
      [3, 3], [3, 11], [11, 3], [11, 11], [7, 7]
    ]
    ctx.fillStyle = '#8B4513'
    for (const [r, c] of starPoints) {
      ctx.beginPath()
      ctx.arc(PADDING + c * CELL_SIZE, PADDING + r * CELL_SIZE, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // 画棋子
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (board[r][c]) {
          drawPiece(ctx, r, c, board[r][c], lastMove?.row === r && lastMove?.col === c)
        }
      }
    }
  }

  // 绘制棋子
  const drawPiece = (ctx, row, col, color, isLast) => {
    const x = PADDING + col * CELL_SIZE
    const y = PADDING + row * CELL_SIZE
    const radius = 14

    // 阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // 棋子主体
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    
    const gradient = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, radius)
    if (color === 'black') {
      gradient.addColorStop(0, '#4a4a4a')
      gradient.addColorStop(1, '#1a1a1a')
    } else {
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(1, '#e0e0e0')
    }
    ctx.fillStyle = gradient
    ctx.fill()

    // 清除阴影
    ctx.shadowColor = 'transparent'

    // 最后落子标记
    if (isLast) {
      ctx.strokeStyle = color === 'black' ? '#ff6b6b' : '#4ecdc4'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, radius - 3, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = BOARD_SIZE + PADDING * 2
    canvas.height = BOARD_SIZE + PADDING * 2
    drawBoard()
  }, [])

  // 每次棋盘更新重绘
  useEffect(() => {
    drawBoard()
  }, [board, lastMove])

  // 处理点击
  const handleClick = (e) => {
    // 游戏结束或不是玩家回合时不能点击
    if (winner || currentPlayer !== 'black') return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - PADDING
    const y = e.clientY - rect.top - PADDING

    // 计算最近的交叉点
    const col = Math.round(x / CELL_SIZE)
    const row = Math.round(y / CELL_SIZE)

    // 检查是否在棋盘范围内
    if (row < 0 || row >= 15 || col < 0 || col >= 15) return

    // 尝试落子
    placePiece(row, col)
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="cursor-pointer rounded-lg shadow-xl"
      style={{ 
        background: '#DEB887',
        touchAction: 'none'
      }}
    />
  )
}

export default Board
