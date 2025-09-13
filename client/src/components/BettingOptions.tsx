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
    placeBet,
    getPreviousTotal
  } = useDiceGame();
  
  const [selectedTab, setSelectedTab] = useState<BetType>("comparison");
  const [exactValue, setExactValue] = useState<number>(10);
  const [rangeMin, setRangeMin] = useState<number>(8);
  const [rangeMax, setRangeMax] = useState<number>(12);
  
  const previousTotal = getPreviousTotal();
  
  if (gameState !== "waiting" || (selectedTab === "comparison" && previousTotal === 0)) {
    return null;
  }

  const handleComparisonBet = (prediction: "higher" | "lower") => {
    placeBet(prediction, "comparison");
  };

  const handleExactBet = () => {
    if (exactValue >= 3 && exactValue <= 18) {
      const bet: ExactBet = { value: exactValue };
      placeBet("exact", "exact", bet);
    }
  };

  const handleRangeBet = () => {
    if (rangeMin >= 3 && rangeMax <= 18 && rangeMin <= rangeMax) {
      const bet: RangeBet = { min: rangeMin, max: rangeMax };
      placeBet("range", "range", bet);
    }
  };

  // Calculate potential payouts
  const getExactPayout = (value: number) => {
    // Higher payout for harder to hit numbers
    const probability = value === 10 || value === 11 ? 0.125 : 
                       value === 9 || value === 12 ? 0.111 :
                       value === 8 || value === 13 ? 0.097 :
                       value === 7 || value === 14 ? 0.083 :
                       value === 6 || value === 15 ? 0.069 :
                       value === 5 || value === 16 ? 0.056 :
                       value === 4 || value === 17 ? 0.042 :
                       0.028; // 3 or 18
    return Math.round(1 / probability);
  };

  const getRangePayout = (min: number, max: number) => {
    const rangeSize = max - min + 1;
    const basePayout = Math.max(2, Math.round(16 / rangeSize));
    return basePayout;
  };

  return (
    <Card className="bg-black/80 border-white/20 text-white min-w-[400px]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">投注選項</CardTitle>
      </CardHeader>
      <CardContent>
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
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                比上局大 (&gt;{previousTotal})
                <span className="block text-xs">倍率: 2x</span>
              </Button>
              <Button 
                onClick={() => handleComparisonBet("lower")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                比上局小 (&lt;{previousTotal})
                <span className="block text-xs">倍率: 2x</span>
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
              disabled={exactValue < 3 || exactValue > 18}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              投注準確點數: {exactValue}
              <span className="block text-xs">倍率: {getExactPayout(exactValue)}x</span>
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
              disabled={rangeMin < 3 || rangeMax > 18 || rangeMin > rangeMax}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              投注範圍: {rangeMin}-{rangeMax}
              <span className="block text-xs">倍率: {getRangePayout(rangeMin, rangeMax)}x</span>
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}