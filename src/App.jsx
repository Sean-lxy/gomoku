import React from 'react'
import Board from './components/Board'
import GameInfo from './components/GameInfo'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* 棋盘区域 */}
        <div className="flex-shrink-0">
          <Board />
        </div>

        {/* 信息面板 */}
        <div className="w-full md:w-72">
          <GameInfo />
        </div>
      </div>
    </div>
  )
}

export default App
