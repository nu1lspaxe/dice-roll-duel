import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DicePhysicsProps {
  isRolling: boolean;
  finalValue: number;
  position: [number, number, number];
  onRollComplete?: () => void;
}

export function useDicePhysics({ 
  isRolling, 
  finalValue, 
  position, 
  onRollComplete 
}: DicePhysicsProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const angularVelocityRef = useRef(new THREE.Vector3());
  const startTimeRef = useRef<number>(0);
  const rollDuration = 2000; // 2 seconds
  
  // Dice face orientations for values 1-6
  const faceOrientations = {
    1: { x: 0, y: 0, z: 0 },
    2: { x: 0, y: 0, z: Math.PI / 2 },
    3: { x: 0, y: Math.PI / 2, z: 0 },
    4: { x: 0, y: -Math.PI / 2, z: 0 },
    5: { x: 0, y: 0, z: -Math.PI / 2 },
    6: { x: Math.PI, y: 0, z: 0 },
  };

  useEffect(() => {
    if (isRolling && meshRef.current) {
      startTimeRef.current = Date.now();
      
      // Initialize random velocities
      velocityRef.current.set(
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.01 + 0.01,
        (Math.random() - 0.5) * 0.02
      );
      
      angularVelocityRef.current.set(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
    }
  }, [isRolling]);

  useFrame(() => {
    if (!meshRef.current || !isRolling) return;

    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / rollDuration, 1);

    if (progress < 1) {
      // Apply physics during rolling
      const mesh = meshRef.current;
      
      // Update position with velocity
      mesh.position.add(velocityRef.current);
      
      // Apply gravity
      velocityRef.current.y -= 0.0008;
      
      // Bounce off ground
      if (mesh.position.y < position[1]) {
        mesh.position.y = position[1];
        velocityRef.current.y = Math.abs(velocityRef.current.y) * 0.6;
      }
      
      // Apply angular velocity
      mesh.rotation.x += angularVelocityRef.current.x;
      mesh.rotation.y += angularVelocityRef.current.y;
      mesh.rotation.z += angularVelocityRef.current.z;
      
      // Damping
      velocityRef.current.multiplyScalar(0.98);
      angularVelocityRef.current.multiplyScalar(0.95);
      
    } else {
      // Animation complete - snap to final position and orientation
      const mesh = meshRef.current;
      const targetOrientation = faceOrientations[finalValue as keyof typeof faceOrientations];
      
      mesh.position.set(position[0], position[1], position[2]);
      mesh.rotation.set(targetOrientation.x, targetOrientation.y, targetOrientation.z);
      
      if (onRollComplete) {
        onRollComplete();
      }
    }
  });

  return meshRef;
}
