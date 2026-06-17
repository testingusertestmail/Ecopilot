import { describe, it, expect } from 'vitest';
import { UserState, DailyLog, Challenge, Achievement } from '../types';

// Game progress calculation helper clone matching the formula used in App.tsx
function computeLevelUp(pointsToAdd: number, startXp: number, startLevel: number, startNeededXp: number) {
  let currentXp = startXp + pointsToAdd;
  let currentLevel = startLevel;
  let neededXp = startNeededXp;
  let didLevelUp = false;

  while (currentXp >= neededXp) {
    currentXp -= neededXp;
    currentLevel += 1;
    neededXp = currentLevel * 250 + 50;
    didLevelUp = true;
  }

  return { currentLevel, currentXp, neededXp, didLevelUp };
}

describe('GameState progress and Gamification Engine', () => {
  it('should correctly calculate standard level XP increments without leveling up', () => {
    const result = computeLevelUp(50, 100, 1, 300);
    expect(result.currentLevel).toBe(1);
    expect(result.currentXp).toBe(150);
    expect(result.neededXp).toBe(300);
    expect(result.didLevelUp).toBe(false);
  });

  it('should correctly handle a standard single level up boundary', () => {
    const result = computeLevelUp(250, 100, 1, 300);
    expect(result.currentLevel).toBe(2);
    // 100 + 250 = 350. Level 1 needs 300 XP. 350 - 300 = 50 XP.
    expect(result.currentXp).toBe(50);
    // Level 2 neededXp = 2 * 250 + 50 = 550
    expect(result.neededXp).toBe(550);
    expect(result.didLevelUp).toBe(true);
  });

  it('should handle cascading multiple level ups from a large points injection', () => {
    // Start at Level 1, 0 XP, Level 1 needs 300 XP
    // Level 2 needs 550 XP
    // Level 3 needs 800 XP
    // total injection: 1000 XP
    const result = computeLevelUp(1000, 0, 1, 300);
    expect(result.currentLevel).toBe(3);
    // Level 1: consumes 300 -> 700 remaining
    // Level 2: consumes 550 -> 150 remaining
    expect(result.currentXp).toBe(150);
    expect(result.neededXp).toBe(800); // Level 3 needs 3 * 250 + 50 = 800 XP
    expect(result.didLevelUp).toBe(true);
  });

  it('should accurately test progress and unlock status rules for user achievements', () => {
    const mockAchievements: Achievement[] = [
      {
        id: 'ach_first_track',
        title: 'First Green Footprint',
        description: 'Log your very first carbon-saving action.',
        iconName: 'Footprints',
        unlocked: false,
        unlockedAt: null,
        requirementType: 'logCount',
        requirementValue: 1,
      },
      {
        id: 'ach_save_10kg',
        title: 'Co2 Mitigator',
        description: 'Achieve a cumulative saving of 10 kg of Carbon Dioxide (CO2).',
        iconName: 'Leaf',
        unlocked: false,
        unlockedAt: null,
        requirementType: 'offset',
        requirementValue: 10,
      }
    ];

    const logsCount = 1;
    const totalCarbonSaved = 12.5;

    const checkedAchievements = mockAchievements.map(ach => {
      let conditionMet = false;
      if (ach.requirementType === 'logCount' && logsCount >= ach.requirementValue) {
        conditionMet = true;
      } else if (ach.requirementType === 'offset' && totalCarbonSaved >= ach.requirementValue) {
        conditionMet = true;
      }
      if (conditionMet) {
        return {
          ...ach,
          unlocked: true,
          unlockedAt: '2026-06-17T07:44:03-07:00'
        };
      }
      return ach;
    });

    expect(checkedAchievements[0].unlocked).toBe(true);
    expect(checkedAchievements[1].unlocked).toBe(true);
  });
});
