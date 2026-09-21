export interface LeaderboardUser {
  _id: string;
  name?: string;
  email: string;
  portfolio: number;
  profit: number;
  returnRate: number;
  trades: number;
}

export interface SimulationInfo {
  id: string;
  name: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'ENDED';
  participants: number;
  market: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
}
