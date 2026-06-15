export interface TransportFootprint {
  carKmPerWeek: number;
  carType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'none';
  flightHoursPerYear: number;
  publicTransitKmPerWeek: number;
}

export interface EnergyFootprint {
  electricityKwhPerMonth: number;
  heatingFuel: 'gas' | 'oil' | 'electricity' | 'wood' | 'none';
  heatingKwhPerMonth: number;
  renewableEnergyPercent: number; // 0 to 100
}

export interface DietFootprint {
  dietType: 'meat-heavy' | 'balanced' | 'low-meat' | 'vegetarian' | 'vegan';
  localFoodPercent: number; // 0 to 100
  foodWaste: 'low' | 'average' | 'high';
}

export interface ConsumptionFootprint {
  shoppingHabits: 'minimalist' | 'average' | 'frequent';
  recyclePercent: number; // 0 to 100
  compost: boolean;
}

export interface FootprintCalculation {
  transport: TransportFootprint;
  energy: EnergyFootprint;
  diet: DietFootprint;
  consumption: ConsumptionFootprint;
  calculatedAt: string;
  totalAnnualCo2Kg: number;
  breakdown: {
    transport: number;
    energy: number;
    diet: number;
    consumption: number;
  };
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  actionId: string;
  actionTitle: string;
  savedCo2Kg: number;
  pointsEarned: number;
  category: 'transport' | 'energy' | 'diet' | 'consumption';
  notes?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'diet' | 'consumption';
  points: number;
  savedCo2ExpectedKg: number;
  daysRequired: number;
  daysProgress: number;
  completed: boolean;
  completedAt: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt: string | null;
  requirementType: 'xp' | 'logCount' | 'challengeCount' | 'offset';
  requirementValue: number;
}

export interface UserState {
  footprint: FootprintCalculation | null;
  totalPoints: number;
  level: number;
  xpInLevel: number;
  xpNeededForNextLevel: number;
  logs: DailyLog[];
  challenges: Challenge[];
  achievements: Achievement[];
  co2OffsetKg: number; // For donations or offset projects
}
