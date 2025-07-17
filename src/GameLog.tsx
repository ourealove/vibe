import React from 'react';

type GameLogProps = {
  log: string[];
  turn: number;
};

function GameLog({ log, turn }: GameLogProps) {
  return (
    <div className="bg-gray-700 rounded-lg shadow p-3 min-h-[60px] flex flex-col gap-1">
      <div className="text-xs text-gray-300 mb-1">Turn <span className="font-bold text-white">{turn}</span></div>
      {log.slice(0, 3).map((msg, i) => (
        <div key={i} className="text-sm text-gray-100">{msg}</div>
      ))}
    </div>
  );
}

export default GameLog;
