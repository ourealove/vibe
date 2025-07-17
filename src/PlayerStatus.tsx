import React from 'react';

type PlayerStatusProps = {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
};

function PlayerStatus({ hp, maxHp, block, energy }: PlayerStatusProps) {
  const percent = Math.max(0, (hp / maxHp) * 100);
  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
      <div className="text-lg font-bold text-green-400 mb-1">PLAYER</div>
      <div className="w-full bg-green-900 rounded h-5 relative overflow-hidden mb-1">
        <div
          className="bg-gradient-to-r from-green-400 to-green-600 h-5 rounded transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
          {hp} / {maxHp}
        </span>
      </div>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold">🛡️ Block:</span>
          <span className="text-blue-300 font-bold text-lg">{block}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold">⚡ Energy:</span>
          <span className="text-yellow-300 font-bold text-lg">{energy}</span>
        </div>
      </div>
    </div>
  );
}

export default PlayerStatus;
