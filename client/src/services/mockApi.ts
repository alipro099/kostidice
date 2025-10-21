import { getMockMissions, Mission } from '../features/missions/data';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMissions(): Promise<Mission[]> {
  await delay(320);
  return getMockMissions();
}

export async function claimMission(mission: Mission): Promise<{ success: boolean }> {
  await delay(180);
  return { success: true };
}
