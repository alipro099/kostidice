import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomeScreen.module.css';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { ScoreBadge } from '../../components/ScoreBadge/ScoreBadge';
import { useGameStore } from '../../features/game/store/useGameStore';
import { getMockMissions } from '../../features/missions/data';

export function HomeScreen() {
  const navigate = useNavigate();
  const bestScores = useGameStore((state) => state.bestScores);
  const recentRuns = useGameStore((state) => state.recentRuns);
  const totalBest = Math.max(bestScores.timed, bestScores.shots);

  const nextMission = useMemo(() => getMockMissions()[0], []);
  const lastRun = useMemo(() => (recentRuns.length > 0 ? recentRuns[0] : null), [recentRuns]);

  return (
    <div className={styles.screen}>
      <div className={styles.grid}>
        <Card title="Play" subtitle="Flick Shot" accent="GO" onClick={() => navigate('/play')}>
          <ScoreBadge label="Лучший" value={`${totalBest} очков`} />
          {lastRun ? (
            <span className={styles.tag}>
              Последняя серия — {lastRun.score} •{' '}
              {new Date(lastRun.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className={styles.tag}>Свайпни мяч и попади в кольцо</span>
          )}
          <div className={styles.cardActions}>
            <Button onClick={() => navigate('/play')}>Играть</Button>
          </div>
        </Card>

        <Card title="Missions" subtitle="Ежедневные испытания" accent="XP" onClick={() => navigate('/missions')}>
          <span className={styles.tag}>Следующая цель</span>
          <strong>{nextMission?.title ?? 'Появятся скоро'}</strong>
          <div className={styles.cardActions}>
            <Button variant="outline" onClick={() => navigate('/missions')}>
              К миссиям
            </Button>
          </div>
        </Card>

        <Card title="Profile" subtitle="Очки и рекорды" accent="YOU" onClick={() => navigate('/profile')}>
          <span className={styles.tag}>Твои рекорды</span>
          <div className={styles.cardActions}>
            <Button variant="outline" onClick={() => navigate('/profile')}>
              Открыть профиль
            </Button>
          </div>
        </Card>
      </div>
      <div className={styles.miniWave} />
    </div>
  );
}
