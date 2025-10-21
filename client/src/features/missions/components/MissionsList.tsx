import { Mission } from '../data';
import styles from './MissionsList.module.css';
import { Button } from '../../../components/Button/Button';

interface MissionsListProps {
  missions: Mission[];
  onClaim: (mission: Mission) => void;
}

export function MissionsList({ missions, onClaim }: MissionsListProps) {
  return (
    <div className={styles.list}>
      {missions.map((mission) => {
        const progress = Math.min(mission.progress ?? 0, mission.goal);
        const completed = progress >= mission.goal;
        return (
          <div key={mission.id} className={styles.item}>
            <div className={styles.info}>
              <span className={styles.title}>{mission.title}</span>
              <span className={styles.meta}>
                Прогресс: {progress}/{mission.goal}
              </span>
              <span className={styles.reward}>+{mission.reward} очков</span>
            </div>
            <Button
              variant={completed && !mission.claimed ? 'primary' : 'outline'}
              disabled={!completed || mission.claimed}
              onClick={() => onClaim(mission)}
            >
              {mission.claimed ? 'Забрано' : completed ? 'Забрать' : 'В пути'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
