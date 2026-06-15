import { Challenge, Achievement, FootprintCalculation } from '../types';

// Carbon Emission Coefficients (in kg CO2 per unit)
export const CARBON_FACTORS = {
  // Transport: kg CO2 per km
  car: {
    gasoline: 0.185,
    diesel: 0.170,
    hybrid: 0.095,
    electric: 0.035, // average grid-mix charge
    none: 0,
  },
  publicTransit: 0.045, // average bus/train per passenger-km
  flightHour: 95.0,     // average passenger kg CO2 per travel hour
  
  // Energy: kg CO2 per kWh
  electricityGrid: 0.380, // average grid intensity
  heatingFuel: {
    gas: 0.181,        // natural gas per kWh
    oil: 0.264,        // diesel/heating oil per kWh
    electricity: 0.380, // direct electrical baseboard/pump
    wood: 0.035,        // biomass net Lifecycle emissions
    none: 0,
  },
  
  // Diet: average annual base emissions in kg CO2 per person
  dietBase: {
    'meat-heavy': 3100, // heavy red meat consumers
    balanced: 2100,     // typical mix
    'low-meat': 1500,   // flexitarian/pescatarian
    vegetarian: 1100,   // no meat, inherits dairy/eggs
    vegan: 650,         // strict plant-based
  },
  
  // Consumption & Waste: average annual base emissions in kg CO2 per person
  consumptionBase: {
    minimalist: 550,    // buys second-hand, durable products
    average: 1400,      // standard consumer purchases
    frequent: 3200,     // highly active retail shopping, new tech, fast fashion
  },
};

// Loggable actions catalog with exact points and CO2 offset metrics
export interface CarbonAction {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'diet' | 'consumption';
  savedCo2Kg: number;
  points: number;
}

export const CARBON_ACTIONS: CarbonAction[] = [
  // Transport actions
  {
    id: 'bike_commute',
    title: 'Cycle or Walk instead of Driving',
    description: 'Swapped a 10km driving trip for standard calorie-burning active transport.',
    category: 'transport',
    savedCo2Kg: 2.2,
    points: 40,
  },
  {
    id: 'public_transit',
    title: 'Took Public Transit',
    description: 'Rood the train, subway, or bus instead of a private vehicle.',
    category: 'transport',
    savedCo2Kg: 1.6,
    points: 30,
  },
  {
    id: 'carpool',
    title: 'Carpooled with Friends/Colleagues',
    description: 'Shared an existing drive route, splitting the emissions per passenger.',
    category: 'transport',
    savedCo2Kg: 1.2,
    points: 25,
  },
  {
    id: 'remote_work',
    title: 'Worked Remotely / No Commute',
    description: 'Prevented a full daily travel route by executing work from home.',
    category: 'transport',
    savedCo2Kg: 3.5,
    points: 35,
  },

  // Energy actions
  {
    id: 'unplug_idle',
    title: 'Unplugged Idle Electronics',
    description: 'Defeated phantom electricity draw on idle standby appliances and chargers.',
    category: 'energy',
    savedCo2Kg: 0.4,
    points: 15,
  },
  {
    id: 'thermostat_adjust',
    title: 'Adjusted Thermostat (1°C Shift)',
    description: 'Lowered indoor heating in winter or raised AC in summer by 1°C for the day.',
    category: 'energy',
    savedCo2Kg: 1.8,
    points: 30,
  },
  {
    id: 'wash_cold',
    title: 'Cold-Water Laundry Wash',
    description: 'Cleaned laundry using cold water instead of heated water.',
    category: 'energy',
    savedCo2Kg: 0.9,
    points: 20,
  },
  {
    id: 'sun_dry',
    title: 'Air-Dried Laundry',
    description: 'Hung wet clothes to dry on a line or rack instead of initiating an electric dryer load.',
    category: 'energy',
    savedCo2Kg: 1.5,
    points: 30,
  },
  {
    id: 'led_bulb',
    title: 'Installed LED Lightbulbs',
    description: 'Replaced an old incandescent lighting bulb with a high-efficiency power LED.',
    category: 'energy',
    savedCo2Kg: 0.5,
    points: 25,
  },

  // Diet actions
  {
    id: 'vegan_meal',
    title: 'Enjoyed a Fully Plant-Based Meal',
    description: 'Substituted all red meat, dairy, poultry, and fish for wholesome grains and greens.',
    category: 'diet',
    savedCo2Kg: 2.1,
    points: 35,
  },
  {
    id: 'vegan_day',
    title: 'Whole Day Plant-Based (Vegan)',
    description: 'Took a full vegetarian/vegan detox today to maximize methane-saving progress.',
    category: 'diet',
    savedCo2Kg: 5.6,
    points: 80,
  },
  {
    id: 'local_organic',
    title: 'Ate Local, Seasonal Ingredients',
    description: 'Purchased groceries sourced from regional local distribution networks.',
    category: 'diet',
    savedCo2Kg: 0.8,
    points: 20,
  },
  {
    id: 'zero_food_waste',
    title: 'Planned Meals with Zero Food Waste',
    description: 'Finished all prepared servings and leftovers, preventing decomposition landfills.',
    category: 'diet',
    savedCo2Kg: 1.2,
    points: 25,
  },

  // Consumption actions
  {
    id: 'second_hand',
    title: 'Bought Second-Hand/Thrifted',
    description: 'Avoided buying a brand-new manufactured product by thrift-shopping.',
    category: 'consumption',
    savedCo2Kg: 4.5,
    points: 50,
  },
  {
    id: 'reusable_bags',
    title: 'Used Reusable Containers & Bags',
    description: 'Avoided single-use packaging, polystyrene boxes, and paper/plastic carrier items.',
    category: 'consumption',
    savedCo2Kg: 0.3,
    points: 15,
  },
  {
    id: 'reflux_repaired',
    title: 'Repaired an Item instead of Replacing',
    description: 'Sought mending, sewing, or technical patch-ups for clothes or electronics.',
    category: 'consumption',
    savedCo2Kg: 6.0,
    points: 60,
  },
  {
    id: 'compost_weekly',
    title: 'Composted Organic Scraps',
    description: 'Diverted organic kitchen waste into a composting system rather than a general trash bag.',
    category: 'consumption',
    savedCo2Kg: 0.7,
    points: 20,
  },
];

// Default initial Challenges list
export const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'ch_car_free',
    title: 'Car-Free Commuter',
    description: 'Walk, cycle, or use transit on all work trips for an entire week.',
    category: 'transport',
    points: 250,
    savedCo2ExpectedKg: 15.4,
    daysRequired: 5,
    daysProgress: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 'ch_green_plate',
    title: 'Green Plate Focus',
    description: 'Indulge in 6 plant-based (vegetarian or vegan) meals to decrease agricultural impact.',
    category: 'diet',
    points: 200,
    savedCo2ExpectedKg: 12.6,
    daysRequired: 6,
    daysProgress: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 'ch_phantom_killer',
    title: 'Phantom Current Killer',
    description: 'Unplug all chargers and television appliances before bed for 4 consecutive nights.',
    category: 'energy',
    points: 150,
    savedCo2ExpectedKg: 2.8,
    daysRequired: 4,
    daysProgress: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 'ch_thrift_craft',
    title: 'Circular Master',
    description: 'Conduct at least 3 logging updates related to composting, second-hand purchase, or repairs.',
    category: 'consumption',
    points: 180,
    savedCo2ExpectedKg: 10.5,
    daysRequired: 3,
    daysProgress: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 'ch_sun_breeze',
    title: 'Sun & Breeze Drying',
    description: 'Air-dry laundry items 3 times instead of turning on the tumble dryer.',
    category: 'energy',
    points: 170,
    savedCo2ExpectedKg: 4.5,
    daysRequired: 3,
    daysProgress: 0,
    completed: false,
    completedAt: null,
  },
];

// Default Achievements list
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
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
  },
  {
    id: 'ach_save_50kg',
    title: 'Forest Protector',
    description: 'Save 50 kg of CO2 — the equivalent of growing a mature coniferous tree for 2 full years!',
    iconName: 'Trees',
    unlocked: false,
    unlockedAt: null,
    requirementType: 'offset',
    requirementValue: 50,
  },
  {
    id: 'ach_level_3',
    title: 'Eco Defender',
    description: 'Accelerate your progress and scale up to Level 3.',
    iconName: 'Shield',
    unlocked: false,
    unlockedAt: null,
    requirementType: 'xp',
    requirementValue: 400, // standard cumulative index for leveling
  },
  {
    id: 'ach_challenges_3',
    title: 'Quest Conqueror',
    description: 'Complete 3 ecological active challenges in full.',
    iconName: 'Trophy',
    unlocked: false,
    unlockedAt: null,
    requirementType: 'challengeCount',
    requirementValue: 3,
  },
];

// Global footprint benchmarks in kg CO2 per person per year
export const REGIONAL_BENCHMARKS = [
  { region: 'United States Average', amountKg: 15500, color: '#f87171' },
  { region: 'Canada Average', amountKg: 14200, color: '#fca5a5' },
  { region: 'United Kingdom Average', amountKg: 5800, color: '#fbbf24' },
  { region: 'European Union Average', amountKg: 6400, color: '#fcd34d' },
  { region: 'Global Average Target (Limit)', amountKg: 2000, color: '#34d399' },
];

/**
 * Executes a full mathematical assessment of carbon footprint across sectors
 */
export function calculateFootprint(
  transport: FootprintCalculation['transport'],
  energy: FootprintCalculation['energy'],
  diet: FootprintCalculation['diet'],
  consumption: FootprintCalculation['consumption']
): FootprintCalculation {
  // 1. CAR CALCULATIONS: km/week * 52 * carFactor
  const carFactor = CARBON_FACTORS.car[transport.carType];
  const carAnnual = transport.carKmPerWeek * carFactor * 52;
  
  // 2. PUBLIC TRANSIT: km/week * 52 * transitFactor
  const transitAnnual = transport.publicTransitKmPerWeek * CARBON_FACTORS.publicTransit * 52;
  
  // 3. FLIGHTS: hours/year * flightFactor
  const flightsAnnual = transport.flightHoursPerYear * CARBON_FACTORS.flightHour;
  
  const transportTotal = carAnnual + transitAnnual + flightsAnnual;

  // 4. ELECTRICITY: kWh/month * 12 * factor * (1 - renewable/100)
  const electricityBase = energy.electricityKwhPerMonth * CARBON_FACTORS.electricityGrid * 12;
  const electricityRenewableDiscount = electricityBase * (energy.renewableEnergyPercent / 100);
  const electricityTotal = Math.max(0, electricityBase - electricityRenewableDiscount);

  // 5. HEATING: kWh/month * 12 * heatingFactor
  const heatingFactor = CARBON_FACTORS.heatingFuel[energy.heatingFuel];
  const heatingTotal = energy.heatingKwhPerMonth * heatingFactor * 12;

  const energyTotal = electricityTotal + heatingTotal;

  // 6. DIET: baseDiet * mealOriginCorrection * wasteCorrection
  let dietBase = CARBON_FACTORS.dietBase[diet.dietType];
  
  // Local food lowers distribution carbon (up to -10% if 100% local)
  const localFoodDiscount = 1 - (diet.localFoodPercent / 100) * 0.10;
  
  // Food waste correction
  let foodWasteMultiplier = 1.05; // average
  if (diet.foodWaste === 'low') {
    foodWasteMultiplier = 0.90;
  } else if (diet.foodWaste === 'high') {
    foodWasteMultiplier = 1.25;
  }
  
  const dietTotal = dietBase * localFoodDiscount * foodWasteMultiplier;

  // 7. CONSUMPTION: baseConsumption * recyclingDiscount - compostDiscount
  const consumptionBase = CARBON_FACTORS.consumptionBase[consumption.shoppingHabits];
  // recycling reduces up to 20% of shopping waste carbon
  const recyclingDiscount = 1 - (consumption.recyclePercent / 100) * 0.20;
  let compostCredit = consumption.compost ? 150 : 0; // subtract 150kg if composting
  
  const consumptionTotal = Math.max(0, (consumptionBase * recyclingDiscount) - compostCredit);

  // 8. COMBINE
  const totalAnnualCo2Kg = Math.round(transportTotal + energyTotal + dietTotal + consumptionTotal);

  return {
    transport,
    energy,
    diet,
    consumption,
    calculatedAt: new Date().toISOString(),
    totalAnnualCo2Kg,
    breakdown: {
      transport: Math.round(transportTotal),
      energy: Math.round(energyTotal),
      diet: Math.round(dietTotal),
      consumption: Math.round(consumptionTotal),
    },
  };
}
