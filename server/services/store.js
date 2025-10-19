const defaultLineup = [
  {
    id: 'ace-guard',
    name: 'Mitya "Ace" Sokolov',
    position: 'PG',
    team: 'T-SQUAD',
    avgScore: 42,
  },
  {
    id: 'tower-center',
    name: 'Rico "Tower" Mendes',
    position: 'C',
    team: 'LitEnergy',
    avgScore: 37,
  },
];

const weeklyLeaderboard = [
  { user: 'HoopQueen', points: 268 },
  { user: 'StreetFox', points: 255 },
  { user: 'NeonSniper', points: 240 },
];

const missionCatalog = [
  {
    id: 'daily-follow-tsquad',
    type: 'daily',
    title: 'Подпишись на канал T-SQUAD',
    description: 'Вступи в канал команды и следи за трансляциями.',
    rewardCoins: 40,
  },
  {
    id: 'daily-prediction',
    type: 'daily',
    title: 'Сделай прогноз на матч',
    description: 'Выбери победителя ближайшего матча медийной лиги.',
    rewardCoins: 35,
  },
  {
    id: 'weekly-win-streak',
    type: 'weekly',
    title: 'Победи в 3 матчах подряд',
    description: 'Сыграй в турнире HoopVerse и покажи серию побед.',
    rewardCoins: 120,
  },
  {
    id: 'brand-litenergy',
    type: 'branded',
    title: 'LitEnergy Boost',
    description: 'Попробуй новый вкус LitEnergy X и поделись отзывом.',
    rewardCoins: 80,
  },
];

class Store {
  constructor() {
    this.users = new Map([
      [
        'demo-user',
        {
          id: 'demo-user',
          displayName: 'Hooper Demo',
          role: 'Игрок',
          initials: 'HD',
          level: 4,
          coins: 320,
        },
      ],
    ]);
    this.lineups = new Map();
    this.progress = new Map();
  }

  ensureUser(userId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        id: userId,
        displayName: 'Hooper',
        role: 'Игрок',
        initials: 'HV',
        level: 1,
        coins: 0,
      });
    }

    return this.users.get(userId);
  }
}

export const store = new Store();
export const fantasyDefaults = { defaultLineup, weeklyLeaderboard };
export const missions = missionCatalog;
