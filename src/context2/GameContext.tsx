import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export type TurnType = 'player' | 'enemy';

export interface PlayerState {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  statusEffects: any[];
}

export interface EnemyState {
  id: string;
  hp: number;
  maxHp: number;
  attack: number;
  baseAttack?: number;
  statusEffects: any[];
}

export interface GameState {
  player: PlayerState;
  enemies: EnemyState[];
  deck: any[];
  hand: any[];
  discardPile: any[];
  turn: TurnType;
  turnCount: number;
  gamePhase: 'battle' | 'victory' | 'defeat';
}

interface GameContextProps extends GameState {
  isPlayerTurn: boolean;
  endTurn: () => void;
  nextTurn: () => void;
  applyStartOfTurnEffects: () => void;
  playCard: (card: any) => void;
  log: (msg: string) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGameState = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('GameContext not found');
  return ctx;
};

function getEnemyAttack(enemy: EnemyState) {
  let attack = enemy.baseAttack ?? enemy.attack;
  // weaken 적용
  const weaken = enemy.statusEffects.find((s: any) => s.id === 'weaken');
  if (weaken) attack = Math.floor(attack * (1 - weaken.value));
  // corrupt(능력 무효) 적용
  const corrupt = enemy.statusEffects.find((s: any) => s.id === 'corrupt');
  if (corrupt) attack = 0;
  return Math.max(0, attack);
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerState>({
    hp: 30, maxHp: 30, energy: 3, maxEnergy: 3, block: 0, statusEffects: [],
  });
  const [enemies, setEnemies] = useState<EnemyState[]>([
    { id: 'enemy1', hp: 20, maxHp: 20, attack: 8, baseAttack: 8, statusEffects: [] },
  ]);
  const [deck, setDeck] = useState<any[]>([]);
  const [hand, setHand] = useState<any[]>([]);
  const [discardPile, setDiscardPile] = useState<any[]>([]);
  const [turn, setTurn] = useState<TurnType>('player');
  const [turnCount, setTurnCount] = useState(1);
  const [gamePhase, setGamePhase] = useState<'battle' | 'victory' | 'defeat'>('battle');

  // 로그 상태 추가
  const [log, setLog] = useState<string[]>(["게임 시작!"]);

  // useRef로 최신 상태 동기 관리
  const playerRef = useRef(player);
  const enemiesRef = useRef(enemies);

  // 상태 동기화: setState와 useRef를 항상 같이 갱신
  const syncPlayer = (p: PlayerState) => { playerRef.current = p; setPlayer(p); };
  const syncEnemies = (e: EnemyState[]) => { enemiesRef.current = e; setEnemies(e); };

  const isPlayerTurn = turn === 'player';

  // 상태이상 효과만 적용 (duration 감소/제거는 별도)
  function applyStatusEffectsToEnemyNoDuration(enemy: EnemyState, logArr: string[]): EnemyState {
    let newEnemy = { ...enemy };
    // poison
    const poison = newEnemy.statusEffects.find((s: any) => s.id === 'poison');
    if (poison) {
      newEnemy.hp = Math.max(0, newEnemy.hp - poison.value);
      logArr.push(`적이 중독으로 ${poison.value} 데미지를 입었습니다!`);
    }
    // explosiveTrap
    const trap = newEnemy.statusEffects.find((s: any) => s.id === 'explosiveTrap');
    if (trap && trap.duration === 1) {
      newEnemy.hp = Math.max(0, newEnemy.hp - trap.value);
      logArr.push(`폭발 트랩이 발동! 적이 ${trap.value} 데미지를 입었습니다!`);
    }
    return newEnemy;
  }
  function applyStatusEffectsToPlayerNoDuration(player: PlayerState, logArr: string[]): PlayerState {
    let newPlayer = { ...player };
    // poison
    const poison = newPlayer.statusEffects.find((s: any) => s.id === 'poison');
    if (poison) {
      newPlayer.hp = Math.max(0, newPlayer.hp - poison.value);
      logArr.push(`플레이어가 중독으로 ${poison.value} 데미지를 입었습니다!`);
    }
    return newPlayer;
  }
  // duration 감소 및 만료 제거
  function tickStatusEffects(effects: any[]): any[] {
    return effects.map((s: any) => ({ ...s, duration: s.duration - 1 })).filter((s: any) => s.duration > 0);
  }

  // 적 턴 동기 처리 함수 (freeze 체크→공격→상태이상 효과→duration 감소/제거)
  function processEnemyTurn() {
    let logArr: string[] = [];
    let updatedPlayer = { ...playerRef.current };
    let updatedEnemies = enemiesRef.current.map(e => ({ ...e }));

    // 1. freeze(빙결) 체크 (duration > 0)
    const frozen = updatedEnemies[0]?.statusEffects?.find((s: any) => s.id === 'freeze' && s.duration > 0);
    if (frozen) {
      logArr.push('적이 빙결 상태로 행동하지 못합니다!');
    } else {
      // 2. shieldWall 체크
      const hasShieldWall = updatedPlayer.statusEffects?.some((s: any) => s.id === 'shieldWall' && s.duration > 0);
      if (hasShieldWall) {
        logArr.push('플레이어가 방패벽 효과로 이번 턴 모든 피해를 무효화했습니다!');
      } else {
        // 3. 적 공격
        let damage = 0;
        updatedEnemies.forEach(enemy => {
          damage += getEnemyAttack(enemy);
        });
        let blockLeft = updatedPlayer.block - damage;
        let hpLeft = updatedPlayer.hp;
        if (blockLeft >= 0) {
          logArr.push(`적이 공격! (플레이어 블록이 ${damage} 피해를 모두 막음)`);
        } else {
          hpLeft += blockLeft;
          logArr.push(`적이 공격! (플레이어가 ${Math.abs(blockLeft)} 피해를 입음)`);
        }
        if (hpLeft < 0) hpLeft = 0;
        updatedPlayer.hp = hpLeft;
        updatedPlayer.block = 0;
      }
    }
    // 4. 상태이상 효과 적용 (중독 등)
    updatedEnemies = updatedEnemies.map(enemy => applyStatusEffectsToEnemyNoDuration(enemy, logArr));
    updatedPlayer = applyStatusEffectsToPlayerNoDuration(updatedPlayer, logArr);
    // 5. duration 감소/제거
    updatedEnemies = updatedEnemies.map(enemy => ({ ...enemy, statusEffects: tickStatusEffects(enemy.statusEffects) }));
    updatedPlayer.statusEffects = tickStatusEffects(updatedPlayer.statusEffects);
    // useRef에 최신값 반영 + setState로 렌더링 동기화
    playerRef.current = updatedPlayer;
    enemiesRef.current = updatedEnemies;
    setPlayer(updatedPlayer);
    setEnemies(updatedEnemies);
    if (logArr.length > 0) logArr.forEach(msg => logMsg(msg));
  }

  const applyStartOfTurnEffects = useCallback(() => {
    if (turn === 'player') {
      // 플레이어 턴: 에너지/블록 리셋, 상태이상 효과 적용, duration 감소/제거, 카드 드로우
      let logArr: string[] = [];
      let updatedPlayer = { ...playerRef.current, energy: playerRef.current.maxEnergy, block: 0 };
      updatedPlayer = applyStatusEffectsToPlayerNoDuration(updatedPlayer, logArr);
      updatedPlayer.statusEffects = tickStatusEffects(updatedPlayer.statusEffects);
      playerRef.current = updatedPlayer;
      setPlayer(updatedPlayer);
      if (logArr.length > 0) logArr.forEach(msg => logMsg(msg));
      drawCards(5);
    } else {
      // 적 턴: 동기 처리 함수 호출
      processEnemyTurn();
    }
  }, [turn, deck, discardPile, enemies, player]);

  const nextTurn = useCallback(() => {
    if (gamePhase !== 'battle') return;
    if (turn === 'player') {
      setTurn('enemy');
    } else {
      setTurn('player');
      setTurnCount(c => c + 1);
    }
  }, [turn, gamePhase]);

  const endTurn = useCallback(() => {
    if (isPlayerTurn) nextTurn();
  }, [isPlayerTurn, nextTurn]);

  useEffect(() => {
    if (gamePhase !== 'battle') return;
    applyStartOfTurnEffects();
    if (enemies.every(e => e.hp <= 0)) setGamePhase('victory');
    if (player.hp <= 0) setGamePhase('defeat');
    // eslint-disable-next-line
  }, [turn]);

  // 카드 드로우
  function drawCards(count: number) {
    setHand(prevHand => {
      let newHand = [...prevHand];
      let newDeck = [...deck];
      let newDiscard = [...discardPile];
      for (let i = 0; i < count; i++) {
        if (newDeck.length === 0) {
          // 덱이 비었으면 버림 더미를 셔플해서 덱으로
          newDeck = shuffle([...newDiscard]);
          newDiscard = [];
        }
        if (newDeck.length > 0) {
          newHand.push(newDeck.shift());
        }
      }
      setDeck(newDeck);
      setDiscardPile(newDiscard);
      return newHand;
    });
  }

  // 카드 버리기
  function discardCards(count: number) {
    setHand(prevHand => {
      let newHand = [...prevHand];
      let newDiscard = [...discardPile];
      for (let i = 0; i < count && newHand.length > 0; i++) {
        newDiscard.push(newHand.pop());
      }
      setDiscardPile(newDiscard);
      return newHand;
    });
  }

  // 블록 획득
  function gainBlock(amount: number) {
    setPlayer(prev => ({ ...prev, block: prev.block + amount }));
  }

  // 에너지 획득
  function gainEnergy(amount: number) {
    setPlayer(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + amount) }));
  }

  // 카드 exhaust
  function exhaustCard(cardId: string) {
    setHand(prevHand => prevHand.filter((c: any) => c.id !== cardId));
    setDeck(prevDeck => prevDeck.filter((c: any) => c.id !== cardId));
    setDiscardPile(prevDiscard => prevDiscard.filter((c: any) => c.id !== cardId));
  }

  // 상태이상 적용
  function applyStatus(target: 'player' | 'enemy', status: any) {
    if (target === 'player') {
      setPlayer(prev => ({ ...prev, statusEffects: [...prev.statusEffects, status] }));
    } else {
      setEnemies(prev => prev.map((e, i) => i === 0 ? { ...e, statusEffects: [...e.statusEffects, status] } : e));
    }
  }

  // 데미지
  function dealDamage(target: 'player' | 'enemy', amount: number) {
    if (target === 'player') {
      setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - amount) }));
    } else {
      setEnemies(prev => prev.map((e, i) => i === 0 ? { ...e, hp: Math.max(0, e.hp - amount) } : e));
    }
  }

  // 로그
  function logMsg(msg: string) {
    setLog(prev => [msg, ...prev.slice(0, 19)]);
  }

  // 카드 사용 (핸드에서 카드 선택 시 호출)
  function playCard(card: any) {
    // 카드 효과 실행
    if (card && card.effect) {
      card.effect({
        player: playerRef.current,
        enemy: enemiesRef.current[0],
        gameState: { player: playerRef.current, enemy: enemiesRef.current[0], deck, hand, discardPile, turn, turnCount, gameOver: gamePhase !== 'battle' },
        dealDamage,
        gainBlock,
        healPlayer: (amount: number) => syncPlayer({ ...playerRef.current, hp: Math.min(playerRef.current.maxHp, playerRef.current.hp + amount) }),
        drawCards,
        discardCards,
        applyStatus: (target: 'player' | 'enemy', status: any) => {
          if (target === 'player') {
            const updated = { ...playerRef.current, statusEffects: [...playerRef.current.statusEffects, status] };
            syncPlayer(updated);
          } else {
            const updated = enemiesRef.current.map((e, i) => i === 0 ? { ...e, statusEffects: [...e.statusEffects, status] } : e);
            syncEnemies(updated);
          }
        },
        gainEnergy,
        exhaustCard,
        addToHand: (c: any) => setHand(prev => [...prev, c]),
        removeFromHand: (cardId: string) => setHand(prev => prev.filter((c: any) => c.id !== cardId)),
        log: logMsg,
      });
      // exhaust 처리
      if (card.exhaust) exhaustCard(card.id);
      // 핸드에서 사용한 카드 제거
      setHand(prev => prev.filter((c: any) => c.id !== card.id));
      // 사용한 카드는 버림 더미로
      setDiscardPile(prev => [...prev, card]);
    }
  }

  return (
    <GameContext.Provider
      value={{
        player, enemies, deck, hand, discardPile,
        turn, turnCount, gamePhase,
        isPlayerTurn, endTurn, nextTurn, applyStartOfTurnEffects,
        playCard, log // playCard, log 추가
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// 셔플 함수
function shuffle(array: any[]) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
