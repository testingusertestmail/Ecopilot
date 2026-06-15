import { describe, it, expect } from 'vitest';
import { calculateFootprint, CARBON_FACTORS } from './footprintConstants';

describe('Carbon Footprint Scientific Formula Engine', () => {
  it('should correctly fetch carbon coefficients', () => {
    expect(CARBON_FACTORS.car.gasoline).toBe(0.185);
    expect(CARBON_FACTORS.car.electric).toBe(0.035);
    expect(CARBON_FACTORS.publicTransit).toBe(0.045);
    expect(CARBON_FACTORS.electricityGrid).toBe(0.380);
    expect(CARBON_FACTORS.dietBase.vegan).toBe(650);
    expect(CARBON_FACTORS.dietBase['meat-heavy']).toBe(3100);
  });

  it('should calculate eco-friendly user footprint with minimum carbon factors', () => {
    const mockTransport = {
      carType: 'none' as const,
      carKmPerWeek: 0,
      publicTransitKmPerWeek: 0,
      flightHoursPerYear: 0,
    };

    const mockEnergy = {
      electricityKwhPerMonth: 0,
      heatingFuel: 'none' as const,
      heatingKwhPerMonth: 0,
      renewableEnergyPercent: 100, // 100% solar offset
    };

    const mockDiet = {
      dietType: 'vegan' as const,
      localFoodPercent: 100, // 10% discount
      foodWaste: 'low' as const, // 10% discount (multiplier 0.90)
    };

    const mockConsumption = {
      shoppingHabits: 'minimalist' as const,
      recyclePercent: 100, // 20% discount (multiplier 0.80)
      compost: true, // subtracts 150 kg
    };

    const result = calculateFootprint(mockTransport, mockEnergy, mockDiet, mockConsumption);

    // Verify individual sector calculations
    expect(result.breakdown.transport).toBe(0);
    expect(result.breakdown.energy).toBe(0);

    // Diet: base (650) * localFoodDiscount (0.90) * foodWasteMultiplier (0.90) = 526.5 ~ 527
    expect(result.breakdown.diet).toBeCloseTo(527, 0);

    // Consumption: (base (550) * recycleDiscount (0.80)) - compostCredit (150) = 290
    expect(result.breakdown.consumption).toBe(290);

    // Combined footprint
    expect(result.totalAnnualCo2Kg).toBe(817);
  });

  it('should compute carbon footprint correctly for typical heavy-emissions lifestyle profile', () => {
    const mockTransport = {
      carType: 'gasoline' as const,
      carKmPerWeek: 200,
      publicTransitKmPerWeek: 50,
      flightHoursPerYear: 15,
    };

    const mockEnergy = {
      electricityKwhPerMonth: 400,
      heatingFuel: 'gas' as const,
      heatingKwhPerMonth: 300,
      renewableEnergyPercent: 0,
    };

    const mockDiet = {
      dietType: 'meat-heavy' as const,
      localFoodPercent: 20, // (1 - 0.20 * 0.10) => 0.98 multiplier
      foodWaste: 'high' as const, // multiplier 1.25
    };

    const mockConsumption = {
      shoppingHabits: 'frequent' as const,
      recyclePercent: 10, // reduces shopping by (1 - 0.1 * 0.2) = 0.98 multiplier
      compost: false,
    };

    const result = calculateFootprint(mockTransport, mockEnergy, mockDiet, mockConsumption);

    // Confirm transport: (200 * 0.185 * 52) + (50 * 0.045 * 52) + (15 * 95) = 1924 + 117 + 1425 = 3466
    expect(result.breakdown.transport).toBe(3466);

    // Confirm energy: electricity: (400 * 0.380 * 12 * 1) = 1824
    // heating: (300 * 0.181 * 12) = 651.6
    // total = 1824 + 651.6 = 2475.6 ~ 2476
    expect(result.breakdown.energy).toBe(2476);

    // Confirm diet: base (3100) * local food multiplier (0.98) * waste multiplier (1.25) = 3797.5 ~ 3798
    expect(result.breakdown.diet).toBeCloseTo(3798, 0);

    // Confirm consumption: base (3200) * recycling discount 0.98 - compost 0 = 3136
    expect(result.breakdown.consumption).toBe(3136);

    expect(result.totalAnnualCo2Kg).toBe(12875);
  });
});
