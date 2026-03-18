import React from 'react'
import { useGameStore } from '../store/gameStore'

const GameInfo = () => {
  const { 
    currentPlayer, 
    gameMode, 
    aiDifficulty,
    winner,
    isAIThinking,
    setGameMode,
    setAIDifficulty,
    undo,
    reset
  } = useGameStore()

  const getPlayerColor = (player) => {
    return player === 'black' ? 'bg-gray-900' : 'bg-white border-2 border-gray-300'
  }

  const getWinnerText = () => {
    if (winner === 'draw') return '平局！'
    if (winner === 'black') return gameMode === 'PvAI' ? '你赢了！🎉' : '黑棋获胜！🎉'
    if (winner === 'white') return gameMode === 'PvAI' ? 'AI 获胜... 🤖' : '白棋获胜！🎉'
    return ''
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg space-y-4">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
        五子棋 Gomoku
      </h1>

      {/* 游戏状态 */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-gray-600">当前回合：</span>
        <div className={`w-6 h-6 rounded-full ${getPlayerColor(currentPlayer)}`} />
        <span className="font-medium">
          {currentPlayer === 'black' ? '黑棋' : '白棋'}
          {gameMode === 'PvAI' && currentPlayer === 'white' && ' (AI)'}
        </span>
        {isAIThinking && (
          <span className="text-blue-500 animate-pulse">思考中...</span>
        )}
      </div>

      {/* 模式选择 */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">游戏模式</label>
        <div className="flex gap-2">
          <button
            onClick={() => setGameMode('PvP')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              gameMode === 'PvP'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            双人对战
          </button>
          <button
            onClick={() => setGameMode('PvAI')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              gameMode === 'PvAI'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            AI 对战
          </button>
        </div>
      </div>

      {/* AI 难度选择 */}
      {gameMode === 'PvAI' && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">AI 难度</label>
          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setAIDifficulty(diff)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                  aiDifficulty === diff
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={undo}
          disabled={!!winner || isAIThinking}
          className="flex-1 py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          悔棋
        </button>
        <button
          onClick={reset}
          className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          重新开始
        </button>
      </div>

      {/* 获胜提示 */}
      {winner && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-center text-white font-bold text-lg animate-bounce">
          {getWinnerText()}
        </div>
      )}
    </div>
  )
}

export default GameInfo
