import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DiceProps {
  position: [number, number, number];
  value: number;
  isRolling: boolean;
  rollDelay?: number;
}

export default function Dice({ position, value, isRolling, rollDelay = 0 }: DiceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rollStartTime, setRollStartTime] = useState<number | null>(null);
  const [isDelayedRolling, setIsDelayedRolling] = useState(false);

  // Dice face rotations for each number (1-6)
  const faceRotations = {
    1: [0, 0, 0],
    2: [0, 0, Math.PI / 2],
    3: [0, Math.PI / 2, 0],
    4: [0, -Math.PI / 2, 0],
    5: [0, 0, -Math.PI / 2],
    6: [Math.PI, 0, 0],
  };

  useEffect(() => {
    if (isRolling) {
      setTimeout(() => {
        setIsDelayedRolling(true);
        setRollStartTime(Date.now());
      }, rollDelay * 1000);
    } else {
      setIsDelayedRolling(false);
      setRollStartTime(null);
    }
  }, [isRolling, rollDelay]);

  useFrame(() => {
    if (!meshRef.current) return;

    if (isDelayedRolling && rollStartTime) {
      // Rolling animation - random rotations
      const elapsed = Date.now() - rollStartTime;
      const rollDuration = 2000; // 2 seconds

      if (elapsed < rollDuration) {
        meshRef.current.rotation.x += 0.3;
        meshRef.current.rotation.y += 0.2;
        meshRef.current.rotation.z += 0.1;
        meshRef.current.position.y = position[1] + Math.sin(elapsed * 0.01) * 0.5;
      } else {
        // Animation finished, show final value
        const targetRotation = faceRotations[value as keyof typeof faceRotations];
        meshRef.current.rotation.set(
          targetRotation[0],
          targetRotation[1],
          targetRotation[2]
        );
        meshRef.current.position.y = position[1];
        setIsDelayedRolling(false);
      }
    } else if (!isRolling) {
      // Set to final position and rotation
      const targetRotation = faceRotations[value as keyof typeof faceRotations];
      meshRef.current.rotation.set(
        targetRotation[0],
        targetRotation[1],
        targetRotation[2]
      );
      meshRef.current.position.set(position[0], position[1], position[2]);
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      castShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" />
      
      {/* Dice dots */}
      {[1, 2, 3, 4, 5, 6].map((face) => (
        <DiceFace key={face} faceNumber={face} />
      ))}
    </mesh>
  );
}

// Component to render dots on dice faces
function DiceFace({ faceNumber }: { faceNumber: number }) {
  const dotPositions: { [key: number]: [number, number][] } = {
    1: [[0, 0]],
    2: [[-0.25, 0.25], [0.25, -0.25]],
    3: [[-0.25, 0.25], [0, 0], [0.25, -0.25]],
    4: [[-0.25, 0.25], [0.25, 0.25], [-0.25, -0.25], [0.25, -0.25]],
    5: [[-0.25, 0.25], [0.25, 0.25], [0, 0], [-0.25, -0.25], [0.25, -0.25]],
    6: [[-0.25, 0.25], [0.25, 0.25], [-0.25, 0], [0.25, 0], [-0.25, -0.25], [0.25, -0.25]],
  };

  const facePositions = [
    [0, 0, 0.51], // front
    [0, 0, -0.51], // back
    [0.51, 0, 0], // right
    [-0.51, 0, 0], // left
    [0, 0.51, 0], // top
    [0, -0.51, 0], // bottom
  ];

  const faceRotations = [
    [0, 0, 0], // front
    [0, Math.PI, 0], // back
    [0, Math.PI / 2, 0], // right
    [0, -Math.PI / 2, 0], // left
    [-Math.PI / 2, 0, 0], // top
    [Math.PI / 2, 0, 0], // bottom
  ];

  return (
    <group 
      position={facePositions[faceNumber - 1] as [number, number, number]}
      rotation={faceRotations[faceNumber - 1] as [number, number, number]}
    >
      {dotPositions[faceNumber].map((dotPos, index) => (
        <mesh key={index} position={[dotPos[0], dotPos[1], 0.01]}>
          <circleGeometry args={[0.08, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  );
}
