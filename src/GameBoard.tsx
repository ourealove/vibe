import React, { useState } from 'react';
import EnemyStatus from './EnemyStatus.tsx';
import PlayerStatus from './PlayerStatus.tsx';
import GameLog from './GameLog.tsx';
import Card from './Card.tsx';

// 확장된 카드 타입 정의
const CARD_TYPES = [
  { type: 'attack', name: 'Strike', effect: '6 데미지', icon: '⚔️', color: 'red-500', cost: 1 },
  { type: 'defend', name: 'Defend', effect: '5 블록', icon: '🛡️', color: 'blue-500', cost: 1 },
  { type: 'energy', name: 'Adrenaline', effect: '에너지 +2, 카드 1장 뽑음', icon: '⚡', color: 'yellow-500', cost: 0, exhaust: true },
  { type: 'draw', name: 'Quick Draw', effect: '카드 2장 뽑고 1장 버림', icon: '🎴', color: 'purple-500', cost: 0 },
  { type: 'poison', name: 'Hex Blade', effect: '6 데미지 + 중독 3', icon: '☠️', color: 'green-500', cost: 1 },
  { type: 'debuff', name: 'Weaken', effect: '적 공격력 25% 감소', icon: '📉', color: 'orange-500', cost: 1 },
  { type: 'heal', name: 'Holy Light', effect: '체력 5 회복 + 블록 10', icon: '✨', color: 'pink-500', cost: 2 },
  { type: 'energy_attack', name: 'Whirlwind', effect: '에너지 × 4 데미지', icon: '🌪️', color: 'cyan-500', cost: 0 },
  { type: 'shield', name: 'Shield Wall', effect: '블록 12 + 다음 턴 보호', icon: '🏰', color: 'indigo-500', cost: 2 },
  { type: 'corrupt', name: 'Corrupt', effect: '적 능력 3턴 무효화', icon: '💀', color: 'gray-500', cost: 2 },
  { type: 'poison_dagger', name: 'Poison Dagger', effect: '3 데미지 + 독 4', icon: '🗡️☠️', color: 'lime-500', cost: 1 },
  { type: 'reflect', name: 'Flame Aura', effect: '2턴간 2 데미지 반사', icon: '🔥', color: 'amber-500', cost: 2 },
  { type: 'freeze', name: 'Freeze', effect: '적 1턴 빙결', icon: '❄️', color: 'sky-500', cost: 2 },
  { type: 'trap', name: 'Explosive Trap', effect: '3턴 후 15 데미지', icon: '💣', color: 'rose-500', cost: 1 },
];

type CardType = typeof CARD_TYPES[number]['type'];

type CardData = {
  id: number;
  type: CardType;
  name: string;
  effect: string;
  icon: string;
  color: string;
  cost: number;
  exhaust?: boolean;
};

// 상태 효과 타입
type StatusEffect = {
  id: string;
  name: string;
  duration: number;
  value: number;
  description: string;
};

function getRandomCard(id: number): CardData {
  const c = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
  return { id, ...c };
}

const INIT_PLAYER_HP = 30;
const INIT_ENEMY_HP = 100;
const INIT_PLAYER_ENERGY = 3;
const ENEMY_ATTACK = 4;

const GameBoard: React.FC = () => {
  const [playerHP, setPlayerHP] = useState(INIT_PLAYER_HP);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(INIT_PLAYER_ENERGY);
  const [enemyHP, setEnemyHP] = useState(INIT_ENEMY_HP);
  const [enemyAttack, setEnemyAttack] = useState(ENEMY_ATTACK);
  const [hand, setHand] = useState<CardData[]>([getRandomCard(1), getRandomCard(2), getRandomCard(3)]);
  const [selected, setSelected] = useState<number[]>([]);
  const [log, setLog] = useState<string[]>(["게임 시작!"]);
  const [turn, setTurn] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [playerStatusEffects, setPlayerStatusEffects] = useState<StatusEffect[]>([]);
  const [enemyStatusEffects, setEnemyStatusEffects] = useState<StatusEffect[]>([]);

  // 상태 효과 적용 함수
  const applyStatusEffect = (target: 'player' | 'enemy', status: StatusEffect) => {
    if (target === 'player') {
      setPlayerStatusEffects(prev => [...prev, status]);
    } else {
      setEnemyStatusEffects(prev => [...prev, status]);
    }
  };

  // 데미지 처리 함수
  const dealDamage = (target: 'player' | 'enemy', amount: number) => {
    if (target === 'enemy') {
      setEnemyHP(prev => Math.max(0, prev - amount));
    } else {
      setPlayerHP(prev => Math.max(0, prev - amount));
    }
  };

  // 카드 드로우 함수
  const drawCards = (count: number) => {
    setHand(prev => [
      ...prev,
      ...Array.from({ length: count }, (_, i) => getRandomCard(Date.now() + i))
    ]);
  };

  // 카드 선택/해제 (여러 장 동시 선택, 에너지 초과 시 불가)
  const toggleSelect = (id: number) => {
    const card = hand.find(c => c.id === id);
    if (!card || gameOver) return;
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      // 선택된 카드들의 총 cost + 새 카드 cost가 에너지 초과면 선택 불가
      const totalCost = selected.reduce((sum, selectedId) => {
        const selectedCard = hand.find(c => c.id === selectedId);
        return sum + (selectedCard?.cost || 0);
      }, 0) + card.cost;
      if (totalCost > playerEnergy) return;
      setSelected([...selected, id]);
    }
  };

  // 여러 장의 카드 한 번에 사용
  const playSelectedCards = () => {
    if (gameOver || selected.length === 0) return;
    let playLog: string[] = [];
    let newHand = [...hand];
    let newPlayerHP = playerHP;
    let newPlayerBlock = playerBlock;
    let newPlayerEnergy = playerEnergy;
    let newEnemyHP = enemyHP;
    let newPlayerStatusEffects = [...playerStatusEffects];
    let newEnemyStatusEffects = [...enemyStatusEffects];
    selected.forEach(id => {
      const card = newHand.find(c => c.id === id);
      if (!card) return;
      // 카드 효과 먼저 적용
      switch (card.type) {
        case 'attack':
          newEnemyHP = Math.max(0, newEnemyHP - 6);
          playLog.push(`플레이어가 Strike로 6 데미지를 입혔습니다!`);
          break;
        case 'defend':
          newPlayerBlock += 5;
          playLog.push(`플레이어가 Defend로 5 블록을 얻었습니다!`);
          break;
        case 'energy':
          newPlayerEnergy = Math.min(5, newPlayerEnergy + 2);
          playLog.push(`플레이어가 Adrenaline으로 에너지 +2를 얻었습니다!`);
          break;
        case 'draw':
          newHand = [
            ...newHand,
            ...Array.from({ length: 2 }, (_, i) => getRandomCard(Date.now() + i))
          ];
          playLog.push('플레이어가 Quick Draw로 카드 2장 뽑고 1장 버렸습니다!');
          break;
        case 'poison':
          newEnemyHP = Math.max(0, newEnemyHP - 6);
          newEnemyStatusEffects.push({
            id: 'poison', name: '중독', duration: 3, value: 3, description: '매 턴 3 데미지를 받습니다.'
          });
          playLog.push(`플레이어가 Hex Blade로 6 데미지와 중독3을 적용했습니다!`);
          break;
        case 'debuff':
          newEnemyStatusEffects.push({
            id: 'weaken', name: '약화', duration: 2, value: 0.25, description: '공격력이 25% 감소합니다.'
          });
          playLog.push(`플레이어가 Weaken으로 적의 공격력을 25% 감소시켰습니다!`);
          break;
        case 'heal':
          newPlayerHP = Math.min(INIT_PLAYER_HP, newPlayerHP + 5);
          newPlayerBlock += 10;
          playLog.push(`플레이어가 Holy Light로 체력 5 회복과 블록 10을 얻었습니다!`);
          break;
        case 'energy_attack':
          const damage = newPlayerEnergy * 4;
          newEnemyHP = Math.max(0, newEnemyHP - damage);
          playLog.push(`플레이어가 Whirlwind로 ${damage} 데미지를 입혔습니다!`);
          break;
        case 'shield':
          newPlayerBlock += 12;
          newPlayerStatusEffects.push({
            id: 'shieldWall', name: '방패벽', duration: 1, value: 6, description: '다음 턴에 6 블록이 추가됩니다.'
          });
          playLog.push(`플레이어가 Shield Wall로 블록 12와 턴 보호를 얻었습니다!`);
          break;
        case 'corrupt':
          newEnemyStatusEffects.push({
            id: 'corrupt', name: '부패', duration: 3, value: 0, description: '3턴간 특수 능력이 무효화됩니다.'
          });
          playLog.push(`플레이어가 Corrupt로 적의 능력을 3턴간 무효화했습니다!`);
          break;
        case 'poison_dagger':
          newEnemyHP = Math.max(0, newEnemyHP - 3);
          newEnemyStatusEffects.push({
            id: 'poison', name: '독', duration: 4, value: 4, description: '매 턴 4 데미지를 받습니다.'
          });
          playLog.push(`플레이어가 Poison Dagger로 3지와 독4를 적용했습니다!`);
          break;
        case 'reflect':
          newPlayerStatusEffects.push({
            id: 'flameAura', name: '화염 오라', duration: 2, value: 2, description: '공격받을 때 2 데미지를 반사합니다.'
          });
          playLog.push(`플레이어가 Flame Aura로 2턴간 반사 데미지를 활성화했습니다!`);
          break;
        case 'freeze':
          newEnemyStatusEffects.push({
            id: 'freeze', name: '빙결', duration: 1, value: 0, description: '1턴간 행동할수 없습니다.'
          });
          playLog.push(`플레이어가 Freeze로 적을 1턴간 빙결시켰습니다!`);
          break;
        case 'trap':
          newEnemyStatusEffects.push({
            id: 'explosiveTrap', name: '폭발 트랩', duration: 3, value: 15, description: '3턴 후 15 데미지'
          });
          playLog.push('플레이어가 Explosive Trap을 설치했습니다!');
          break;
      }
      // cost 차감
      newPlayerEnergy -= card.cost || 0;
      // 핸드에서 카드 삭제
      newHand = newHand.filter(c => c.id !== id);
    });
    setPlayerEnergy(newPlayerEnergy);
    setPlayerHP(newPlayerHP);
    setPlayerBlock(newPlayerBlock);
    setEnemyHP(newEnemyHP);
    setPlayerStatusEffects(newPlayerStatusEffects);
    setEnemyStatusEffects(newEnemyStatusEffects);
    setHand(newHand);
    setLog(l => [...playLog, ...l]);
    setSelected([]);
  };

  // 상태 효과 업데이트
  const updateStatusEffects = () => {
    // 플레이어 상태 효과 업데이트
    setPlayerStatusEffects(prev =>
      prev.map(status => ({ ...status, duration: status.duration - 1 }))
        .filter(status => status.duration > 0)
    );

    // 적 상태 효과 업데이트
    setEnemyStatusEffects(prev =>
      prev.map(status => ({ ...status, duration: status.duration - 1 }))
        .filter(status => status.duration > 0)
    );
  };

  // 상태이상 효과 및 지속시간 관리 함수 (적)
  const processEnemyStatusEffects = (enemy: any, logArr: string[]) => {
    let newEnemy = { ...enemy };
    // 중독
    const poisons = newEnemy.statusEffects?.filter((s: any) => s.id === 'poison') || [];
    let totalPoison = 0;
    poisons.forEach(p => {
      newEnemy.hp = Math.max(0, newEnemy.hp - p.value);
      totalPoison += p.value;
    });
    if (totalPoison > 0) {
      logArr.push(`적이 중독으로 ${totalPoison} 데미지를 입었습니다!`);
    }
    // 폭발 트랩
    const traps = newEnemy.statusEffects?.filter((s: any) => s.id === 'explosiveTrap' && s.duration === 1) || [];
    let totalTrap = 0;
    traps.forEach(t => {
      newEnemy.hp = Math.max(0, newEnemy.hp - t.value);
      totalTrap += t.value;
    });
    if (totalTrap > 0) {
      logArr.push(`폭발 트랩이 발동! 적이 ${totalTrap} 데미지를 입었습니다!`);
    }
    // 빙결
    const frozen = newEnemy.statusEffects?.find((s: any) => s.id === 'freeze');
    if (frozen) {
      logArr.push('적이 빙결 상태로 행동하지 못합니다!');
      newEnemy.frozen = true;
    } else {
      newEnemy.frozen = false;
    }
    // duration 감소 및 만료 제거
    newEnemy.statusEffects = (newEnemy.statusEffects || [])
      .map((s: any) => ({ ...s, duration: s.duration - 1 }))
      .filter((s: any) => s.duration > 0);
    return newEnemy;
  };
  // 상태이상 효과 및 지속시간 관리 함수 (플레이어)
  const processPlayerStatusEffects = (player: any, logArr: string[]) => {
    let newPlayer = { ...player };
    // 중독
    const poison = newPlayer.statusEffects?.find((s: any) => s.id === 'poison');
    if (poison) {
      newPlayer.hp = Math.max(0, newPlayer.hp - poison.value);
      logArr.push(`플레이어가 중독으로 ${poison.value} 데미지를 입었습니다!`);
    }
    // duration 감소 및 만료 제거
    newPlayer.statusEffects = (newPlayer.statusEffects || [])
      .map((s: any) => ({ ...s, duration: s.duration - 1 }))
      .filter((s: any) => s.duration > 0);
    return newPlayer;
  };

  // 적 턴 처리 함수
  const processEnemyTurn = () => {
    let logArr: string[] = [];
    // 적 상태이상 효과 적용 및 관리
    let newEnemy = processEnemyStatusEffects({
      hp: enemyHP,
      maxHp: INIT_ENEMY_HP,
      statusEffects: enemyStatusEffects
    }, logArr);
    // 빙결 상태면 공격 스킵
    if (newEnemy.frozen) {
      setLog(l => [...logArr, ...l]);
      setEnemyStatusEffects(newEnemy.statusEffects);
      return;
    }
    // 적 공격
    // weaken(약화) 누적 적용
    let weakenEffects = newEnemy.statusEffects?.filter((s: any) => s.id === 'weaken') || [];
    let weakenRatio = weakenEffects.reduce((acc, w) => acc + w.value, 0); // value: 0.25
    let damage = Math.floor(enemyAttack * (1 - weakenRatio));
    if (damage < 0) damage = 0;
    let blockLeft = playerBlock - damage;
    let hpLeft = playerHP;
    let blockMsg = '';
    if (blockLeft >= 0) {
      blockMsg = `적이 공격! (플레이어 블록이 ${damage} 피해를 모두 막음)`;
    } else {
      hpLeft += blockLeft;
      blockMsg = `적이 공격! (플레이어가 ${Math.abs(blockLeft)} 피해를 입음)`;
    }
    if (hpLeft < 0) hpLeft = 0;
    setPlayerHP(hpLeft);
    setPlayerBlock(0);
    // 데미지 반사(플레이어의 화염 오라)
    const flameAuras = playerStatusEffects.filter(s => s.id === 'flameAura');
    let totalReflect = 0;
    flameAuras.forEach(aura => {
      newEnemy.hp = Math.max(0, newEnemy.hp - aura.value);
      totalReflect += aura.value;
    });
    if (totalReflect > 0) {
      setLog(l => [`플레이어의 화염 오라로 적이 ${totalReflect} 데미지를 반사로 입었습니다!`, ...l]);
    }
    setEnemyHP(newEnemy.hp);
    setEnemyStatusEffects(newEnemy.statusEffects);
    setLog(l => [blockMsg, ...logArr, ...l]);
  };

  // 플레이어 턴 상태이상 처리 함수
  const processPlayerTurn = () => {
    let logArr: string[] = [];
    let newPlayer = processPlayerStatusEffects({
      hp: playerHP,
      maxHp: INIT_PLAYER_HP,
      statusEffects: playerStatusEffects
    }, logArr);
    setPlayerHP(newPlayer.hp);
    setPlayerStatusEffects(newPlayer.statusEffects);
    setLog(l => [...logArr, ...l]);
  };

  // 턴 종료 및 적 공격
  const endTurn = () => {
    if (gameOver) return;
    setTimeout(() => {
      // 플레이어 상태이상 처리
      processPlayerTurn();
      // 적 턴 처리(상태이상, 빙결, 공격 등)
      processEnemyTurn();
      setTurn(t => t + 1);
      // 새 손패 및 에너지 회복
      setHand([getRandomCard(Date.now()), getRandomCard(Date.now() + 1), getRandomCard(Date.now() + 2)]);
      setPlayerEnergy(INIT_PLAYER_ENERGY);
      // 게임 종료 체크
      if (playerHP <= 0 || enemyHP <= 0) {
        setGameOver(true);
        setLog(l => [
          playerHP <= 0 ? '플레이어 패배!' : '적 처치! 승리!',
          ...l
        ]);
      }
    }, 400);
  };

  // 게임 재시작
  const restart = () => {
    setPlayerHP(INIT_PLAYER_HP);
    setPlayerBlock(0);
    setPlayerEnergy(INIT_PLAYER_ENERGY);
    setEnemyHP(INIT_ENEMY_HP);
    setEnemyAttack(ENEMY_ATTACK);
    setHand([getRandomCard(1), getRandomCard(2), getRandomCard(3)]);
    setSelected([]);
    setLog(["게임 시작!"]);
    setTurn(1);
    setGameOver(false);
    setPlayerStatusEffects([]);
    setEnemyStatusEffects([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center p-2">
      <div className="w-full max-w-md mt-4">
        <EnemyStatus hp={enemyHP} maxHp={INIT_ENEMY_HP} />
      </div>
      <div className="w-full max-w-md my-2">
        <GameLog log={log} turn={turn} />
      </div>
      <div className="w-full max-w-md flex flex-col gap-2 mt-auto mb-4">
        <PlayerStatus hp={playerHP} maxHp={INIT_PLAYER_HP} block={playerBlock} energy={playerEnergy} />
        <div className="flex justify-center gap-4 mt-2">
          {hand.map(card => (
            <Card
              key={card.id}
              card={card}
              selected={selected.includes(card.id)}
              disabled={gameOver || playerEnergy < card.cost}
              onClick={() => toggleSelect(card.id)}
            />
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="py-2 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            onClick={playSelectedCards}
            disabled={gameOver || selected.length === 0}
          >
            카드 사용
          </button>
          <button
            className={`py-2 px-6 rounded-lg font-bold text-white transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 ${gameOver ? 'cursor-not-allowed' : ''}`}
            onClick={endTurn}
            disabled={gameOver}
          >
            {gameOver ? '게임 종료' : 'End Turn'}
          </button>
        </div>
        {gameOver && (
          <button
            className="mt-2 py-2 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700"
            onClick={restart}
          >
            게임 재시작
          </button>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
