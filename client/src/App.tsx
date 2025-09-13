import { useEffect, useState } from "react";
import "@fontsource/inter";
import DiceGame from "./components/DiceGame";
import { useAudio } from "./lib/stores/useAudio";

// Main App component
function App() {
  const [gameReady, setGameReady] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Initialize audio when component mounts
  useEffect(() => {
    // Load background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    // Load sound effects
    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.5;
    setHitSound(hitAudio);

    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.7;
    setSuccessSound(successAudio);

    setGameReady(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {gameReady && <DiceGame />}
    </div>
  );
}

export default App;
