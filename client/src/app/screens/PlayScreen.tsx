import { useMemo, useState } from 'react';
import styles from './PlayScreen.module.css';
import { GameCanvas } from '../../features/game/components/GameCanvas';
import { ScoreBadge } from '../../components/ScoreBadge/ScoreBadge';
import { Tabs } from '../../components/Tabs/Tabs';
import { ToggleSwitch } from '../../components/ToggleSwitch/ToggleSwitch';
import { Button } from '../../components/Button/Button';
import { getTelegramUser, shareScore } from '../../services/telegram';
import { useGameStore, type GameMode, type ShotResult } from '../../features/game/store/useGameStore';

const modeOptions = [
  { value: 'timed' as GameMode, label: '60 секунд' },
  { value: 'shots' as GameMode, label: '5 мячей' },
];

function formatTime(value: number) {
  const clamped = Math.max(0, value);
  const minutes = Math.floor(clamped / 60);
  const seconds = Math.floor(clamped % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatModeTag(mode: GameMode) {
  return mode === 'timed' ? '60 сек' : '5 мячей';
}

export function PlayScreen() {
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);
  const score = useGameStore((state) => state.score);
  const combo = useGameStore((state) => state.combo);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const shotsLeft = useGameStore((state) => state.shotsLeft);
  const isRunning = useGameStore((state) => state.isRunning);
  const startGame = useGameStore((state) => state.startGame);
  const endGame = useGameStore((state) => state.endGame);
  const registerShot = useGameStore((state) => state.registerShot);
  const bestScores = useGameStore((state) => state.bestScores);
  const recentRuns = useGameStore((state) => state.recentRuns);
  const isSoundEnabled = useGameStore((state) => state.isSoundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);

  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const bestForMode = bestScores[mode];
  const bestOverall = Math.max(bestScores.timed, bestScores.shots);
  const lastRun = useMemo(() => (recentRuns.length > 0 ? recentRuns[0] : null), [recentRuns]);

  const handleShot = (result: ShotResult) => {
    registerShot(result);
  };

  const handleModeChange = (nextMode: GameMode) => {
    setMode(nextMode);
  };

  const handleStart = () => {
    startGame(mode);
    setShareMessage(null);
  };

  const handleShare = async () => {
    if (bestOverall <= 0) {
      setShareMessage('Сначала побей рекорд!');
      return;
    }
    const user = getTelegramUser();
    const username = user?.username || `${user?.first_name ?? 'Media'} ${user?.last_name ?? 'Basket'}`;
    const shared = await shareScore({ score: bestOverall, username });
    setShareMessage(shared ? 'Результат отправлен в Telegram.' : 'Ссылка на шаринг открыта.');
  };

  const recordsPreview = recentRuns.slice(0, 5);

  return (
    <div className={styles.screen}>
      <section className={styles.controls}>
        <div className={styles.modeRow}>
          <Tabs value={mode} options={modeOptions} onChange={handleModeChange} />
          <ToggleSwitch
            label={isSoundEnabled ? 'Звук включен' : 'Звук выключен'}
            checked={isSoundEnabled}
            onChange={() => toggleSound()}
          />
        </div>
        <div className={styles.badges}>
          <ScoreBadge label="Счёт" value={score} />
          <ScoreBadge
            label={mode === 'timed' ? 'Осталось' : 'Мячи'}
            value={mode === 'timed' ? formatTime(timeLeft) : shotsLeft ?? '∞'}
          />
          <ScoreBadge label="Комбо" value={`x${Math.max(1, combo)}`} />
          <ScoreBadge label="Рекорд" value={bestForMode} />
        </div>
      </section>

      <section className={styles.canvasArea}>
        <GameCanvas onShot={handleShot} className={styles.canvasElement} />
        {!isRunning && (
          <div className={styles.overlay}>
            <div className={styles.overlayTitle}>
              {lastRun ? `Серия: ${lastRun.score}` : 'Готов к броску'}
            </div>
            <div className={styles.overlaySubtitle}>
              {lastRun
                ? `Лучший результат — ${bestOverall}. Попробуй улучшить!`
                : 'Смахни зелёный мяч вверх, рассчитай траекторию и попади в кольцо.'}
            </div>
            <Button onClick={handleStart} size="lg">
              {lastRun ? 'Повторить' : 'Стартовать'}
            </Button>
          </div>
        )}
      </section>

      <section className={styles.actions}>
        {isRunning ? (
          <Button variant="outline" onClick={endGame}>
            Завершить серию
          </Button>
        ) : null}
        <Button variant="ghost" onClick={handleShare}>
          Поделиться рекордом
        </Button>
        {shareMessage ? <span className={styles.overlaySubtitle}>{shareMessage}</span> : null}
      </section>

      <section className={styles.records}>
        <div className={styles.recordsHeader}>
          <span className={styles.recordsTitle}>Локальные рекорды</span>
          <span className={styles.modeTag}>{formatModeTag(mode)}</span>
        </div>
        <ul className={styles.recordsList}>
          {recordsPreview.length === 0 && <li className={styles.overlaySubtitle}>Сыграй первую серию.</li>}
          {recordsPreview.map((run) => (
            <li key={run.id} className={styles.recordItem}>
              <span className={styles.recordScore}>{run.score} очков</span>
              <span>
                {formatModeTag(run.mode)} •{' '}
                {new Date(run.timestamp).toLocaleString('ru-RU', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
