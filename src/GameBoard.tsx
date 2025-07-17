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
  { type: 'draw', name: 'Quick Draw', effect: '카드 2장 뽑고 1장 버림', icon: '🎴', color: 'purple-500', cost: 1 },
  { type: 'poison', name: 'Hex Blade', effect: '6 데미지 + 중독 3', icon: '☠️', color: 'green-500', cost: 1 },
  { type: 'debuff', name: 'Weaken', effect: '적 공격력 25% 감소', icon: '📉', color: 'orange-500', cost: 1 },
  { type: 'heal', name: 'Holy Light', effect: '체력 5 회복 + 블록 10', icon: '✨', color: 'pink-500', cost: 2 },
  { type: 'energy_attack', name: 'Whirlwind', effect: '에너지 × 4 데미지', icon: '🌪️', color: 'cyan-500', cost: 0 },
  { type: 'shield', name: 'Shield Wall', effect: '블록 12 + 다음 턴 보호', icon: '🏰', color: 'indigo-500', cost: 2 },
  { type: 'corrupt', name: 'Corrupt', effect: '적 능력 3턴 무효화', icon: '💀', color: 'gray-500', cost: 2 },
  { type: 'reboot', name: 'Reboot', effect: '패 전체 교체', icon: '🔄', color: 'teal-500', cost: 1 },
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

  // 카드 선택
  const toggleSelect = (id: number) => {
    const card = hand.find(c => c.id === id);
    if (!card) return;

    if (selected.includes(id)) {
      // 이미 선택된 카드는 무조건 취소
      setSelected(selected.filter(s => s !== id));
    } else {
      // 새로 선택할 때만 에너지 초과 체크
      const totalCost = selected.reduce((sum, selectedId) => {
        const selectedCard = hand.find(c => c.id === selectedId);
        return sum + (selectedCard?.cost || 0);
      }, 0) + card.cost;
      if (totalCost > playerEnergy) return;
      setSelected([...selected, id]);
    }
  };

  // 카드 사용
  const playCards = () => {
    let totalCost = 0;
    let playLog: string[] = [];

    selected.forEach(id => {
      const card = hand.find(c => c.id === id);
      if (!card) return;

      totalCost += card.cost;

      switch (card.type) {
        case 'attack':
          dealDamage('enemy', 6);
          playLog.push(`플레이어가 Strike로 6혔습니다!`);
          break;
        case 'defend':
          setPlayerBlock(prev => prev + 5);
          playLog.push(`플레이어가 Defend로 5 블록을 얻었습니다!`);
          break;
        case 'energy':
          setPlayerEnergy(prev => Math.min(5, prev + 2));
          // 카드 뽑기 로직 추가 필요
          playLog.push(`플레이어가 Adrenaline으로 에너지 +2를 얻었습니다!`);
          break;
        case 'poison':
          dealDamage('enemy', 6);
          applyStatusEffect('enemy', {
            id: 'poison',
            name: '중독',
            duration: 3,
            value: 3,
            description: '매 턴 3 데미지를 받습니다.'
          });
          playLog.push(`플레이어가 Hex Blade로 6 데미지와 중독3을 적용했습니다!`);
          break;
        case 'debuff':
          applyStatusEffect('enemy', {
            id: 'weaken',
            name: '약화',
            duration: 2,
            value: 0.25,
            description: '공격력이 25% 감소합니다.'
          });
          playLog.push(`플레이어가 Weaken으로 적의 공격력을 25% 감소시켰습니다!`);
          break;
        case 'heal':
          setPlayerHP(prev => Math.min(INIT_PLAYER_HP, prev + 5));
          setPlayerBlock(prev => prev + 10);
          playLog.push(`플레이어가 Holy Light로 체력 5 회복과 블록 10을 얻었습니다!`);
          break;
        case 'energy_attack':
          const damage = playerEnergy * 4;
          dealDamage('enemy', damage);
          playLog.push(`플레이어가 Whirlwind로 ${damage} 데미지를 입혔습니다!`);
          break;
        case 'shield':
          setPlayerBlock(prev => prev + 12);
          applyStatusEffect('player', {
            id: 'shieldWall',
            name: '방패벽',
            duration: 1,
            value: 6,
            description: '다음 턴에 6 블록이 추가됩니다.'
          });
          playLog.push(`플레이어가 Shield Wall로 블록 12음 턴 보호를 얻었습니다!`);
          break;
        case 'corrupt':
          applyStatusEffect('enemy', {
            id: 'corrupt',
            name: '부패',
            duration: 3,
            value: 0,
            description: '3턴간 특수 능력이 무효화됩니다.'
          });
          playLog.push(`플레이어가 Corrupt로 적의 능력을 3턴간 무효화했습니다!`);
          break;
        case 'reboot':
          // 패 교체 로직
          playLog.push(`플레이어가 Reboot로 패를 교체했습니다!`);
          break;
        case 'poison_dagger':
          dealDamage('enemy', 3);
          applyStatusEffect('enemy', {
            id: 'poison',
            name: '독',
            duration: 4,
            value: 4,
            description: '매 턴 4 데미지를 받습니다.'
          });
          playLog.push(`플레이어가 Poison Dagger로 3지와 독4를 적용했습니다!`);
          break;
        case 'reflect':
          applyStatusEffect('player', {
            id: 'flameAura',
            name: '화염 오라',
            duration: 2,
            value: 2,
            description: '공격받을 때 2 데미지를 반사합니다.'
          });
          playLog.push(`플레이어가 Flame Aura로 2턴간 반사 데미지를 활성화했습니다!`);
          break;
        case 'freeze':
          applyStatusEffect('enemy', {
            id: 'freeze',
            name: '빙결',
            duration: 1,
            value: 0,
            description: '1턴간 행동할수 없습니다.'
          });
          playLog.push(`플레이어가 Freeze로 적을 1턴간 빙결시켰습니다!`);
          break;
        case 'trap':
          applyStatusEffect('player', {
            id: 'explosiveTrap',
            name: '폭발 트랩',
            duration: 3,
            value: 15,
            description: '3턴 후 모든 적에게 15 데미지를 줍니다.'
          });
          playLog.push(`플레이어가 Explosive Trap을 설치했습니다!`);
          break;
      }
    });

    // 에너지 소모
    setPlayerEnergy(prev => prev - totalCost);

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

  // 턴 종료 및 적 공격
  const endTurn = () => {
    if (gameOver) return;
    playCards();
    setTimeout(() => {
      // 상태 효과 처리
      updateStatusEffects();

      // 적 공격
      let damage = enemyAttack;
      let blockLeft = playerBlock - damage;
      let hpLeft = playerHP;
      let blockMsg = '';

      if (blockLeft >= 0) {
        blockMsg = `적이 공격! (플레이어 블록이 ${damage} 피해를 모두 막음)`;
      } else {
        hpLeft += blockLeft; // blockLeft는 음수
        blockMsg = `적이 공격! (플레이어가 ${Math.abs(blockLeft)} 피해를 입음)`;
      }

      if (hpLeft < 0) hpLeft = 0;
      setPlayerHP(hpLeft);
      setPlayerBlock(0);
      setLog(l => [blockMsg, ...l]);
      setTurn(t => t + 1);

      // 새 손패 및 에너지 회복
      setHand([getRandomCard(Date.now()), getRandomCard(Date.now() + 1), getRandomCard(Date.now() + 2)]);
      setPlayerEnergy(INIT_PLAYER_ENERGY);

      // 게임 종료 체크
      if (hpLeft <= 0 || enemyHP <= 0) {
        setGameOver(true);
        setLog(l => [
          hpLeft <= 0 ? '플레이어 패배!' : '적 처치! 승리!',
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
              disabled={selected.length >= 3 && !selected.includes(card.id) || gameOver}
              onClick={() => toggleSelect(card.id)}
            />
          ))}
        </div>
        <button
          className={`mt-4 py-2 rounded-lg font-bold text-white transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 ${gameOver ? 'cursor-not-allowed' : ''}`}
          onClick={endTurn}
          disabled={gameOver}
        >
          {gameOver ? '게임 종료' : 'End Turn'}
        </button>
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
