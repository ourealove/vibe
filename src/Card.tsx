import React from 'react';

type CardProps = {
  card: {
    id: number;
    type: string;
    name: string;
    effect: string;
    icon: string;
    color: string;
  };
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
};

function Card({ card, selected, disabled, onClick }: CardProps) {
  return (
    <button
      className={`relative flex flex-col items-center border-2 rounded-xl shadow-lg px-4 py-6 w-28 h-40 transition-all duration-200
        bg-white
        ${selected ? 'border-yellow-400 ring-4 ring-yellow-200 scale-105 z-10' : 'border-gray-300'}
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-105 hover:border-indigo-400'}
      `}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <span className={`text-3xl mb-2`}>{card.icon}</span>
      <span className={`font-bold text-lg mb-1 text-${card.color}`}>{card.name}</span>
      <span className="text-xs text-gray-700 mb-2">{card.effect}</span>
      <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400`}>CLICK</div>
    </button>
  );
}

export default Card;
