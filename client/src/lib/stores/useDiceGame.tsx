import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "waiting" | "betting" | "rolling" | "result";
export type Prediction = "higher" | "lower" | null;

interface DiceGameState {
  gameState: GameState;
  currentRoll: number[];
  previousRoll: number[];
  prediction: Prediction;
  isRolling: boolean;
  wins: number;
  losses: number;
  totalGames: number;
  
  // Actions
  rollDice: () => void;
  placeBet: (prediction: Prediction) => void;
  resetGame: () => void;
  getCurrentTotal: () => number;
  getPreviousTotal: () => number;
}

export const useDiceGame = create<DiceGameState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "waiting",
    currentRoll: [],
    previousRoll: [],
    prediction: null,
    isRolling: false,
    wins: 0,
    losses: 0,
    totalGames: 0,
    
    rollDice: () => {
      const state = get();
      
      set({ 
        isRolling: true, 
        gameState: "rolling",
        currentRoll: [] 
      });
      
      // Simulate dice rolling duration
      setTimeout(() => {
        const newRoll = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ];
        
        const currentTotal = newRoll.reduce((sum, die) => sum + die, 0);
        const previousTotal = state.previousRoll.reduce((sum, die) => sum + die, 0);
        
        let newWins = state.wins;
        let newLosses = state.losses;
        let newTotalGames = state.totalGames;
        
        // Calculate result if there was a prediction and previous roll
        if (state.prediction && state.previousRoll.length > 0) {
          newTotalGames++;
          
          const wasCorrect = 
            (state.prediction === "higher" && currentTotal > previousTotal) ||
            (state.prediction === "lower" && currentTotal < previousTotal);
          
          if (wasCorrect) {
            newWins++;
          } else if (currentTotal !== previousTotal) {
            // Don't count ties as losses
            newLosses++;
          }
        }
        
        set({
          currentRoll: newRoll,
          isRolling: false,
          gameState: "result",
          wins: newWins,
          losses: newLosses,
          totalGames: newTotalGames,
        });
        
        // Auto-transition to waiting state after showing result
        setTimeout(() => {
          set({
            gameState: "waiting",
            previousRoll: newRoll,
            currentRoll: [],
            prediction: null,
          });
        }, 3000);
        
      }, 2500); // Allow time for dice animation
    },
    
    placeBet: (prediction: Prediction) => {
      set({ 
        prediction, 
        gameState: "betting" 
      });
    },
    
    resetGame: () => {
      set({
        gameState: "waiting",
        currentRoll: [],
        previousRoll: [],
        prediction: null,
        isRolling: false,
        wins: 0,
        losses: 0,
        totalGames: 0,
      });
    },
    
    getCurrentTotal: () => {
      const { currentRoll } = get();
      return currentRoll.reduce((sum, die) => sum + die, 0);
    },
    
    getPreviousTotal: () => {
      const { previousRoll } = get();
      return previousRoll.reduce((sum, die) => sum + die, 0);
    },
  }))
);
