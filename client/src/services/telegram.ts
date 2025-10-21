let cachedTelegram: TelegramWebApp | null = null;

export const MEDIA_BASKET_THEME = {
  background: '#0E0E0E',
  secondaryBackground: '#000000',
  accent: '#00E676',
};

const SHARE_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAFoEvQfAAAADUlEQVR42mP8/5+hHgAHggJ/PkEc1QAAAABJRU5ErkJggg==';

export function getTelegram(): TelegramWebApp | null {
  if (cachedTelegram) {
    return cachedTelegram;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  cachedTelegram = window.Telegram?.WebApp ?? null;
  return cachedTelegram;
}

export function initTelegram(): TelegramWebApp | null {
  const tg = getTelegram();
  if (!tg) {
    return null;
  }

  try {
    tg.ready();
  } catch (error) {
    console.warn('[telegram] ready failed', error);
  }

  tg.expand();
  applyTelegramTheme(tg);
  tg.disableVerticalSwipes?.();

  return tg;
}

export function applyTelegramTheme(tg: TelegramWebApp) {
  tg.setBackgroundColor(MEDIA_BASKET_THEME.background);
  tg.setSecondaryBackgroundColor?.(MEDIA_BASKET_THEME.secondaryBackground);
  tg.setHeaderColor(MEDIA_BASKET_THEME.secondaryBackground);
}

export function triggerHaptic(style: Parameters<TelegramHapticFeedback['impactOccurred']>[0] = 'light') {
  const tg = getTelegram();
  tg?.HapticFeedback?.impactOccurred(style);
}

export async function shareScore(payload: { score: number; username?: string }) {
  const tg = getTelegram();
  if (!tg) {
    return false;
  }

  const headline = `Мой рекорд в Media Basket Mini — ${payload.score}`;
  const caption = payload.username ? `${payload.username} бросает лучше всех!` : 'Проверяй свою меткость.';
  const sharePayload: TelegramShareStoryOptions = {
    media_url: SHARE_PLACEHOLDER,
    text: `${headline}\n${caption}`,
    background_color: MEDIA_BASKET_THEME.background,
  };

  if (typeof tg.shareToStory === 'function') {
    try {
      await tg.shareToStory(sharePayload);
      return true;
    } catch (error) {
      console.warn('[shareToStory] failed', error);
    }
  }

  const params = new URLSearchParams({
    text: `${headline}\n${caption}`,
  });

  tg.openTelegramLink?.(`https://t.me/share/url?${params.toString()}`);
  return false;
}

export function getTelegramUser() {
  const tg = getTelegram();
  const user = tg?.initDataUnsafe?.user;
  if (!user) {
    return {
      id: 'guest',
      username: 'guest',
      first_name: 'Media',
      last_name: 'Basket',
    };
  }
  return user;
}
