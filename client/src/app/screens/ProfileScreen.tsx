import styles from './ProfileScreen.module.css';
import { Button } from '../../components/Button/Button';
import { ScoreBadge } from '../../components/ScoreBadge/ScoreBadge';
import { getTelegramUser } from '../../services/telegram';
import { useGameStore } from '../../features/game/store/useGameStore';
import { useProfileStats } from '../../features/profile/useProfileStats';

function getInitials(name?: string, lastName?: string) {
  const first = name?.[0] ?? 'M';
  const last = lastName?.[0] ?? 'B';
  return `${first}${last}`.toUpperCase();
}

export function ProfileScreen() {
  const user = getTelegramUser();
  const { bestScores, recentRuns, averageScore } = useProfileStats();
  const resetRecords = useGameStore((state) => state.resetRecords);

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <div className={styles.avatar}>{getInitials(user?.first_name, user?.last_name)}</div>
        <div>
          <div className={styles.name}>{user?.first_name ?? 'Media'} {user?.last_name ?? 'Basket'}</div>
          <div className={styles.username}>@{user?.username ?? 'guest'}</div>
        </div>
      </div>

      <div className={styles.records}>
        <ScoreBadge label="60 сек" value={bestScores.timed} />
        <ScoreBadge label="5 мячей" value={bestScores.shots} />
        <ScoreBadge label="Средний" value={averageScore} />
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={() => resetRecords()}>
          Сбросить локальные данные
        </Button>
      </div>

      <div className={styles.recent}>
        <strong>Последние результаты</strong>
        {recentRuns.length === 0 && <span className={styles.username}>Ещё нет сыгранных сессий.</span>}
        {recentRuns.slice(0, 6).map((run) => (
          <div key={run.id} className={styles.recentItem}>
            <span className={styles.recentScore}>{run.score} очков</span>
            <span>
              {run.mode === 'timed' ? '60 сек' : '5 мячей'} •{' '}
              {new Date(run.timestamp).toLocaleDateString('ru-RU', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
