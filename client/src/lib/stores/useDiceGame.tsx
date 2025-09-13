import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "waiting" | "betting" | "rolling" | "result";
export type Prediction = "higher" | "lower" | "exact" | "range" | null;
export type BetType = "comparison" | "exact" | "range";
export interface RangeBet {
  min: number;
  max: number;
}
export interface ExactBet {
  value: number;
}

interface DiceGameState {
  gameState: GameState;
  currentRoll: number[];
  previousRoll: number[];
  prediction: Prediction;
  betType: BetType;
  exactBet: ExactBet | null;
  rangeBet: RangeBet | null;
  isRolling: boolean;
  wins: number;
  losses: number;
  totalGames: number;
  
  // Actions
  rollDice: () => void;
  placeBet: (prediction: Prediction, betType?: BetType, betValue?: ExactBet | RangeBet) => void;
  resetGame: () => void;
  getCurrentTotal: () => number;
  getPreviousTotal: () => number;
  checkBetResult: () => boolean | null;
}

export const useDiceGame = create<DiceGameState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "waiting",
    currentRoll: [],
    previousRoll: [],
    prediction: null,
    betType: "comparison",
    exactBet: null,
    rangeBet: null,
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
        
        // Calculate result if there was a prediction
        if (state.prediction) {
          newTotalGames++;
          
          let wasCorrect = false;
          
          if (state.betType === "comparison" && state.previousRoll.length > 0) {
            wasCorrect = 
              (state.prediction === "higher" && currentTotal > previousTotal) ||
              (state.prediction === "lower" && currentTotal < previousTotal);
          } else if (state.betType === "exact" && state.exactBet) {
            wasCorrect = currentTotal === state.exactBet.value;
          } else if (state.betType === "range" && state.rangeBet) {
            wasCorrect = currentTotal >= state.rangeBet.min && currentTotal <= state.rangeBet.max;
          }
          
          if (wasCorrect) {
            newWins++;
          } else {
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
            betType: "comparison",
            exactBet: null,
            rangeBet: null,
          });
        }, 3000);
        
      }, 2500); // Allow time for dice animation
    },
    
    placeBet: (prediction: Prediction, betType: BetType = "comparison", betValue?: ExactBet | RangeBet) => {
      const updates: any = { 
        prediction, 
        betType,
        gameState: "betting"
      };
      
      if (betType === "exact" && betValue) {
        updates.exactBet = betValue as ExactBet;
        updates.rangeBet = null;
      } else if (betType === "range" && betValue) {
        updates.rangeBet = betValue as RangeBet;
        updates.exactBet = null;
      } else {
        updates.exactBet = null;
        updates.rangeBet = null;
      }
      
      set(updates);
    },
    
    resetGame: () => {
      set({
        gameState: "waiting",
        currentRoll: [],
        previousRoll: [],
        prediction: null,
        betType: "comparison",
        exactBet: null,
        rangeBet: null,
        isRolling: false,
        wins: 0,
        losses: 0,
        totalGames: 0,
      });
    },
    
    checkBetResult: () => {
      const state = get();
      const currentTotal = state.currentRoll.reduce((sum, die) => sum + die, 0);
      const previousTotal = state.previousRoll.reduce((sum, die) => sum + die, 0);
      
      if (!state.prediction) return null;
      
      if (state.betType === "comparison" && state.previousRoll.length > 0) {
        if (state.prediction === "higher") return currentTotal > previousTotal;
        if (state.prediction === "lower") return currentTotal < previousTotal;
      } else if (state.betType === "exact" && state.exactBet) {
        return currentTotal === state.exactBet.value;
      } else if (state.betType === "range" && state.rangeBet) {
        return currentTotal >= state.rangeBet.min && currentTotal <= state.rangeBet.max;
      }
      
      return null;
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
