import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CarbonAction, CARBON_ACTIONS } from '../data/footprintConstants';
import { DailyLog } from '../types';
import { Check, ClipboardList, Lightbulb, Flame, Plus, Compass } from 'lucide-react';

interface LoggerProps {
  onLogAction: (action: CarbonAction, notes: string) => void;
  recentLogs: DailyLog[];
}

export const ActiveLoggerComponent: React.FC<LoggerProps> = ({ onLogAction, recentLogs }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'transport' | 'energy' | 'diet' | 'consumption'>('all');
  const [customNotes, setCustomNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState<CarbonAction | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All', icon: <Compass className="w-4 h-4" /> },
    { id: 'transport', label: 'Transport', icon: '🚗' },
    { id: 'energy', label: 'Home Energy', icon: '⚡' },
    { id: 'diet', label: 'Diet & Food', icon: '🥗' },
    { id: 'consumption', label: 'Shopping & Waste', icon: '🛍' },
  ];

  const filteredActions = CARBON_ACTIONS.filter(action => {
    if (activeCategory === 'all') return true;
    return action.category === activeCategory;
  });

  const handleActionClick = (action: CarbonAction) => {
    setSelectedAction(action);
  };

  const submitLog = (action: CarbonAction) => {
    onLogAction(action, customNotes);
    
    // Play quick visual success feedback
    setSuccessId(action.id);
    setTimeout(() => {
      setSuccessId(null);
    }, 1500);

    // Reset selectors
    setCustomNotes('');
    setSelectedAction(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Category Selector filter tabs */}
      <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none items-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id as any);
              setSelectedAction(null);
            }}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-sm leading-none">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Actions Catalog */}
        <div className="lg:col-span-2 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <div className="bg-slate-50/50 p-2 border border-slate-100/50 rounded-xl flex items-center gap-2">
            <ClipboardList className="w-4.5 h-4.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">Select standard green action to log:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredActions.map((action) => {
                const isSelected = selectedAction?.id === action.id;
                const isSuccess = successId === action.id;

                let categoryColor = 'border-slate-100';
                if (action.category === 'transport') categoryColor = 'hover:border-blue-400';
                if (action.category === 'energy') categoryColor = 'hover:border-amber-400';
                if (action.category === 'diet') categoryColor = 'hover:border-emerald-400';
                if (action.category === 'consumption') categoryColor = 'hover:border-purple-400';

                return (
                  <motion.div
                    key={action.id}
                    layoutId={`action-${action.id}`}
                    onClick={() => handleActionClick(action)}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer select-none transition-all duration-200 flex flex-col justify-between h-[125px] relative overflow-hidden ${
                      isSelected
                        ? 'border-slate-800 ring-2 ring-slate-800 bg-slate-50/50'
                        : isSuccess
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : `border-slate-100/80 shadow-sm ${categoryColor}`
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-bold text-slate-800 tracking-tight leading-snug line-clamp-2">
                          {action.title}
                        </span>
                        <span className="text-xs leading-none">
                          {action.category === 'transport' && '🚗'}
                          {action.category === 'energy' && '⚡'}
                          {action.category === 'diet' && '🥗'}
                          {action.category === 'consumption' && '🛍️'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                        {action.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                      <span className="text-[10px] bg-slate-100 font-bold px-1.5 py-0.5 rounded text-slate-500 font-mono">
                        -{action.savedCo2Kg.toFixed(1)} kg CO₂
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono flex items-center">
                        +{action.points} XP
                      </span>
                    </div>

                    {isSuccess && (
                      <div className="absolute inset-0 bg-emerald-500/90 text-white flex flex-col items-center justify-center animate-fade-in">
                        <Check className="w-7 h-7 stroke-[3px]" />
                        <span className="text-[11px] font-bold mt-1 font-mono">LOGGED!</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Log Form & Logs Feed */}
        <div className="space-y-4">
          
          {/* Action Logger Panel */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800/80 shadow-sm space-y-4 relative overflow-hidden">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              Logger Submission Panel
            </h4>

            {selectedAction ? (
              <div className="space-y-4">
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold block capitalize">{selectedAction.category} action</span>
                  <p className="text-xs font-bold text-white leading-tight">{selectedAction.title}</p>
                  <p className="text-[10px] text-slate-400 leadging-tight">{selectedAction.description}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Daily Log Notes (Optional)</label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Rode matching standard bike route to store"
                    className="w-full bg-slate-800 border border-slate-700 outline-none focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => submitLog(selectedAction)}
                  className="w-full py-2.5 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 cursor-pointer rounded-xl transition-all shadow-md text-slate-950 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                  Log Action & Save Carbon
                </button>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center text-slate-500">
                <Lightbulb className="w-10 h-10 text-slate-700" />
                <p className="text-xs font-medium text-slate-400 mt-2 max-w-[180px]">
                  Pick one of the catalog cards on the left to activate logging and collect XP.
                </p>
              </div>
            )}
          </div>

          {/* Dynamic logs sequence list */}
          <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-3xl space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Activity History Stream ({recentLogs.length})
            </h4>

            {recentLogs.length > 0 ? (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {recentLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {log.category === 'transport' && '🚗'}
                        {log.category === 'energy' && '⚡'}
                        {log.category === 'diet' && '🥗'}
                        {log.category === 'consumption' && '🛍️'}
                      </span>
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-slate-700 block line-clamp-1">{log.actionTitle}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{log.date}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <span className="font-bold text-emerald-600 block">-{log.savedCo2Kg.toFixed(1)}kg</span>
                      <span className="text-slate-400">+{log.pointsEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 py-4 text-center border border-dashed border-slate-100 rounded-xl">
                No ecological daily logs submitted yet.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
