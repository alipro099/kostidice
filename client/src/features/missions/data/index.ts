import rawMissions from './missions.json';

export interface Mission {
  id: string;
  title: string;
  goal: number;
  reward: number;
  progress?: number;
  claimed?: boolean;
}

export function getMockMissions(): Mission[] {
  return rawMissions.map((mission, index) => ({
    ...mission,
    progress: index === 0 ? 1 : 0,
    claimed: false,
  }));
}
