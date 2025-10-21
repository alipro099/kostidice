import { PropsWithChildren, useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import styles from './App.module.css';
import { HomeScreen } from './screens/HomeScreen';
import { PlayScreen } from './screens/PlayScreen';
import { MissionsScreen } from './screens/MissionsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { applyTelegramTheme, getTelegram, initTelegram } from '../services/telegram';

function TelegramBridge({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const tg = initTelegram();
    if (!tg) {
      return;
    }

    applyTelegramTheme(tg);

    const handleBack = () => {
      navigate('/', { replace: true });
    };

    tg.onEvent('backButtonClicked', handleBack);

    return () => {
      tg.offEvent('backButtonClicked', handleBack);
    };
  }, [navigate]);

  useEffect(() => {
    const tg = getTelegram();
    if (!tg) {
      return;
    }

    applyTelegramTheme(tg);

    if (location.pathname === '/' || location.pathname === '') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }
  }, [location.pathname]);

  return <>{children}</>;
}

function Shell() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <span className={styles.headerLabel}>2k25 • Осень • сезон 6</span>
        <div className={styles.headerSeason}>
          <span>2K</span>
          <span className={styles.headerSeasonStrong}>25</span>
        </div>
        <div className={styles.headerWave} aria-hidden="true" />
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/play" element={<PlayScreen />} />
          <Route path="/missions" element={<MissionsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <TelegramBridge>
        <Shell />
      </TelegramBridge>
    </HashRouter>
  );
}
