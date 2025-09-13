import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import Dice from "./Dice.tsx";
import GameUI from "./GameUI.tsx";
import ScoreBoard from "./ScoreBoard.tsx";
import { useDiceGame } from "../lib/stores/useDiceGame.tsx";
import { useAudio } from "../lib/stores/useAudio";

export default function DiceGame() {
  const gameRef = useRef<THREE.Group>(null);
  const { 
    gameState, 
    currentRoll, 
    previousRoll,
    isRolling,
    rollDice,
    resetGame
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

  // Create ground plane
  const Ground = () => (
    <mesh 
      receiveShadow 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -1, 0]}
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#2d2d44" />
    </mesh>
  );

  return (
    <group ref={gameRef}>
      <Ground />
      
      {/* Dice positioning */}
      <Dice 
        position={[-2, 2, 0]} 
        value={currentRoll[0] || 1}
        isRolling={isRolling}
        rollDelay={0}
      />
      <Dice 
        position={[0, 2, 0]} 
        value={currentRoll[1] || 1}
        isRolling={isRolling}
        rollDelay={0.2}
      />
      <Dice 
        position={[2, 2, 0]} 
        value={currentRoll[2] || 1}
        isRolling={isRolling}
        rollDelay={0.4}
      />

      {/* UI Components */}
      <GameUI />
      <ScoreBoard />
    </group>
  );
}
