import React from 'react';

type EnemyStatusProps = {
  hp: number;
  maxHp: number;
};

function EnemyStatus({ hp, maxHp }: EnemyStatusProps) {
  const percent = Math.max(0, (hp / maxHp) * 100);
  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
      <div className="text-lg font-bold text-red-400 mb-1">ENEMY</div>
      <div className="w-full bg-red-900 rounded h-5 relative overflow-hidden">
        <div
          className="bg-gradient-to-r from-red-500 to-red-700 h-5 rounded transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
          {hp} / {maxHp}
        </span>
      </div>
    </div>
  );
}

export default EnemyStatus;
