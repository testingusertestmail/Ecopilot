import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FootprintCalculation } from '../types';
import { Leaf, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, Lightbulb, Send, MessageSquare } from 'lucide-react';

interface InsightsProps {
  calculation: FootprintCalculation | null;
}

export const InsightsComponent: React.FC<InsightsProps> = ({ calculation }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    { sender: 'agent', text: 'Hello! I am your Eco-Advisor AI. Ask me anything about reducing your carbon footprint, green utilities, or energy saving tips!' },
  ]);

  // Generate specialized, mathematical audit insights based on user's actual footprint metrics
  const getPersonalizedInsights = () => {
    if (!calculation) {
      return [
        {
          title: 'Awaiting Carbon Audit',
          desc: 'Complete your carbon calculation first to unlock personalized, mathematical recommendations.',
          tier: 'neutral',
          offsetPct: 0,
          potentialSavingKg: 0,
        }
      ];
    }

    const { breakdown, totalAnnualCo2Kg } = calculation;
    const insightsList = [];

    // 1. TRANSPORT AUDIT: Average transport is around 3,500 kg
    if (breakdown.transport > 3500) {
      const carKm = calculation.transport.carKmPerWeek;
      const potentialTrainSaving = Math.round(carKm * 0.13 * 52); // switching half to public transit
      insightsList.push({
        title: 'High travel emissions identified',
        desc: `Switching just 50% of your current driving distance (${carKm} km/week) to public transportation or cycling would prevent around ${potentialTrainSaving} kg of CO₂ emissions each year!`,
        tier: 'critical',
        offsetPct: Math.round((potentialTrainSaving / totalAnnualCo2Kg) * 100),
        potentialSavingKg: potentialTrainSaving,
      });
    } else {
      insightsList.push({
        title: 'Efficient transit profile',
        desc: 'Splendid! Your transportation emissions are well-optimized. Adding an extra clean commute once a week seals your status as a transit leader.',
        tier: 'optimal',
        offsetPct: 4,
        potentialSavingKg: 150,
      });
    }

    // 2. ENERGY AUDIT: Average electricity/heat has high offset leverage
    if (breakdown.energy > 2000) {
      // Shifting thermostat by 1C saves 7% of heat energy. Average electric saving is:
      const thermSaving = Math.round(breakdown.energy * 0.08);
      const solarSavingForGrid = Math.round(calculation.energy.electricityKwhPerMonth * 12 * 0.38); // 100% solar savings
      insightsList.push({
        title: 'Thermal & electric power savings opportunity',
        desc: `Lowering your home thermostat by just 1.5°C in cool seasons or raising AC by 1.5°C in warm seasons can trim your home energy bill and save up to ${thermSaving} kg of CO₂ per year. Transitioning to green utility tariffs can further drop power carbon by up to ${solarSavingForGrid} kg.`,
        tier: 'warning',
        offsetPct: Math.round((solarSavingForGrid / totalAnnualCo2Kg) * 100),
        potentialSavingKg: solarSavingForGrid,
      });
    } else {
      insightsList.push({
        title: 'Home energy star',
        desc: 'Your space is run with admirable energy awareness. Upgrading remaining bulbs to high-output LEDs completely eliminates standby load.',
        tier: 'optimal',
        offsetPct: 6,
        potentialSavingKg: 120,
      });
    }

    // 3. DIET AUDIT: Diet is highly dynamic
    if (calculation.diet.dietType === 'meat-heavy' || calculation.diet.dietType === 'balanced') {
      const dietSaving = Math.round(breakdown.diet * 0.35); // moving to flexitarian saves 35% of diet
      insightsList.push({
        title: 'Sustain food footprint transition',
        desc: `Switching to flexitarian or plant-based eating patterns is a high-impact choice. Moving from red meat dependencies to protein-rich plant options for 3 days a week cuts food greenhouse emissions by ${dietSaving} kg of CO₂ per year!`,
        tier: 'warning',
        offsetPct: Math.round((dietSaving / totalAnnualCo2Kg) * 100),
        potentialSavingKg: dietSaving,
      });
    } else {
      insightsList.push({
        title: 'Plant-power champion',
        desc: 'Incredible job! Conquering carbon through dietary discipline is one of the highest leverage daily mechanisms to help the biosphere.',
        tier: 'optimal',
        offsetPct: 15,
        potentialSavingKg: 400,
      });
    }

    // 4. CONSUMPTION & WASTE
    if (calculation.consumption.shoppingHabits === 'frequent' || !calculation.consumption.compost) {
      insightsList.push({
        title: 'Zero Waste circularity potential',
        desc: 'Adding a compost bin for kitchen scraps and striving to shop second-hand/repaired items cuts down landfill waste methane and saves approximately 280 kg of annual CO₂.',
        tier: 'warning',
        offsetPct: Math.round((280 / totalAnnualCo2Kg) * 100),
        potentialSavingKg: 280,
      });
    } else {
      insightsList.push({
        title: 'Circular economy leader',
        desc: 'Composting and thrifting keeps your materials out of garbage disposal lines. You are leading the linear-to-circular transition!',
        tier: 'optimal',
        offsetPct: 8,
        potentialSavingKg: 200,
      });
    }

    return insightsList;
  };

  // Real AI Gemini-fueled chat engine via server proxy
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMessages = [...chatMessages, { sender: 'user' as const, text: userText }];
    setChatMessages(newMessages);
    setChatInput('');

    // Place an empty or typing indicator
    const holdingMessages = [...newMessages, { sender: 'agent' as const, text: "EcoPilot AI thinking..." }];
    setChatMessages(holdingMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          userFootprint: calculation,
        }),
      });
      const data = await response.json();
      setChatMessages([...newMessages, { sender: 'agent' as const, text: data.text }]);
    } catch (error) {
      console.error("AI chat communication error", error);
      // Fallback
      setChatMessages([...newMessages, { sender: 'agent' as const, text: "I'm having a slight solar-storm grid issue, but remember: reducing meat-heavy meals 3 times a week is one of your quickest levers!" }]);
    }
  };

  const insights = getPersonalizedInsights();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. PERSONALIZED AUDIT CARDS */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 animate-pulse">
              <Leaf className="w-4.5 h-4.5 text-emerald-500" />
              Tailored Carbon Mitigation Audit
            </h3>
            <p className="text-[10px] text-slate-400">Carbon offset leverage points and high-impact target vectors</p>
          </div>
          {calculation && (
            <span className="text-[10px] text-emerald-800 bg-emerald-100/60 font-mono font-bold px-2 py-0.5 rounded">
              {insights.reduce((acc, curr) => acc + curr.potentialSavingKg, 0)} kg CO₂ Savings Potential
            </span>
          )}
        </div>

        <div className="space-y-3">
          {insights.map((item, index) => {
            return (
              <div
                key={index}
                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center relative overflow-hidden"
              >
                {/* Indicator accent strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    item.tier === 'critical'
                      ? 'bg-red-400'
                      : item.tier === 'warning'
                      ? 'bg-amber-400'
                      : item.tier === 'optimal'
                      ? 'bg-emerald-400'
                      : 'bg-slate-300'
                  }`}
                />

                <div className="flex-1 pl-2 space-y-1">
                  <div className="flex items-center gap-2">
                    {item.tier === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                    {item.tier === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                    {item.tier === 'optimal' && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    <h4 className="text-xs font-bold text-slate-800 leading-none">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-550 leading-relaxed pt-1">
                    {item.desc}
                  </p>
                </div>

                {calculation && item.potentialSavingKg > 0 && (
                  <div className="shrink-0 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center w-full md:w-[130px] flex md:flex-col justify-between md:justify-center items-center gap-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Reduce Footprint</span>
                    <span className="text-xs font-black font-mono text-slate-700 block">
                      -{item.potentialSavingKg} kg/yr
                    </span>
                    <span className="text-[9px] bg-emerald-150 text-emerald-800 font-bold px-1.5 py-0.5 rounded font-mono block">
                      {item.offsetPct}% savings
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CHAT WITH ECO-SPECIALIST ADVISOR */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 flex flex-col justify-between h-[450px]">
        
        {/* Header chatbot */}
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm">
            🌱
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-slate-800 block">Eco-Advisor Assistant</span>
            <span className="text-[9px] text-emerald-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Climate Specialist Active
            </span>
          </div>
        </div>

        {/* Message Feed Container */}
        <div className="flex-1 my-3 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 max-w-[85%] rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-700 border border-slate-100/80 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action input bar */}
        <div className="relative pt-2 border-t border-slate-50 flex items-center gap-1.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatChatInput(e)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask: 'How does compost save CO2?'"
            className="w-full bg-slate-50 border border-slate-150 outline-none focus:border-slate-400 rounded-2xl pl-3.5 pr-10 py-2.5 text-xs text-slate-700"
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-1 text-white bg-slate-900 hover:bg-slate-800 p-2 rounded-full cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );

  // Helper setter to handle event binding seamlessly
  function setChatChatInput(e: React.ChangeEvent<HTMLInputElement>) {
    setChatInput(e.target.value);
  }
};
