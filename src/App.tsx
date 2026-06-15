import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FootprintCalculation, DailyLog, Challenge, Achievement, UserState } from './types';
import {
  calculateFootprint,
  DEFAULT_CHALLENGES,
  DEFAULT_ACHIEVEMENTS,
  CARBON_ACTIONS,
  REGIONAL_BENCHMARKS,
  CarbonAction
} from './data/footprintConstants';
import { GoalComparisonChart, CategoryRadialChart, WeeklySavingsChart } from './components/CustomChart';
import { FootprintCalculatorComponent } from './components/Calculator';
import { ActiveLoggerComponent } from './components/Logger';
import { ChallengesAchievementsComponent } from './components/Challenges';
import { InsightsComponent } from './components/Insights';
import { ReductionCenter } from './components/ReductionCenter';
import {
  Globe,
  Leaf,
  Activity,
  Sparkles,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Trophy,
  Calculator,
  Calendar,
  Flame,
  Award,
  Heart,
  ChevronRight,
  Info,
  DollarSign
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ECO_FOOTPRINT_USER_STATE_2026';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'logger' | 'quests' | 'insights'>('dashboard');
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);
  const [lastLeveledTo, setLastLeveledTo] = useState(1);
  const [showNotification, setShowNotification] = useState<{ title: string; desc: string } | null>(null);

  // Core User State
  const [state, setState] = useState<UserState>({
    footprint: null,
    totalPoints: 0,
    level: 1,
    xpInLevel: 0,
    xpNeededForNextLevel: 300,
    logs: [],
    challenges: [],
    achievements: [],
    co2OffsetKg: 0,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse saved eco-dashboard state", e);
        initializeDefaultState();
      }
    } else {
      initializeDefaultState();
    }
  }, []);

  const initializeDefaultState = () => {
    const defaultState: UserState = {
      footprint: null,
      totalPoints: 0,
      level: 1,
      xpInLevel: 0,
      xpNeededForNextLevel: 300,
      logs: [],
      challenges: JSON.parse(JSON.stringify(DEFAULT_CHALLENGES)),
      achievements: JSON.parse(JSON.stringify(DEFAULT_ACHIEVEMENTS)),
      co2OffsetKg: 0,
    };
    setState(defaultState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultState));
  };

  const saveToLocalStorage = (newState: UserState) => {
    setState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  const resetAllData = () => {
    if (window.confirm("Are you sure you want to completely reset your carbon history? This will clear all level status, logged events, and footprint results.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      initializeDefaultState();
      setActiveTab('dashboard');
    }
  };

  // Helper trigger custom toast notifications
  const triggerToast = (title: string, desc: string) => {
    setShowNotification({ title, desc });
    setTimeout(() => {
      setShowNotification(null);
    }, 4500);
  };

  // 1. Calculations assessment callback
  const handleCalculateResult = (result: FootprintCalculation) => {
    const updated = {
      ...state,
      footprint: result,
    };
    saveToLocalStorage(updated);
    triggerToast("Dashboard Audited!", `Your annual carbon footprint is registered: ${(result.totalAnnualCo2Kg / 1000).toFixed(1)} metric tons CO₂.`);
    setActiveTab('dashboard');
  };

  // 2. Logger action hook
  const handleLogAction = (action: CarbonAction, notes: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: DailyLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: todayStr,
      actionId: action.id,
      actionTitle: action.title,
      savedCo2Kg: action.savedCo2Kg,
      pointsEarned: action.points,
      category: action.category,
      notes: notes || undefined,
    };

    const newLogs = [newLog, ...state.logs];
    
    // XP math and Level progress
    let pointsToAdd = action.points;
    let currentXp = state.xpInLevel + pointsToAdd;
    let currentLevel = state.level;
    let neededXp = state.xpNeededForNextLevel;
    let didLevelUp = false;

    while (currentXp >= neededXp) {
      currentXp -= neededXp;
      currentLevel += 1;
      neededXp = currentLevel * 250 + 50; // Dynamic scale curve
      didLevelUp = true;
    }

    if (didLevelUp) {
      setLastLeveledTo(currentLevel);
      setShowLevelUpAlert(true);
    }

    // Auto update related active challenges
    const updatedChallenges = state.challenges.map(ch => {
      if (!ch.completed && ch.category === action.category) {
        const nextProgress = ch.daysProgress + 1;
        const isNowCompleted = nextProgress >= ch.daysRequired;
        if (isNowCompleted) {
          pointsToAdd += ch.points; // Add challenge completion reward to points
          triggerToast("Campaign Completed!", `You conquered the challenge "${ch.title}" for +${ch.points} XP!`);
          return {
            ...ch,
            daysProgress: ch.daysRequired,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }
        return {
          ...ch,
          daysProgress: nextProgress,
        };
      }
      return ch;
    });

    // Recalculate Achievements
    const totalCarbonSaved = newLogs.reduce((sum, l) => sum + l.savedCo2Kg, 0) + state.co2OffsetKg;
    const completedQuestsCount = updatedChallenges.filter(ch => ch.completed).length;

    const updatedAchievements = state.achievements.map(ach => {
      if (!ach.unlocked) {
        let conditionMet = false;
        if (ach.requirementType === 'logCount' && newLogs.length >= ach.requirementValue) {
          conditionMet = true;
        } else if (ach.requirementType === 'xp' && (state.totalPoints + pointsToAdd) >= ach.requirementValue) {
          conditionMet = true;
        } else if (ach.requirementType === 'challengeCount' && completedQuestsCount >= ach.requirementValue) {
          conditionMet = true;
        } else if (ach.requirementType === 'offset' && totalCarbonSaved >= ach.requirementValue) {
          conditionMet = true;
        }

        if (conditionMet) {
          triggerToast("Badge Deserved!", `Unlocked Award: "${ach.title}"! Check your trophy wall.`);
          return {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
        }
      }
      return ach;
    });

    const updatedState: UserState = {
      ...state,
      totalPoints: state.totalPoints + pointsToAdd,
      level: currentLevel,
      xpInLevel: currentXp,
      xpNeededForNextLevel: neededXp,
      logs: newLogs,
      challenges: updatedChallenges,
      achievements: updatedAchievements,
    };

    saveToLocalStorage(updatedState);
  };

  // 3. Quests progressive manual check
  const handleIncrementChallenge = (challengeId: string) => {
    let pointsToAdd = 0;
    const updatedChallenges = state.challenges.map(ch => {
      if (ch.id === challengeId && !ch.completed) {
        const nextProgress = ch.daysProgress + 1;
        const isNowCompleted = nextProgress >= ch.daysRequired;
        if (isNowCompleted) {
          pointsToAdd += ch.points;
          triggerToast("Campaign Completed!", `You completed the "${ch.title}" challenge for +${ch.points} points!`);
          return {
            ...ch,
            daysProgress: ch.daysRequired,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }
        return {
          ...ch,
          daysProgress: nextProgress,
        };
      }
      return ch;
    });

    // Check level-up and achievements consequence on updated points
    let currentXp = state.xpInLevel + pointsToAdd;
    let currentLevel = state.level;
    let neededXp = state.xpNeededForNextLevel;
    let didLevelUp = false;

    while (currentXp >= neededXp) {
      currentXp -= neededXp;
      currentLevel += 1;
      neededXp = currentLevel * 250 + 50;
      didLevelUp = true;
    }

    if (didLevelUp) {
      setLastLeveledTo(currentLevel);
      setShowLevelUpAlert(true);
    }

    const completedQuestsCount = updatedChallenges.filter(ch => ch.completed).length;
    const updatedAchievements = state.achievements.map(ach => {
      if (!ach.unlocked) {
        let conditionMet = false;
        if (ach.requirementType === 'challengeCount' && completedQuestsCount >= ach.requirementValue) {
          conditionMet = true;
        } else if (ach.requirementType === 'xp' && (state.totalPoints + pointsToAdd) >= ach.requirementValue) {
          conditionMet = true;
        }

        if (conditionMet) {
          triggerToast("Badge Deserved!", `Unlocked Award: "${ach.title}"!`);
          return {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
        }
      }
      return ach;
    });

    const updatedState: UserState = {
      ...state,
      totalPoints: state.totalPoints + pointsToAdd,
      level: currentLevel,
      xpInLevel: currentXp,
      xpNeededForNextLevel: neededXp,
      challenges: updatedChallenges,
      achievements: updatedAchievements,
    };

    saveToLocalStorage(updatedState);
  };

  // 4. Offset Projects Marketplace support
  const offsetProjects = [
    {
      id: 'proj_trees',
      title: 'Andes reforestation campaign',
      desc: 'Plant native Polylepis saplings to reclaim destroyed high-altitude cloud forests.',
      cost: 150,
      savedCo2Kg: 20,
      icon: '🌲'
    },
    {
      id: 'proj_cookstoves',
      title: 'Direct clean biomass cookstoves',
      desc: 'Supply insulated cookstoves to regional communities, halting deforestation of brushwood.',
      cost: 300,
      savedCo2Kg: 50,
      icon: '🔥'
    },
    {
      id: 'proj_wind',
      title: 'Community micro-wind generator',
      desc: 'Sponsor modular wind power installation on decentralized remote grids.',
      cost: 500,
      savedCo2Kg: 100,
      icon: '💨'
    }
  ];

  const handlePurchaseOffset = (proj: typeof offsetProjects[0]) => {
    if (state.totalPoints < proj.cost) {
      alert(`Insufficient Points! You need ${proj.cost} points, but you have ${state.totalPoints} points available. Log more green daily actions!`);
      return;
    }

    const newOffsetTotal = state.co2OffsetKg + proj.savedCo2Kg;
    const nextPoints = state.totalPoints - proj.cost;

    // Check offset achievement tiering
    const updatedAchievements = state.achievements.map(ach => {
      if (!ach.unlocked && ach.requirementType === 'offset' && newOffsetTotal >= ach.requirementValue) {
        triggerToast("Badge Deserved!", `Unlocked Award: "${ach.title}"!`);
        return {
          ...ach,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
      }
      return ach;
    });

    const updatedState: UserState = {
      ...state,
      totalPoints: nextPoints,
      co2OffsetKg: newOffsetTotal,
      achievements: updatedAchievements
    };

    saveToLocalStorage(updatedState);
    triggerToast("Project Sponsored!", `Supported "${proj.title}"! -${proj.cost} points. Offsets heightened by +${proj.savedCo2Kg}kg CO₂!`);
  };

  const cumulativeActionSavings = state.logs.reduce((sum, l) => sum + l.savedCo2Kg, 0);
  const netAnnualCarbonFootprint = state.footprint
    ? Math.max(0, state.footprint.totalAnnualCo2Kg - (cumulativeActionSavings + state.co2OffsetKg))
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-md shadow-slate-950/5">
              <Leaf className="w-5 h-5 text-emerald-400 rotate-12" />
            </div>
            <div className="text-left">
              <span className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
                EcoPilot AI
              </span>
              <span className="text-[10px] text-emerald-500 font-mono block leading-none font-semibold uppercase tracking-wider">
                Measure. Understand. Reduce.
              </span>
            </div>
          </div>

          {/* Quick Stats overview */}
          {state.footprint && (
            <div className="hidden sm:flex items-center gap-4 border-l border-slate-100 pl-4">
              <div className="text-left font-mono">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Gross Annual CO₂</span>
                <span className="text-sm font-bold text-slate-800">
                  {(state.footprint.totalAnnualCo2Kg / 1000).toFixed(1)} t
                </span>
              </div>
              <div className="text-left font-mono">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Offsets & Salvage</span>
                <span className="text-sm font-semibold text-emerald-600">
                  -{(cumulativeActionSavings + state.co2OffsetKg).toFixed(0)} kg
                </span>
              </div>
            </div>
          )}

          {/* Action controller utility resets */}
          <button
            onClick={resetAllData}
            title="Reset All Data"
            className="p-2 border border-slate-100 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main tab switching workspace layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col gap-6">
        
        {/* Workspace selector navigation tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto scrollbar-none gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
            { id: 'calculator', label: 'Assessment Audit', icon: <Calculator className="w-4 h-4" /> },
            { id: 'logger', label: 'Action Hub', icon: <Calendar className="w-4 h-4" /> },
            { id: 'quests', label: 'Quests', icon: <Trophy className="w-4 h-4" /> },
            { id: 'insights', label: 'Eco-Insights', icon: <Sparkles className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Central Display panel */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {!state.footprint ? (
                  /* GREETING FIRST TIME USER BANNER */
                  <div className="p-8 md:p-12 bg-white rounded-3xl border border-slate-100 shadow-xl text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
                    
                    <div className="max-w-md mx-auto space-y-4 relative z-10">
                      <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-400 rounded-3xl flex items-center justify-center text-emerald-500 text-3xl mx-auto rotate-6">
                        🌍
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        What is your eco footprint?
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Assess carbon metrics across your household power grid, travel networks, food diets, and retail waste. Log daily climate-mitigating tasks, level up, and purchase high-impact custom carbon offsets!
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-50 p-3 rounded-xl text-left border border-slate-100">
                          <span className="text-xs font-extrabold text-slate-800 block">⚡ Energy Grade</span>
                          <span className="text-[10px] text-slate-400">Carbon offset assessment</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl text-left border border-slate-100">
                          <span className="text-xs font-extrabold text-slate-800 block">🚗 Travel Vectors</span>
                          <span className="text-[10px] text-slate-400">Fuel coefficient logs</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('calculator')}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-xs text-white cursor-pointer font-bold rounded-xl transition-all shadow-md shadow-emerald-500/15 inline-flex items-center justify-center gap-1.5"
                      >
                        Calculate My Footprint Now
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MAIN RESIDENTIAL DASHBOARD WITH HERO REDUCTION COMMAND DECK */
                  <div className="space-y-8">
                    <ReductionCenter
                      calculation={state.footprint}
                      logs={state.logs}
                      co2OffsetKg={state.co2OffsetKg}
                      userState={state}
                      triggerToast={triggerToast}
                      saveToLocalStorage={saveToLocalStorage}
                    />

                    {/* Historical SVG analytics metrics and sponsorship offset bazaar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <CategoryRadialChart breakdown={state.footprint.breakdown} />
                          <GoalComparisonChart userValueKg={state.footprint.totalAnnualCo2Kg} />
                        </div>
                        <WeeklySavingsChart logs={state.logs} />
                      </div>

                      {/* Sponsor Offset Project Bazaar */}
                      <div className="bg-white border border-slate-100 p-5.5 rounded-3xl shadow-sm text-left flex flex-col justify-between h-fit">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Leaf className="w-4.5 h-4.5 text-emerald-500" />
                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                              Offset Project Bazaar
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Spend your accumulated Eco XP points to fund verified standard offsets and certified structural carbon reduction programs globally.
                          </p>

                          <div className="space-y-2.5 pt-3 pr-1">
                            {offsetProjects.map((proj) => (
                              <div key={proj.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-2.5 text-left">
                                  <span className="text-xl shrink-0">{proj.icon}</span>
                                  <div>
                                    <span className="text-[10px] font-extrabold text-snug text-slate-800 block leading-tight">{proj.title}</span>
                                    <span className="text-[9px] text-slate-400 leading-tight block">{proj.desc}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handlePurchaseOffset(proj)}
                                  className="py-1.5 px-3 bg-slate-900 text-[10px] font-bold text-white hover:bg-slate-800 cursor-pointer rounded-xl shrink-0 transition-colors"
                                >
                                  {proj.cost} XP
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-mono text-center">
                          Offsets are backed by verified VCS / Gold Standard.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: CALCULATOR FOOTPRINT */}
            {activeTab === 'calculator' && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <FootprintCalculatorComponent
                  onCalculate={handleCalculateResult}
                  initialData={state.footprint}
                />
              </motion.div>
            )}

            {/* TAB: DAILY ACTION LOGGER */}
            {activeTab === 'logger' && (
              <motion.div
                key="logger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-left bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-emerald-500" />
                    Carbon Saving Logger Hub
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                    Log the sustainable measures you completed today (e.g. commuting by bike, eating local food, washing clothes on cold). Swapping standard entries offsets overall greenhouse emissions and feeds your levels!
                  </p>
                </div>
                
                <ActiveLoggerComponent
                  onLogAction={handleLogAction}
                  recentLogs={state.logs}
                />
              </motion.div>
            )}

            {/* TAB: QUESTS, MILESTONES & LEVEL TIERS */}
            {activeTab === 'quests' && (
              <motion.div
                key="quests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ChallengesAchievementsComponent
                  challenges={state.challenges}
                  achievements={state.achievements}
                  totalPoints={state.totalPoints}
                  level={state.level}
                  xpInLevel={state.xpInLevel}
                  xpNeededForNextLevel={state.xpNeededForNextLevel}
                  onIncrementChallenge={handleIncrementChallenge}
                />
              </motion.div>
            )}

            {/* TAB: ENVIRONMENTAL AUDITS & CHATS */}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <InsightsComponent calculation={state.footprint} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Celebratory Level-Up Banner Modal */}
      <AnimatePresence>
        {showLevelUpAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6.5 text-center max-w-md w-full relative overflow-hidden border border-slate-100 shadow-2xl"
            >
              {/* Confetti Particles */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-400" />
              
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 text-3xl animate-bounce mb-3.5">
                🎉
              </div>

              <h3 className="text-xl font-bold tracking-tight text-slate-950 leading-none">
                Eco Warrior Leveled Up!
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                Spectacular! You scaled up to <span className="font-mono text-emerald-600 font-bold">Level {lastLeveledTo}</span>. Your carbon footprint offsets are accelerating our transition to Net Zero!
              </p>

              <div className="my-5 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-655">Tier Upward Status:</span>
                <span className="font-black text-slate-900">Guardian Tier {lastLeveledTo}</span>
              </div>

              <button
                onClick={() => setShowLevelUpAlert(false)}
                className="w-full py-2 bg-emerald-500 text-xs font-bold text-white uppercase tracking-wider cursor-pointer font-sans rounded-xl hover:bg-emerald-650 transition-colors"
              >
                Accept Honors & Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mini Toast Alert notifications */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-5 right-5 z-40 bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-xl flex items-start gap-3 max-w-sm pointer-events-none"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Award className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-100 block">{showNotification.title}</span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{showNotification.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer credits info segment */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 space-y-1">
          <p>© 2026 Carbon Footprint Tracker Applet. All greenhouse factors derived according to EPA and IPCC guidelines.</p>
          <p className="font-mono text-[9px] text-slate-400">Crafted with pristine modular React and fluid transitions.</p>
        </div>
      </footer>

    </div>
  );
}
