import { missions, store } from './store.js';
import { userService } from './user.js';

const list = (userId) => {
  store.ensureUser(userId);
  const completed = store.progress.get(userId) || new Set();
  return missions.map((mission) => ({
    ...mission,
    completed: completed.has(mission.id),
  }));
};

const complete = (userId, missionId) => {
  store.ensureUser(userId);
  const catalogEntry = missions.find((mission) => mission.id === missionId);
  if (!catalogEntry) {
    return { success: false, message: 'Mission not found', coins: userService.getProfile(userId).coins };
  }

  const completed = store.progress.get(userId) || new Set();
  if (completed.has(missionId)) {
    return { success: true, message: 'Mission already completed', coins: userService.getProfile(userId).coins };
  }

  completed.add(missionId);
  store.progress.set(userId, completed);
  const profile = userService.addCoins(userId, catalogEntry.rewardCoins);
  return { success: true, message: 'Mission completed', coins: profile.coins };
};

export const missionService = {
  list,
  complete,
};
