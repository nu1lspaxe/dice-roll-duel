import { useEffect, useState } from "react";

interface DiceProps {
  value: number;
  isRolling: boolean;
  rollDelay?: number;
}

export default function Dice({ value, isRolling, rollDelay = 0 }: DiceProps) {
  const [isDelayedRolling, setIsDelayedRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (isRolling) {
      setTimeout(() => {
        setIsDelayedRolling(true);
        
        // Show random values during rolling animation
        const rollInterval = setInterval(() => {
          setDisplayValue(Math.floor(Math.random() * 6) + 1);
        }, 100);

        // Stop rolling after 2 seconds and show final value
        setTimeout(() => {
          clearInterval(rollInterval);
          setDisplayValue(value);
          setIsDelayedRolling(false);
        }, 2000);
      }, rollDelay * 1000);
    } else {
      setIsDelayedRolling(false);
      setDisplayValue(value);
    }
  }, [isRolling, rollDelay, value]);

  // Generate dots pattern based on dice value
  const getDotPattern = (num: number) => {
    const patterns: { [key: number]: string[] } = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };
    return patterns[num] || [];
  };

  const dotPositions = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'middle-left': 'top-1/2 left-2 transform -translate-y-1/2',
    'middle-right': 'top-1/2 right-2 transform -translate-y-1/2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  return (
    <div 
      className={`
        relative w-20 h-20 bg-white border-2 border-gray-300 rounded-lg shadow-lg
        transition-all duration-300
        ${isDelayedRolling ? 'animate-bounce scale-110' : 'scale-100'}
      `}
      style={{
        animation: isDelayedRolling ? 'spin 0.1s linear infinite' : 'none'
      }}
    >
      {/* Dots */}
      {getDotPattern(displayValue).map((position, index) => (
        <div
          key={index}
          className={`absolute w-3 h-3 bg-black rounded-full ${dotPositions[position as keyof typeof dotPositions]}`}
        />
      ))}
      
      {/* Add custom spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg) scale(1.1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1.1); }
          75% { transform: rotate(270deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
