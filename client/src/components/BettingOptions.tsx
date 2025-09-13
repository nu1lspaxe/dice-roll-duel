import { useState } from "react";
import { useDiceGame, BetType, ExactBet, RangeBet } from "../lib/stores/useDiceGame.tsx";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function BettingOptions() {
  const { 
    gameState, 
    previousRoll, 
    credits,
    currentBet,
    placeBet,
    getPreviousTotal
  } = useDiceGame();
  
  const [selectedTab, setSelectedTab] = useState<BetType>("comparison");
  const [exactValue, setExactValue] = useState<number>(10);
  const [rangeMin, setRangeMin] = useState<number>(8);
  const [rangeMax, setRangeMax] = useState<number>(12);
  const [betAmount, setBetAmount] = useState<number>(10);
  
  const previousTotal = getPreviousTotal();
  
  if (gameState !== "waiting" || (selectedTab === "comparison" && previousTotal === 0)) {
    return null;
  }

  const handleComparisonBet = (prediction: "higher" | "lower") => {
    if (credits >= betAmount) {
      placeBet(prediction, "comparison", undefined, betAmount);
    }
  };

  const handleExactBet = () => {
    if (exactValue >= 3 && exactValue <= 18 && credits >= betAmount) {
      const bet: ExactBet = { value: exactValue };
      placeBet("exact", "exact", bet, betAmount);
    }
  };

  const handleRangeBet = () => {
    if (rangeMin >= 3 && rangeMax <= 18 && rangeMin <= rangeMax && credits >= betAmount) {
      const bet: RangeBet = { min: rangeMin, max: rangeMax };
      placeBet("range", "range", bet, betAmount);
    }
  };

  // Calculate potential payouts
  const getExactPayout = (value: number) => {
    if (value === 10 || value === 11) return 8;
    else if (value === 9 || value === 12) return 9;
    else if (value === 8 || value === 13) return 10;
    else if (value === 7 || value === 14) return 12;
    else if (value === 6 || value === 15) return 14;
    else if (value === 5 || value === 16) return 18;
    else if (value === 4 || value === 17) return 24;
    else return 36; // 3 or 18
  };

  const getRangePayout = (min: number, max: number) => {
    const rangeSize = max - min + 1;
    return Math.max(2, Math.round(16 / rangeSize));
  };

  return (
    <Card className="bg-black/80 border-white/20 text-white min-w-[400px]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">投注選項</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Credits and Bet Amount Display */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-400">餘額</p>
            <p className="text-lg font-bold text-green-400">{credits} 積分</p>
          </div>
          <div className="text-center">
            <Label htmlFor="betAmount" className="text-white text-sm">投注金額</Label>
            <Input
              id="betAmount"
              type="number"
              min="1"
              max={credits}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.min(Number(e.target.value), credits))}
              className="bg-gray-700 border-gray-600 text-white text-center"
            />
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as BetType)}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="comparison" className="text-white data-[state=active]:bg-blue-600">
              比大小
            </TabsTrigger>
            <TabsTrigger value="exact" className="text-white data-[state=active]:bg-green-600">
              準確點數
            </TabsTrigger>
            <TabsTrigger value="range" className="text-white data-[state=active]:bg-purple-600">
              點數範圍
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison" className="space-y-4">
            <p className="text-center text-gray-300">
              預測下一局點數與上一局 ({previousTotal} 點) 的大小關係
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleComparisonBet("higher")}
                disabled={credits < betAmount}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                比上局大 (&gt;{previousTotal})
                <span className="block text-xs">倍率: 2x | 獲利: {betAmount * 2}</span>
              </Button>
              <Button 
                onClick={() => handleComparisonBet("lower")}
                disabled={credits < betAmount}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                比上局小 (&lt;{previousTotal})
                <span className="block text-xs">倍率: 2x | 獲利: {betAmount * 2}</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="exact" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exactValue" className="text-white">
                預測準確點數 (3-18):
              </Label>
              <Input
                id="exactValue"
                type="number"
                min="3"
                max="18"
                value={exactValue}
                onChange={(e) => setExactValue(Number(e.target.value))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <Button 
              onClick={handleExactBet}
              disabled={exactValue < 3 || exactValue > 18 || credits < betAmount}
              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              投注準確點數: {exactValue}
              <span className="block text-xs">倍率: {getExactPayout(exactValue)}x | 獲利: {betAmount * getExactPayout(exactValue)}</span>
            </Button>
          </TabsContent>
          
          <TabsContent value="range" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rangeMin" className="text-white">
                  最小值:
                </Label>
                <Input
                  id="rangeMin"
                  type="number"
                  min="3"
                  max="18"
                  value={rangeMin}
                  onChange={(e) => setRangeMin(Number(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rangeMax" className="text-white">
                  最大值:
                </Label>
                <Input
                  id="rangeMax"
                  type="number"
                  min="3"
                  max="18"
                  value={rangeMax}
                  onChange={(e) => setRangeMax(Number(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <Button 
              onClick={handleRangeBet}
              disabled={rangeMin < 3 || rangeMax > 18 || rangeMin > rangeMax || credits < betAmount}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              投注範圍: {rangeMin}-{rangeMax}
              <span className="block text-xs">倍率: {getRangePayout(rangeMin, rangeMax)}x | 獲利: {betAmount * getRangePayout(rangeMin, rangeMax)}</span>
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}