import { useMemo } from 'react';
import { useGameStore } from '../game/store/useGameStore';

export function useProfileStats() {
  const bestScores = useGameStore((state) => state.bestScores);
  const recentRuns = useGameStore((state) => state.recentRuns);

  const stats = useMemo(() => {
    const totalRuns = recentRuns.length;
    const averageScore = totalRuns
      ? Math.round(recentRuns.reduce((sum, run) => sum + run.score, 0) / totalRuns)
      : 0;
    return {
      bestScores,
      recentRuns,
      averageScore,
      totalRuns,
    };
  }, [bestScores, recentRuns]);

  return stats;
}
