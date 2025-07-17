// 카드 태그 타입
export type CardTag =
  |'attack'
  | 'defense' | 'energy' | 'draw'
  | 'discard' | 'status' | 'debuff' | 'heal'
  | 'buff'
  | 'reflect'
  | 'trap' | 'delay';

// 카드 데이터 구조
export interface CardData {
  id: string;
  name: string;
  description: string;
  tags: CardTag[]; // 배열로 수정
  cost: number;
  effect: (context: EffectContext) => void;
  rarity?: 'common' | 'uncommon' | 'rare';
  exhaust?: boolean; // 사용 후 제거되는 카드
  ethereal?: boolean; // 턴 종료 시 버려지는 카드
}

// 상태 효과 타입
export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  value: number;
  description: string;
}

// 플레이어 상태
export interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  statusEffects: StatusEffect[];
}

// 적 상태
export interface EnemyState {
  hp: number;
  maxHp: number;
  attack: number;
  statusEffects: StatusEffect[];
}

// 게임 상태
export interface GameState {
  player: PlayerState;
  enemy: EnemyState;
  deck: CardData[];
  hand: CardData[];
  discardPile: CardData[];
  turn: number;
  gameOver: boolean;
}

// 효과 컨텍스트
export interface EffectContext {
  player: PlayerState;
  enemy: EnemyState;
  gameState: GameState;
  // 유틸리티 함수들
  dealDamage: (target: 'player' | 'enemy', amount: number) => void;
  gainBlock: (amount: number) => void;
  healPlayer: (amount: number) => void;
  drawCards: (count: number) => void;
  discardCards: (count: number) => void;
  applyStatus: (target: 'player' | 'enemy', status: StatusEffect) => void;
  gainEnergy: (amount: number) => void;
  exhaustCard: (cardId: string) => void;
  addToHand: (card: CardData) => void;
  removeFromHand: (cardId: string) => void;
  log: (message: string) => void;
}
