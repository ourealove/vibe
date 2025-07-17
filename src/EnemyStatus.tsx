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
      {/* 픽셀 스타일 슬라임 SVG */}
      <div className="mt-2">
        <svg width="64" height="48" viewBox="0 0 32 24" shapeRendering="crispEdges">
          {/* 몸통 */}
          <rect x="4" y="12" width="24" height="8" fill="#6ee7b7" />
          <rect x="6" y="10" width="20" height="2" fill="#34d399" />
          <rect x="8" y="8" width="16" height="2" fill="#059669" />
          {/* 눈 */}
          <rect x="11" y="16" width="2" height="2" fill="#222" />
          <rect x="19" y="16" width="2" height="2" fill="#222" />
          {/* 입 */}
          <rect x="14" y="18" width="4" height="1" fill="#222" />
        </svg>
      </div>
    </div>
  );
}

export default EnemyStatus;
