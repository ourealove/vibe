import React from 'react';
import { GameProvider } from './context2/GameContext.tsx';
import GameBoard from './GameBoard.tsx';

function App() {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
}

export default App;
