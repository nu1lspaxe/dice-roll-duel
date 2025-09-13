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
  credits: number;
  currentBet: number;
  currentMultiplier: number;
  
  // Actions
  rollDice: () => void;
  placeBet: (prediction: Prediction, betType?: BetType, betValue?: ExactBet | RangeBet, betAmount?: number) => void;
  resetGame: () => void;
  getCurrentTotal: () => number;
  getPreviousTotal: () => number;
  checkBetResult: () => boolean | null;
  getMultiplier: () => number;
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
    credits: 1000, // Starting credits
    currentBet: 10, // Default bet amount
    currentMultiplier: 2,
    
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
        let newCredits = state.credits;
        
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
            newCredits += state.currentBet * state.currentMultiplier;
          } else {
            newLosses++;
            newCredits -= state.currentBet;
          }
        }
        
        set({
          currentRoll: newRoll,
          isRolling: false,
          gameState: "result",
          wins: newWins,
          losses: newLosses,
          totalGames: newTotalGames,
          credits: newCredits,
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
    
    placeBet: (prediction: Prediction, betType: BetType = "comparison", betValue?: ExactBet | RangeBet, betAmount: number = 10) => {
      const state = get();
      
      // Calculate multiplier based on bet type
      let multiplier = 2; // Default for comparison
      
      if (betType === "exact" && betValue) {
        const exactBet = betValue as ExactBet;
        const value = exactBet.value;
        // Higher payout for harder to hit numbers
        if (value === 10 || value === 11) multiplier = 8;
        else if (value === 9 || value === 12) multiplier = 9;
        else if (value === 8 || value === 13) multiplier = 10;
        else if (value === 7 || value === 14) multiplier = 12;
        else if (value === 6 || value === 15) multiplier = 14;
        else if (value === 5 || value === 16) multiplier = 18;
        else if (value === 4 || value === 17) multiplier = 24;
        else multiplier = 36; // 3 or 18
      } else if (betType === "range" && betValue) {
        const rangeBet = betValue as RangeBet;
        const rangeSize = rangeBet.max - rangeBet.min + 1;
        multiplier = Math.max(2, Math.round(16 / rangeSize));
      }
      
      const updates: any = { 
        prediction, 
        betType,
        gameState: "betting",
        currentBet: betAmount,
        currentMultiplier: multiplier
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
        credits: 1000,
        currentBet: 10,
        currentMultiplier: 2,
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
    
    getMultiplier: () => {
      const state = get();
      return state.currentMultiplier;
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
