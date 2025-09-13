import { useEffect } from "react";
import Dice from "./Dice.tsx";
import GameUI from "./GameUI.tsx";
import ScoreBoard from "./ScoreBoard.tsx";
import { useDiceGame } from "../lib/stores/useDiceGame.tsx";
import { useAudio } from "../lib/stores/useAudio";

export default function DiceGame() {
  const { 
    gameState, 
    currentRoll, 
    isRolling
  } = useDiceGame();
  const { playHit, playSuccess } = useAudio();

  // Play sounds based on game state changes
  useEffect(() => {
    if (gameState === "rolling") {
      playHit();
    } else if (gameState === "result" && currentRoll.length > 0) {
      playSuccess();
    }
  }, [gameState, currentRoll, playHit, playSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      {/* Game Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🎲 骰子比大小 🎲</h1>
        <p className="text-xl text-gray-300">預測下一局點數與上一局的大小關係</p>
      </div>

      {/* Dice Container */}
      <div className="flex justify-center items-center space-x-6 mb-8">
        <Dice 
          value={currentRoll[0] || 1}
          isRolling={isRolling}
          rollDelay={0}
        />
        <Dice 
          value={currentRoll[1] || 1}
          isRolling={isRolling}
          rollDelay={0.2}
        />
        <Dice 
          value={currentRoll[2] || 1}
          isRolling={isRolling}
          rollDelay={0.4}
        />
      </div>

      {/* Game UI */}
      <div className="w-full max-w-4xl flex justify-center">
        <GameUI />
      </div>

      {/* Score Board - positioned in top right */}
      <div className="absolute top-4 right-4">
        <ScoreBoard />
      </div>
    </div>
  );
}
