import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FootprintCalculation } from '../types';
import { calculateFootprint } from '../data/footprintConstants';
import { ChevronRight, ChevronLeft, Zap, Car, Utensils, ShoppingBag, CheckCircle, Calculator } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (calculation: FootprintCalculation) => void;
  initialData: FootprintCalculation | null;
}

export const FootprintCalculatorComponent: React.FC<CalculatorProps> = ({ onCalculate, initialData }) => {
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);

  // Form states initialized standard averages or existing data
  const [carKmPerWeek, setCarKmPerWeek] = useState(initialData?.transport.carKmPerWeek ?? 120);
  const [carType, setCarType] = useState<FootprintCalculation['transport']['carType']>(initialData?.transport.carType ?? 'gasoline');
  const [publicTransitKmPerWeek, setPublicTransitKmPerWeek] = useState(initialData?.transport.publicTransitKmPerWeek ?? 30);
  const [flightHoursPerYear, setFlightHoursPerYear] = useState(initialData?.transport.flightHoursPerYear ?? 8);

  const [electricityKwhPerMonth, setElectricityKwhPerMonth] = useState(initialData?.energy.electricityKwhPerMonth ?? 350);
  const [renewableEnergyPercent, setRenewableEnergyPercent] = useState(initialData?.energy.renewableEnergyPercent ?? 15);
  const [heatingFuel, setHeatingFuel] = useState<FootprintCalculation['energy']['heatingFuel']>(initialData?.energy.heatingFuel ?? 'gas');
  const [heatingKwhPerMonth, setHeatingKwhPerMonth] = useState(initialData?.energy.heatingKwhPerMonth ?? 250);

  const [dietType, setDietType] = useState<FootprintCalculation['diet']['dietType']>(initialData?.diet.dietType ?? 'balanced');
  const [localFoodPercent, setLocalFoodPercent] = useState(initialData?.diet.localFoodPercent ?? 20);
  const [foodWaste, setFoodWaste] = useState<FootprintCalculation['diet']['foodWaste']>(initialData?.diet.foodWaste ?? 'average');

  const [shoppingHabits, setShoppingHabits] = useState<FootprintCalculation['consumption']['shoppingHabits']>(initialData?.consumption.shoppingHabits ?? 'average');
  const [recyclePercent, setRecyclePercent] = useState(initialData?.consumption.recyclePercent ?? 50);
  const [compost, setCompost] = useState(initialData?.consumption.compost ?? false);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      triggerCalculation();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const triggerCalculation = () => {
    setIsCalculating(true);
    // Simulate smart environmental audit processing sequence
    setTimeout(() => {
      const result = calculateFootprint(
        { carKmPerWeek, carType, flightHoursPerYear, publicTransitKmPerWeek },
        { electricityKwhPerMonth, heatingFuel, heatingKwhPerMonth, renewableEnergyPercent },
        { dietType, localFoodPercent, foodWaste },
        { shoppingHabits, recyclePercent, compost }
      );
      onCalculate(result);
      setIsCalculating(false);
      setStep(1); // Reset for next calculate attempts if needed
    }, 1800);
  };

  const fillAverageBenchmark = () => {
    setCarKmPerWeek(100);
    setCarType('diesel');
    setPublicTransitKmPerWeek(40);
    setFlightHoursPerYear(5);
    setElectricityKwhPerMonth(300);
    setRenewableEnergyPercent(20);
    setHeatingFuel('electricity');
    setHeatingKwhPerMonth(150);
    setDietType('balanced');
    setLocalFoodPercent(30);
    setFoodWaste('average');
    setShoppingHabits('average');
    setRecyclePercent(40);
    setCompost(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-100 shadow-xl rounded-3xl overflow-hidden relative">
      
      {/* Upper header segment */}
      <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
        <div className="z-10 relative flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Calculator className="w-5.5 h-5.5 text-emerald-400" />
              Carbon Calculator Wizard
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Estimate your footprint across 4 sectors of lifestyle emissions
            </p>
          </div>
          <button
            onClick={fillAverageBenchmark}
            className="text-[10px] bg-slate-800 hover:bg-slate-700/80 cursor-pointer border border-slate-700 text-slate-300 font-mono py-1.5 px-3 rounded-lg transition-colors"
          >
            Load Std Averages
          </button>
        </div>
        
        {/* Step dots */}
        <div className="mt-6 flex justify-between items-center relative z-10">
          {[1, 2, 3, 4].map((i) => {
            let stepLabel = '';
            let stepIcon = <Car className="w-4 h-4" />;
            if (i === 1) { stepLabel = 'Transport'; stepIcon = <Car className="w-3.5 h-3.5" />; }
            if (i === 2) { stepLabel = 'Energy'; stepIcon = <Zap className="w-3.5 h-3.5" />; }
            if (i === 3) { stepLabel = 'Diet'; stepIcon = <Utensils className="w-3.5 h-3.5" />; }
            if (i === 4) { stepLabel = 'Waste'; stepIcon = <ShoppingBag className="w-3.5 h-3.5" />; }

            return (
              <div key={i} className="flex flex-col items-center flex-1 relative JSON">
                <div
                  className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                    step === i
                      ? 'bg-emerald-500 text-white scale-110 ring-4 ring-emerald-500/30 font-bold'
                      : step > i
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {step > i ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : stepIcon}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${step === i ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  {stepLabel}
                </span>
                {i < 4 && (
                  <div
                    className={`absolute top-3.5 left-1/2 w-full h-[2px] -z-0 ${
                      step > i ? 'bg-emerald-400' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form content with animated swap */}
      <div className="p-6 md:p-8 min-h-[350px]">
        <AnimatePresence mode="wait">
          {isCalculating ? (
            <motion.div
              key="calculating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 space-y-4"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-emerald-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-slate-800">Assessing Footprint Factors...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Applying greenhouse gas conversion coefficients according to EPA guidelines.
                </p>
                <div className="grid grid-cols-4 gap-1.5 max-w-xs mx-auto mt-4.5">
                  <span className="text-[9px] bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-500 font-mono">Scope 1</span>
                  <span className="text-[9px] bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-500 font-mono">Scope 2</span>
                  <span className="text-[9px] bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-500 font-mono">Biogenic</span>
                  <span className="text-[9px] bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-500 font-mono">Offset</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* STEP 1: TRANSPORT */}
              {step === 1 && (
                <div className="space-y-5">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400">Section 1: Transportation</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-slate-700">Weekly Driving Distance: <span className="font-mono text-emerald-600 font-bold">{carKmPerWeek} km</span></label>
                      <button
                        onClick={() => setCarKmPerWeek(0)}
                        className="text-[10px] text-slate-400 hover:text-red-500"
                      >
                        Set to Zero (No Car)
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="600"
                      step="10"
                      value={carKmPerWeek}
                      onChange={(e) => setCarKmPerWeek(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0 km</span>
                      <span>150 km (Avg)</span>
                      <span>300 km</span>
                      <span>600+ km</span>
                    </div>
                  </div>

                  {carKmPerWeek > 0 && (
                    <div className="space-y-2.5">
                      <label className="text-xs font-semibold text-slate-700">Fuel Type of Primary Vehicle</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['gasoline', 'diesel', 'hybrid', 'electric'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setCarType(type)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer capitalize flex flex-col items-center justify-center gap-1 ${
                              carType === type
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold ring-2 ring-emerald-500/25'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-medium">{type}</span>
                            <span className="text-[8px] opacity-75 font-mono">
                              {type === 'gasoline' && '185g CO2/km'}
                              {type === 'diesel' && '170g CO2/km'}
                              {type === 'hybrid' && '95g CO2/km'}
                              {type === 'electric' && '35g/km Grid'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 flex justify-between">
                        <span>Transit Travel (Bus/Train)</span>
                        <span className="font-mono text-emerald-600 font-bold">{publicTransitKmPerWeek} km/week</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="400"
                        step="10"
                        value={publicTransitKmPerWeek}
                        onChange={(e) => setPublicTransitKmPerWeek(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 flex justify-between">
                        <span>Annual Air Travel Flight Hours</span>
                        <span className="font-mono text-emerald-600 font-bold">{flightHoursPerYear} hours/year</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        step="1"
                        value={flightHoursPerYear}
                        onChange={(e) => setFlightHoursPerYear(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: HOME ENERGY */}
              {step === 2 && (
                <div className="space-y-5">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400">Section 2: Home Energy Grid</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 flex justify-between">
                        <span>Electricity Consumption</span>
                        <span className="font-mono text-emerald-600 font-bold">{electricityKwhPerMonth} kWh/month</span>
                      </label>
                      <input
                        type="number"
                        value={electricityKwhPerMonth}
                        onChange={(e) => setElectricityKwhPerMonth(Math.max(0, Number(e.target.value)))}
                        className="w-full border border-slate-200 outline-none focus:border-emerald-500 rounded-xl px-3 py-2 text-sm"
                      />
                      <p className="text-[10px] text-slate-400">Standard housing average is ~250–450 kWh.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 flex justify-between">
                        <span>Renewable Energy Share</span>
                        <span className="font-mono text-emerald-600 font-bold">{renewableEnergyPercent}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={renewableEnergyPercent}
                        onChange={(e) => setRenewableEnergyPercent(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none mt-3"
                      />
                      <p className="text-[10px] text-slate-400">Solar panels or green power tariff utility credits.</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <label className="text-xs font-semibold text-slate-700 block">Primary Heating Fuel</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['gas', 'oil', 'electricity', 'wood'] as const).map((fuel) => (
                        <button
                          key={fuel}
                          type="button"
                          onClick={() => setHeatingFuel(fuel)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer capitalize ${
                            heatingFuel === fuel
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold ring-2 ring-emerald-500/25'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs font-medium block">{fuel}</span>
                          <span className="text-[8px] opacity-75 font-mono">
                            {fuel === 'gas' && '0.18 kg CO2/kWh'}
                            {fuel === 'oil' && '0.26 kg CO2/kWh'}
                            {fuel === 'electricity' && 'Direct electric heat'}
                            {fuel === 'wood' && '0.03 kg net biomass'}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold text-slate-700 flex justify-between">
                        <span>Monthly Heating Power Allocation</span>
                        <span className="font-mono text-emerald-600 font-bold">{heatingKwhPerMonth} kWh/month</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1200"
                        step="50"
                        value={heatingKwhPerMonth}
                        onChange={(e) => setHeatingKwhPerMonth(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: FOOD & DIET */}
              {step === 3 && (
                <div className="space-y-5">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400">Section 3: Diet & Food Sourcing</h4>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Which best describes your daily diet?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { type: 'meat-heavy', title: 'Meat-Heavy', desc: 'Frequent red meat, poultry, dairy, and grocery items daily.', keyFact: '~3,100 kg CO2/year' },
                        { type: 'balanced', title: 'Balanced Mix', desc: 'Moderate poultry and fish, red meat occasionally, standard dairy.', keyFact: '~2,100 kg CO2/year' },
                        { type: 'low-meat', title: 'Low Meat / Flexitarian', desc: 'Mostly plant-focused meals; seafood/poultry occasionally.', keyFact: '~1,500 kg CO2/year' },
                        { type: 'vegetarian', title: 'Vegetarian', desc: 'Strictly zero meat or seafood, but includes milk, eggs, cheese.', keyFact: '~1,100 kg CO2/year' },
                        { type: 'vegan', title: 'Fully Plant-Based (Vegan)', desc: 'Only grains, beans, greens, nuts, fruit. No animal-derived ingredients.', keyFact: '~650 kg CO2/year' },
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setDietType(item.type as any)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${
                            dietType === item.type
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/25'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block">{item.title}</span>
                            <span className="text-[11px] opacity-75">{item.desc}</span>
                          </div>
                          <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded">
                            {item.keyFact}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 flex justify-between">
                        <span>Local Sourcing (Organic/Local)</span>
                        <span className="font-mono text-emerald-600 font-bold">{localFoodPercent}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localFoodPercent}
                        onChange={(e) => setLocalFoodPercent(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Household Kitchen Waste</label>
                      <div className="flex gap-1.5 mt-2">
                        {['low', 'average', 'high'].map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setFoodWaste(w as any)}
                            className={`flex-1 py-1.5 rounded-lg border text-xs capitalize cursor-pointer font-medium ${
                              foodWaste === w
                                ? 'bg-emerald-100/60 border-emerald-500 text-emerald-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {w === 'low' ? 'Low (-10%)' : w === 'average' ? 'Avg (0%)' : 'High (+25%)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SHOPPING & WASTE */}
              {step === 4 && (
                <div className="space-y-5">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400">Section 4: Consumption & Waste</h4>
                  
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-slate-700">How would you describe your general shopping habits?</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { type: 'minimalist', title: 'Minimalist', metric: 'Rarely buy new' },
                        { type: 'average', title: 'Average', metric: 'Standard purchases' },
                        { type: 'frequent', title: 'Frequent Shopping', metric: 'New tech, fast-fashion' },
                      ].map(item => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setShoppingHabits(item.type as any)}
                          className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                            shoppingHabits === item.type
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/25'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs block font-bold">{item.title}</span>
                          <span className="text-[9px] text-slate-500 block mt-1">{item.metric}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 flex justify-between">
                        <span>Household Recycling Rate</span>
                        <span className="font-mono text-emerald-600 font-bold">{recyclePercent}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={recyclePercent}
                        onChange={(e) => setRecyclePercent(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                      />
                      <p className="text-[10px] text-slate-400">Paper, metals, plastic bottle separation rate.</p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-700">Composting Organics</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Diverts kitchen scraps, saves 150 kg CO2/year.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCompost(c => !c)}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-all outline-none duration-250 cursor-pointer ${
                          compost ? 'bg-emerald-500 flex justify-end pl-0' : 'bg-slate-300 flex justify-start pr-0'
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button navigation segment */}
      {!isCalculating && (
        <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-white rounded-xl py-2.5 px-4 cursor-pointer hover:bg-slate-50 text-slate-600 transition-colors ${
              step === 1 && 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 hover:bg-emerald-600 text-xs font-bold bg-emerald-500 rounded-xl py-2.5 px-5 text-white shadow-md shadow-emerald-500/10 cursor-pointer transition-colors"
          >
            {step === totalSteps ? 'Calculate Audit' : 'Next Category'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
