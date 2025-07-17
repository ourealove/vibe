import { PlayerState, EnemyState, StatusEffect } from../types/card.ts';

// 데미지 처리 함수
export const dealDamage = (
  target:player' | enemy,
  amount: number,
  player: PlayerState,
  enemy: EnemyState,
  setPlayer: (player: PlayerState) => void,
  setEnemy: (enemy: EnemyState) => void
) => [object Object]  if (target === 'enemy)[object Object]    const newEnemy = { ...enemy };
    newEnemy.hp = Math.max(0, newEnemy.hp - amount);
    setEnemy(newEnemy);
  } else {
    const newPlayer = { ...player };
    newPlayer.hp = Math.max(0, newPlayer.hp - amount);
    setPlayer(newPlayer);
  }
};

// 블록 획득 함수
export const gainBlock = (
  amount: number,
  player: PlayerState,
  setPlayer: (player: PlayerState) => void
) => {
  const newPlayer = { ...player };
  newPlayer.block += amount;
  setPlayer(newPlayer);
};

// 체력 회복 함수
export const healPlayer = (
  amount: number,
  player: PlayerState,
  setPlayer: (player: PlayerState) => void
) => {
  const newPlayer = { ...player };
  newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + amount);
  setPlayer(newPlayer);
};

// 에너지 획득 함수
export const gainEnergy = (
  amount: number,
  player: PlayerState,
  setPlayer: (player: PlayerState) => void
) => {
  const newPlayer = { ...player };
  newPlayer.energy = Math.min(newPlayer.maxEnergy, newPlayer.energy + amount);
  setPlayer(newPlayer);
};

// 상태 효과 적용 함수
export const applyStatus = (
  target:player' | enemy,
  status: StatusEffect,
  player: PlayerState,
  enemy: EnemyState,
  setPlayer: (player: PlayerState) => void,
  setEnemy: (enemy: EnemyState) => void
) => [object Object]  if (target === 'player) {   const newPlayer = { ...player };
    newPlayer.statusEffects.push(status);
    setPlayer(newPlayer);
  } else[object Object]    const newEnemy = { ...enemy };
    newEnemy.statusEffects.push(status);
    setEnemy(newEnemy);
  }
};

// 상태 효과 업데이트 함수 (턴 종료 시 호출)
export const updateStatusEffects = (
  player: PlayerState,
  enemy: EnemyState,
  setPlayer: (player: PlayerState) => void,
  setEnemy: (enemy: EnemyState) => void
) =>[object Object]
  // 플레이어 상태 효과 업데이트
  const newPlayer = { ...player };
  newPlayer.statusEffects = newPlayer.statusEffects
    .map(status => ({ ...status, duration: status.duration -1    .filter(status => status.duration > 0);
  setPlayer(newPlayer);

  // 적 상태 효과 업데이트
  const newEnemy = { ...enemy };
  newEnemy.statusEffects = newEnemy.statusEffects
    .map(status => ({ ...status, duration: status.duration -1    .filter(status => status.duration > 0;
  setEnemy(newEnemy);
};

// 카드 비용 확인 함수
export const canPlayCard = (cost: number, player: PlayerState): boolean => {
  return player.energy >= cost;
};

// 카드 사용 시 에너지 소모 함수
export const spendEnergy = (
  cost: number,
  player: PlayerState,
  setPlayer: (player: PlayerState) => void
) => {
  const newPlayer = { ...player };
  newPlayer.energy -= cost;
  setPlayer(newPlayer);
};
