import { useDiceGame } from "../lib/stores/useDiceGame.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function ScoreBoard() {
  const { wins, losses, totalGames, credits } = useDiceGame();
  
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";

  return (
    <Card className="bg-black/80 border-white/20 text-white w-64">
        <CardHeader>
          <CardTitle className="text-lg text-center">戰績統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between border-b border-white/20 pb-2 mb-2">
              <span className="text-gray-400">積分餘額：</span>
              <span className="text-yellow-400 font-bold text-lg">{credits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">勝利：</span>
              <span className="text-green-400 font-bold">{wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">失敗：</span>
              <span className="text-red-400 font-bold">{losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">總場次：</span>
              <span className="text-blue-400 font-bold">{totalGames}</span>
            </div>
            <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
              <span className="text-gray-400">勝率：</span>
              <span className="text-purple-400 font-bold">{winRate}%</span>
            </div>
          </div>
        </CardContent>
    </Card>
  );
}
