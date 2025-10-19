import { fantasyDefaults, store } from './store.js';
import { userService } from './user.js';

const availablePlayers = [
  ...fantasyDefaults.defaultLineup,
  {
    id: 'hv-legend',
    name: 'Legend HoopVerse',
    position: 'SF',
    team: 'Urban Waves',
    avgScore: 44,
  },
  {
    id: 'midrange-ghost',
    name: 'Ghost Ridley',
    position: 'SG',
    team: 'MidRange',
    avgScore: 39,
  },
];

const getLineup = (userId) => {
  if (!store.lineups.has(userId)) {
    store.lineups.set(userId, [...fantasyDefaults.defaultLineup]);
  }
  return store.lineups.get(userId);
};

const getSnapshot = (userId) => ({
  lineup: getLineup(userId),
  leaderboard: fantasyDefaults.weeklyLeaderboard,
  availablePlayers,
});

const addToLineup = (userId, playerId) => {
  const lineup = getLineup(userId);
  if (!lineup.some((player) => player.id === playerId)) {
    const player = availablePlayers.find((item) => item.id === playerId);
    if (player) {
      lineup.push(player);
      userService.addCoins(userId, 15);
    }
  }
  return { lineup };
};

export const fantasyService = {
  getSnapshot,
  addToLineup,
};
