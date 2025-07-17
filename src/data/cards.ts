import { CardData, EffectContext, StatusEffect } from '../types/card';

export const cards: Record<string, CardData> = {
  strike: {
    id: 'strike',
    name: '스트라이크',
    description: '적 1명에게 6 데미지를 줍니다.',
    tags: ['attack'],
    cost: 1,
    effect: ({ dealDamage, log }) => {
      dealDamage('enemy', 6);
      log('플레이어가 스트라이크로 6 데미지를 입혔습니다!');
    },
  },
  defend: {
    id: 'defend',
    name: '디펜드',
    description: '블록 5를 얻습니다.',
    tags: ['defense'],
    cost: 1,
    effect: ({ gainBlock, log }) => {
      gainBlock(5);
      log('플레이어가 디펜드로 5 블록을 얻었습니다!');
    },
  },
  adrenaline: {
    id: 'adrenaline',
    name: '아드레날린',
    description: '에너지 +2, 카드 1장 뽑음. (Exhaust)',
    tags: ['energy', 'draw'],
    cost: 0,
    exhaust: true,
    effect: ({ gainEnergy, drawCards, log }) => {
      gainEnergy(2);
      drawCards(1);
      log('플레이어가 아드레날린으로 에너지 +2, 카드 1장 뽑았습니다!');
    },
  },
  quickDraw: {
    id: 'quickDraw',
    name: '퀵 드로우',
    description: '카드 2장 뽑고 1장 버림.',
    tags: ['draw', 'discard'],
    cost: 1,
    effect: ({ drawCards, discardCards, log }) => {
      drawCards(2);
      discardCards(1);
      log('플레이어가 퀵 드로우로 카드 2장 뽑고 1장 버렸습니다!');
    },
  },
  hexBlade: {
    id: 'hexBlade',
    name: '헥스 블레이드',
    description: '6 데미지 + 중독 3(3턴).',
    tags: ['attack', 'status'],
    cost: 1,
    effect: ({ dealDamage, applyStatus, log }) => {
      dealDamage('enemy', 6);
      const poison: StatusEffect = {
        id: 'poison',
        name: '중독',
        duration: 3,
        value: 3,
        description: '매 턴 3 데미지를 받습니다.'
      };
      applyStatus('enemy', poison);
      log('플레이어가 헥스 블레이드로 6 데미지와 중독 3을 적용했습니다!');
    },
  },
  weaken: {
    id: 'weaken',
    name: '위큰',
    description: '적 공격력 25% 감소(2턴).',
    tags: ['status', 'debuff'],
    cost: 1,
    effect: ({ applyStatus, log }) => {
      const weaken: StatusEffect = {
        id: 'weaken',
        name: '약화',
        duration: 2,
        value: 0.25,
        description: '공격력이 25% 감소합니다.'
      };
      applyStatus('enemy', weaken);
      log('플레이어가 위큰으로 적의 공격력을 25% 감소시켰습니다!');
    },
  },
};

export const getCardList = (): CardData[] => Object.values(cards);

export const getCardById = (id: string): CardData | undefined => cards[id];

export const getCardsByTag = (tag: string): CardData[] => Object.values(cards).filter(card => card.tags.includes(tag as any));
