import { useEffect, useState } from 'react';
import styles from './MissionsScreen.module.css';
import { MissionsList } from '../../features/missions/components/MissionsList';
import { Mission } from '../../features/missions/data';
import { claimMission, fetchMissions } from '../../services/mockApi';

export function MissionsScreen() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissions()
      .then((data) => setMissions(data))
      .finally(() => setLoading(false));
  }, []);

  const handleClaim = (mission: Mission) => {
    if (mission.claimed) {
      return;
    }
    claimMission(mission).then(() => {
      setMissions((prev) =>
        prev.map((item) =>
          item.id === mission.id
            ? {
                ...item,
                claimed: true,
              }
            : item,
        ),
      );
      setBalance((value) => value + mission.reward);
    });
  };

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div>
          <h2>Миссии</h2>
          <p className={styles.note}>Заверши испытания, чтобы заработать очки сезона.</p>
        </div>
        <div className={styles.balance}>{balance} pts</div>
      </div>
      {loading ? <p className={styles.note}>Загружаем миссии...</p> : <MissionsList missions={missions} onClaim={handleClaim} />}
    </div>
  );
}
