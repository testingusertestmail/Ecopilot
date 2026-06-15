import React from 'react';
import { motion } from 'motion/react';
import { Challenge, Achievement } from '../types';
import { Trophy, Leaf, Trees, Shield, Footprints, Flame, Sparkles, CheckCircle } from 'lucide-react';

interface ChallengesProps {
  challenges: Challenge[];
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  xpInLevel: number;
  xpNeededForNextLevel: number;
  onIncrementChallenge: (challengeId: string) => void;
}

export const ChallengesAchievementsComponent: React.FC<ChallengesProps> = ({
  challenges,
  achievements,
  totalPoints,
  level,
  xpInLevel,
  xpNeededForNextLevel,
  onIncrementChallenge,
}) => {
  const percentageXp = (xpInLevel / xpNeededForNextLevel) * 100;

  // Icon mapping helper for achievements
  const renderAchievementIcon = (iconName: string, unlocked: boolean) => {
    const css = `w-6 h-6 ${unlocked ? 'text-slate-900' : 'text-slate-400 opacity-40'}`;
    switch (iconName) {
      case 'Footprints':
        return <Footprints className={css} />;
      case 'Leaf':
        return <Leaf className={css} />;
      case 'Trees':
        return <Trees className={css} />;
      case 'Shield':
        return <Shield className={css} />;
      case 'Trophy':
        return <Trophy className={css} />;
      default:
        return <Leaf className={css} />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. LEVEL PROGRESS ROW */}
      <div className="bg-slate-900 border border-slate-800/80 shadow-md p-6 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Level Circle Badge */}
          <div className="flex items-center gap-4">
            <div className="relative w-18 h-18 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-3xl font-extrabold antialiased text-slate-900">
                {level}
              </span>
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold block">Carbon Defender</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Current Tier</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Experience Points (XP)</span>
              <span className="font-mono text-emerald-400 font-bold">{xpInLevel}/{xpNeededForNextLevel} XP</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentageXp}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-left">
              Earn {xpNeededForNextLevel - xpInLevel} more XP from actions or quests to level up.
            </p>
          </div>

          {/* Core Stats overview */}
          <div className="flex justify-around border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 pl-0 md:pl-6 text-center">
            <div>
              <span className="text-xl font-black font-mono text-white block">
                {totalPoints}
              </span>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Total Points</span>
            </div>
            <div>
              <span className="text-xl font-black font-mono text-emerald-400 block">
                {achievements.filter(a => a.unlocked).length} / {achievements.length}
              </span>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Badges Open</span>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. ACTIVE CHALLENGE LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                Active Co2 Challenges
              </h3>
              <p className="text-[10px] text-slate-400">Complete challenges to score large XP bonuses</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 font-mono">
              {challenges.filter(c => c.completed).length} / {challenges.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {challenges.map((challenge) => {
              const completionPercent = Math.min(100, (challenge.daysProgress / challenge.daysRequired) * 100);
              
              return (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-2xl bg-white border shadow-sm flex flex-col justify-between transition-all relative overflow-hidden ${
                    challenge.completed
                      ? 'border-emerald-100 bg-emerald-50/20'
                      : 'border-slate-100 hover:border-slate-250'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 block">{challenge.title}</span>
                        {challenge.completed ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                            <CheckCircle className="w-2.5 h-2.5" /> COMPLET COMPLETED
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded capitalize font-mono">
                            {challenge.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {challenge.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono block">
                        +{challenge.points} XP
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">
                        -{challenge.savedCo2ExpectedKg} kg net CO₂
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator and Button */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-5">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Milestone Tracker</span>
                        <span>{challenge.daysProgress} / {challenge.daysRequired} updates</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${challenge.completed ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>

                    {!challenge.completed && (
                      <button
                        onClick={() => onIncrementChallenge(challenge.id)}
                        className="py-1.5 px-3 bg-slate-900 text-[10px] text-white hover:bg-slate-800 font-bold rounded-lg cursor-pointer transition-colors shrink-0"
                      >
                        + Progress
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ACHIEVEMENTS SYSTEM */}
        <div className="bg-white border border-slate-100 shadow-sm p-5 rounded-3xl space-y-4">
          <div className="border-b border-slate-50 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Trophy className="w-4.5 h-4.5 text-amber-500" />
              Environmental Badges
            </h3>
            <p className="text-[10px] text-slate-400">Unlock decorative awards as you shrink your carbon footprint</p>
          </div>

          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {achievements.map((ach) => {
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border transition-all flex gap-3.5 items-center justify-start ${
                    ach.unlocked
                      ? 'bg-slate-50 border-slate-150 shadow-sm'
                      : 'bg-white border-transparent grayscale'
                  }`}
                >
                  {/* Badge Circle container */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center p-2.5 transition-all outline-dashed outline-1 outline-offset-3 ${
                      ach.unlocked
                        ? 'bg-emerald-100 border-2 border-emerald-400 outline-emerald-300'
                        : 'bg-slate-100 border-2 border-slate-200 outline-slate-200 opacity-60'
                    }`}
                  >
                    {renderAchievementIcon(ach.iconName, ach.unlocked)}
                  </div>

                  <div className="text-left flex-1">
                    <span className={`text-[11px] font-bold block ${ach.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                      {ach.title}
                    </span>
                    <span className="text-[10px] text-slate-450 line-clamp-2 leading-tight">
                      {ach.description}
                    </span>
                    {ach.unlocked && ach.unlockedAt && (
                      <span className="text-[8px] text-emerald-500 font-medium font-mono block mt-0.5">
                        Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
