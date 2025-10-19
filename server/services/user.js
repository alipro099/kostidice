import { store } from './store.js';

const getProfile = (userId) => {
  const user = store.ensureUser(userId);
  return {
    id: user.id,
    displayName: user.displayName,
    role: user.role,
    initials: user.initials,
    level: user.level,
    coins: user.coins,
  };
};

const addCoins = (userId, delta) => {
  const user = store.ensureUser(userId);
  user.coins += delta;
  if (user.coins < 0) user.coins = 0;
  return getProfile(userId);
};

export const userService = {
  getProfile,
  addCoins,
};
