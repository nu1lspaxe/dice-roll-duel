import { useDiceGame } from "../lib/stores/useDiceGame.tsx";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Volume2, VolumeX } from "lucide-react";
import BettingOptions from "./BettingOptions.tsx";

export default function GameUI() {
  const { 
    gameState, 
    currentRoll, 
    previousRoll, 
    prediction,
    betType,
    exactBet,
    rangeBet,
    currentBet,
    currentMultiplier,
    isRolling,
    rollDice,
    resetGame,
    getCurrentTotal,
    getPreviousTotal,
    checkBetResult
  } = useDiceGame();
  
  const { isMuted, toggleMute } = useAudio();

  const currentTotal = getCurrentTotal();
  const previousTotal = getPreviousTotal();

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
        {/* Game Title */}
        <Card className="bg-black/80 border-white/20 text-white min-w-[400px]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">骰子比大小</CardTitle>
            <p className="text-gray-300">預測下一局點數與上一局的大小關係</p>
          </CardHeader>
        </Card>

        {/* Score Display */}
        <Card className="bg-black/80 border-white/20 text-white min-w-[400px]">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">上一局點數</p>
                <p className="text-2xl font-bold text-blue-400">
                  {previousTotal > 0 ? previousTotal : "--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">當前局點數</p>
                <p className="text-2xl font-bold text-green-400">
                  {currentTotal > 0 ? currentTotal : "--"}
                </p>
              </div>
            </div>

            {/* Result display */}
            {gameState === "result" && currentTotal > 0 && (
              <div className="mt-4 text-center">
                {betType === "comparison" && previousTotal > 0 && (
                  <p className="text-lg">
                    {currentTotal > previousTotal && "當前局 > 上一局"}
                    {currentTotal < previousTotal && "當前局 < 上一局"}
                    {currentTotal === previousTotal && "當前局 = 上一局"}
                  </p>
                )}
                {betType === "exact" && exactBet && (
                  <p className="text-lg">
                    預測點數: {exactBet.value} | 實際點數: {currentTotal}
                  </p>
                )}
                {betType === "range" && rangeBet && (
                  <p className="text-lg">
                    預測範圍: {rangeBet.min}-{rangeBet.max} | 實際點數: {currentTotal}
                  </p>
                )}
                {prediction && (
                  <p className="text-xl font-bold mt-2">
                    {checkBetResult() ? (
                      <span className="text-green-400">✓ 預測正確！獲得 {currentBet * currentMultiplier} 積分</span>
                    ) : (
                      <span className="text-red-400">✗ 預測錯誤！失去 {currentBet} 積分</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Betting Options */}
        {gameState === "waiting" && (
          <BettingOptions />
        )}

        {/* Roll Dice Button */}
        {(gameState === "waiting" && previousTotal === 0) || 
         (gameState === "betting" && prediction) ? (
          <Button 
            onClick={rollDice}
            disabled={isRolling}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {isRolling ? "擲骰子中..." : "擲骰子"}
          </Button>
        ) : null}

        {/* Next Round Button */}
        {gameState === "result" && (
          <div className="flex gap-4">
            <Button 
              onClick={() => rollDice()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              下一局
            </Button>
            <Button 
              onClick={resetGame}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              重新開始
            </Button>
          </div>
        )}

        {/* Audio Toggle */}
        <Button
          onClick={toggleMute}
          variant="outline"
          size="icon"
          className="border-white/20 text-white hover:bg-white/10"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
    </div>
  );
}
