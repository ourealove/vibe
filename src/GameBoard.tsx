import React, { useState } from 'react';
import EnemyStatus from './EnemyStatus.tsx';
import PlayerStatus from './PlayerStatus.tsx';
import GameLog from './GameLog.tsx';
import Card from './Card.tsx';

// 카드 타입 정의
const CARD_TYPES = [
  { type: 'attack', name: 'Attack', effect: '10 Damage', icon: '🗡️', color: 'red-500' },
  { type: 'defend', name: 'Defend', effect: '5 Block', icon: '🛡️', color: 'blue-500' },
];

type CardType = typeof CARD_TYPES[number]['type'];

type CardData = {
  id: number;
  type: CardType;
  name: string;
  effect: string;
  icon: string;
  color: string;
};

function getRandomCard(id: number): CardData {
  const c = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
  return { id, ...c };
}

const INIT_PLAYER_HP = 30;
const INIT_ENEMY_HP = 100;
const ENEMY_ATTACK = 4;
const ATTACK_DAMAGE = 10;
const DEFEND_BLOCK = 5;

const GameBoard: React.FC = () => {
  const [playerHP, setPlayerHP] = useState(INIT_PLAYER_HP);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [enemyHP, setEnemyHP] = useState(INIT_ENEMY_HP);
  const [hand, setHand] = useState<CardData[]>([getRandomCard(1), getRandomCard(2), getRandomCard(3)]);
  const [selected, setSelected] = useState<number[]>([]);
  const [log, setLog] = useState<string[]>(["게임 시작!"]);
  const [turn, setTurn] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  // 카드 선택
  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  // 카드 사용
  const playCards = () => {
    let newEnemyHP = enemyHP;
    let newBlock = playerBlock;
    let playLog: string[] = [];
    selected.forEach(id => {
      const card = hand.find(c => c.id === id);
      if (!card) return;
      if (card.type === 'attack') {
        newEnemyHP -= ATTACK_DAMAGE;
        playLog.push(`플레이어가 공격! (적에게 10 데미지)`);
      } else if (card.type === 'defend') {
        newBlock += DEFEND_BLOCK;
        playLog.push(`플레이어가 방어! (블록 +5)`);
      }
    });
    if (newEnemyHP < 0) newEnemyHP = 0;
    setEnemyHP(newEnemyHP);
    setPlayerBlock(newBlock);
    setLog(l => [
      ...playLog,
      ...l
    ]);
    setSelected([]);
  };

  // 턴 종료 및 적 공격
  const endTurn = () => {
    if (gameOver) return;
    playCards();
    setTimeout(() => {
      // 적 공격
      let damage = ENEMY_ATTACK;
      let blockLeft = playerBlock - damage;
      let hpLeft = playerHP;
      let blockMsg = '';
      if (blockLeft >= 0) {
        blockMsg = `적이 공격! (플레이어 블록이 ${damage} 피해를 모두 막음)`;
      } else {
        hpLeft += blockLeft; // blockLeft는 음수
        blockMsg = `적이 공격! (플레이어가 ${-blockLeft} 피해를 입음)`;
      }
      if (hpLeft < 0) hpLeft = 0;
      setPlayerHP(hpLeft);
      setPlayerBlock(0);
      setLog(l => [blockMsg, ...l]);
      setTurn(t => t + 1);
      // 새 손패
      setHand([getRandomCard(Date.now()), getRandomCard(Date.now() + 1), getRandomCard(Date.now() + 2)]);
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
    setEnemyHP(INIT_ENEMY_HP);
    setHand([getRandomCard(1), getRandomCard(2), getRandomCard(3)]);
    setSelected([]);
    setLog(["게임 시작!"]);
    setTurn(1);
    setGameOver(false);
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
        <PlayerStatus hp={playerHP} maxHp={INIT_PLAYER_HP} block={playerBlock} />
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
