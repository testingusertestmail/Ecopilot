import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini client to avoid crashes if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// -------------------------------------------------------------
// AI API ENDPOINTS
// -------------------------------------------------------------

// ENDPOINT 1: AI Carbon Reduction Coach - personalized recommendations
app.post("/api/reduction-coach", async (req, res) => {
  const { breakdown, transport, energy, diet, consumption, totalAnnualCo2Kg } = req.body;
  const ai = getGenAI();

  if (!breakdown) {
    return res.status(400).json({ error: "Missing footprint breakdown data" });
  }

  // Find the highest division
  const categories = Object.entries(breakdown) as [string, number][];
  categories.sort((a, b) => b[1] - a[1]);
  const highestSector = categories[0]?.[0] || "transport";
  const highestSectorValue = categories[0]?.[1] || 0;
  const highestPct = totalAnnualCo2Kg > 0 ? Math.round((highestSectorValue / totalAnnualCo2Kg) * 100) : 0;

  if (!ai) {
    // Elegant fallback rule-based engine when GEMINI_API_KEY is not defined
    const rulesRecommendations = getFallbackRecommendations(highestSector, breakdown, totalAnnualCo2Kg);
    return res.json({
      highestSector: highestSector.toUpperCase(),
      highestPct,
      recommendations: rulesRecommendations,
      isFallback: true,
    });
  }

  try {
    const prompt = `
You are EcoPilot AI.
Analyze the user's carbon footprint breakdown.

Identify the highest emission sector.
Generate exactly 3 personalized recommendations.

Here is the user's data:
- Total Annual Footprint: ${(totalAnnualCo2Kg / 1000).toFixed(2)} metric tons (or ${totalAnnualCo2Kg} kg CO2)
- Sector breakdown:
  * Transportation: ${breakdown.transport} kg CO2
  * Household Energy: ${breakdown.energy} kg CO2
  * Food & Diet: ${breakdown.diet} kg CO2
  * General Shopping & Consumption: ${breakdown.consumption} kg CO2

User specifics:
- Car driven per week: ${transport?.carKmPerWeek || 0} km (${transport?.carType || "none"} vehicle)
- Weekly public transit: ${transport?.publicTransitKmPerWeek || 0} km
- Flight hours per year: ${transport?.flightHoursPerYear || 0} hours
- Household grid power: ${energy?.electricityKwhPerMonth || 0} kWh/month (${energy?.renewableEnergyPercent || 0}% renewable)
- Household heating: ${energy?.heatingKwhPerMonth || 0} kWh/month fueled by ${energy?.heatingFuel || "none"}
- Diet style: ${diet?.dietType || "balanced"} (${diet?.localFoodPercent || 0}% local foods), food waste grade is: ${diet?.foodWaste || "average"}
- Consumption/Shopping habits: ${consumption?.shoppingHabits || "average"}, composts: ${consumption?.compost ? "yes" : "no"}, recycle percent: ${consumption?.recyclePercent || 0}%

Identify the highest emission sector: ${highestSector} (${highestPct}% of total emissions).

Generate exactly 3 personalized recommendations.
For each recommendation provide:
1. title (Action Title)
2. whyItMatters (Why It Matters - custom descriptive explanation tailored with specific math/rationale from inputs)
3. annualSavingKg (Estimated Annual CO₂ Reduction in kg, integer)
4. difficulty ("Easy", "Medium", "Hard")
5. costImpact ("Free", "Low", "Medium", "High")
6. environmentalEquivalent (Environmental Equivalent explanation)
7. priorityScore (Priority Score between 1 and 10 based on maximum achievable impact vs difficulty)

Sort recommendations strictly by maximum achievable priority score. Keep advice realistic and achievable.
Format the output strictly as a JSON list of objects.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["recommendations"],
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "whyItMatters", "annualSavingKg", "difficulty", "costImpact", "environmentalEquivalent", "priorityScore"],
                properties: {
                  title: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  annualSavingKg: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING },
                  costImpact: { type: Type.STRING },
                  environmentalEquivalent: { type: Type.STRING },
                  priorityScore: { type: Type.INTEGER },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      highestSector: highestSector.toUpperCase(),
      highestPct,
      recommendations: parsed.recommendations || getFallbackRecommendations(highestSector, breakdown, totalAnnualCo2Kg),
      isFallback: false,
    });
  } catch (error: any) {
    console.error("Gemini API error in /api/reduction-coach:", error);
    return res.json({
      highestSector: highestSector.toUpperCase(),
      highestPct,
      recommendations: getFallbackRecommendations(highestSector, breakdown, totalAnnualCo2Kg),
      isFallback: true,
      errorDetails: error.message,
    });
  }
});

// ENDPOINT 2: AI Weekly Report Generator
app.post("/api/weekly-report", async (req, res) => {
  const { logs, totalPoints, currentLevel } = req.body;
  const ai = getGenAI();

  if (!logs) {
    return res.status(400).json({ error: "Missing activity logs" });
  }

  const savedCo2ThisWeek = logs.reduce((sum: number, l: any) => sum + l.savedCo2Kg, 0);

  if (!ai) {
    // Structured static fallback report
    const topCategory = logs[0]?.category || "sustainable transport";
    const reportText = `### Your Weekly Carbon Summary Report

This week, you put down an amazing carbon reduction trend! 

* **Saved CO₂:** **${savedCo2ThisWeek.toFixed(1)} kg** of carbon emissions prevented.
* **Top Contributor:** ${logs[0]?.actionTitle || "Active carbon tracking log inputs"}.
* **Most Active Category:** **${topCategory.toUpperCase()}** actions.
* **Potential Next Saving:** Upgrade to home LED bulbs and shift your heating thermostat by exactly 1.5°C to save another **150 kg** of CO₂ per year!

*Keep up the stellar ecological momentum, Eco Creator Level ${currentLevel}!*`;

    return res.json({ report: reportText, isFallback: true });
  }

  try {
    const prompt = `
You are the EcoPilot AI Advisor. Analyze the user's weekly activity log:
- Actions logged this week: ${JSON.stringify(logs.slice(0, 10))}
- Cumulative points/XP: ${totalPoints} (Level ${currentLevel})
- Net CO2 saved this week: ${savedCo2ThisWeek} kg

Generate a highly personalized, friendly, and motivating weekly report of about 150 words using Markdown.
Include:
1. Exact total CO2 saved this week (e.g. "${savedCo2ThisWeek.toFixed(1)} kg").
2. Recognition of their top contributor action.
3. Their most active day or category.
4. Suggestions for a "potential next saving" related to their logs.

Make the tone professional, scannable, and extremely clean. Use bullet points and bold headers.
Do not output self-praising or flowery adjectives about yourself.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return res.json({ report: response.text || "Empty report generated", isFallback: false });
  } catch (error: any) {
    console.error("Gemini API error in /api/weekly-report:", error);
    return res.json({
      report: `### Your Weekly Carbon Summary Report (Fallback)
      
* **Total Saved:** **${savedCo2ThisWeek.toFixed(1)} kg** of greenhouse gases.
* **Streak Status:** You logged ${logs.length} sustainable habits.
* **Top Contributor:** ${logs[0]?.actionTitle || "Unplugging idle electrical systems"}`,
      isFallback: true,
    });
  }
});

// ENDPOINT 3: AI Challenge Generator
app.post("/api/challenge-generator", async (req, res) => {
  const { highestSector } = req.body;
  const ai = getGenAI();

  if (!ai) {
    return res.json({
      challenges: getFallbackChallenges(highestSector || "transport"),
      isFallback: true,
    });
  }

  try {
    const sector = highestSector || "transport";
    const prompt = `
You are an environmental behavior coach.
Based on the user's largest emission source: "${sector}", generate exactly 2 personalized, highly interactive and unique carbon reduction quests/challenges.

Rules:
- Duration between 3 and 14 days
- Must be measurable
- Must reduce carbon emissions
- Must be achievable

For each challenge, output a JSON object containing:
- title (Challenge Name - strong, motivating name)
- description (active and detailed goal description)
- category ("transport", "energy", "diet", "consumption")
- points (XP reward, integer e.g., 150 to 300)
- savedCo2ExpectedKg (estimated kg CO₂ Saved, number)
- daysRequired (Duration, integer days e.g. 3 to 14)
- successCriteria (measurable success criteria e.g. "Ride subway for commutes 4 separate days")
- motivationalMessage (Motivational Message - positive, Duolingo-style encouragement)

Return exactly a JSON list of objects under the key "challenges".
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["challenges"],
          properties: {
            challenges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "category", "points", "savedCo2ExpectedKg", "daysRequired", "successCriteria", "motivationalMessage"],
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                  savedCo2ExpectedKg: { type: Type.NUMBER },
                  daysRequired: { type: Type.INTEGER },
                  successCriteria: { type: Type.STRING },
                  motivationalMessage: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      challenges: parsed.challenges || getFallbackChallenges(sector),
      isFallback: false,
    });
  } catch (error: any) {
    console.error("Gemini error in /api/challenge-generator:", error);
    return res.json({
      challenges: getFallbackChallenges(highestSector || "transport"),
      isFallback: true,
    });
  }
});

// ENDPOINT 4: Smart Home Energy Dashboard Trend Analysis
app.post("/api/smart-home-analysis", async (req, res) => {
  const { trendData } = req.body; // array of { month: string, kwh: number }
  const ai = getGenAI();

  if (!trendData || trendData.length < 2) {
    return res.status(400).json({ error: "Missing trend data points" });
  }

  const latestIndex = trendData.length - 1;
  const currentMonthKwh = trendData[latestIndex].kwh;
  const prevMonthKwh = trendData[latestIndex - 1].kwh;
  const percentChange = Math.round(((currentMonthKwh - prevMonthKwh) / prevMonthKwh) * 100);

  if (!ai) {
    const fallbackData = getRulesSmartHomeRecommendations(percentChange);
    return res.json({
      explanation: fallbackData.explanation,
      recommendations: fallbackData.tips,
      trendPct: percentChange,
      isFallback: true,
    });
  }

  try {
    const prompt = `
You are an energy efficiency expert.
Analyze monthly electricity usage.

Detect:
- unusual spikes
- seasonal patterns
- inefficient trends

Provide:
1. Key Finding & Possible Cause (explanation)
2. Suggested Actions and Estimated Savings (exactly 3 items as recommendations list)

Keep explanation under 150 words.
Return a JSON object with:
- explanation (Key Finding & Possible Cause analysis under 150 words)
- recommendations (list of exactly 3 clean, highly actionable recommendation strings)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["explanation", "recommendations"],
          properties: {
            explanation: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      explanation: parsed.explanation,
      recommendations: parsed.recommendations,
      trendPct: percentChange,
      isFallback: false,
    });
  } catch (error: any) {
    console.error("Gemini/api/smart-home-analysis error:", error);
    const fallbackData = getRulesSmartHomeRecommendations(percentChange);
    return res.json({
      explanation: fallbackData.explanation,
      recommendations: fallbackData.tips,
      trendPct: percentChange,
      isFallback: true,
    });
  }
});

// ENDPOINT 5: Active Chatbot proxy
app.post("/api/chat", async (req, res) => {
  const { messages, userFootprint } = req.body;
  const ai = getGenAI();

  if (!messages) {
    return res.status(400).json({ error: "Missing message history" });
  }

  if (!ai) {
    // Dynamic rule fallback
    const lastUserQuery = messages[messages.length - 1]?.text || "";
    const lowercase = lastUserQuery.toLowerCase();
    let replyText = "I stand ready to help you analyze your carbon footprint! Try asking about smart solar panels, plant-based diets, composting scraps, public transport, or carbon offset sponsored windfarms.";
    
    if (lowercase.includes("diet") || lowercase.includes("meat") || lowercase.includes("food") || lowercase.includes("vegan")) {
      replyText = "Transitioning to plant food directly mitigates nitrous oxide and methane emissions from cattle operations. Substituting red meat with soy, grains, or beans saves up to 1,200 kg CO2 per person annually.";
    } else if (lowercase.includes("car") || lowercase.includes("transport") || lowercase.includes("metro") || lowercase.includes("flight")) {
      replyText = "A single flight hour emits about 95 kg CO2 per passenger. Replacing short-haul flights with high-speed rail, or commuting by train rather than a standard internal combustion car, reduces your daily transport load by 70%.";
    } else if (lowercase.includes("compost") || lowercase.includes("recycle") || lowercase.includes("waste")) {
      replyText = "When organic kitchen scraps decay in landfills, they decompose anaerobically, creating methane gas which is far more harmful over short periods than CO2. Composting ensures aerobic carbon-binding into rich soil.";
    } else if (lowercase.includes("electricity") || lowercase.includes("solar") || lowercase.includes("heating") || lowercase.includes("energy")) {
      replyText = "Grid-interfaced community solar subscriptions are a quick way to bypass solar roof costs while receiving the benefits of renewable energy. Also, switching laundry washes from hot to cold water prevents substantial boiler energy waste.";
    }

    return res.json({ text: replyText, isFallback: true });
  }

  try {
    const instructions = `
You are EcoPilot AI.
Your role is to help users reduce their carbon footprint.

Always prioritize:
1. Practical actions
2. Personalized recommendations matching their parameters
3. Scientific accuracy
4. Positive motivation

When suggesting actions:
- quantify impact whenever possible (using metrics in kg CO2)
- avoid guilt-based language
- recommend realistic behavior changes

Use simple language. Keep explanations conversational, clean, and direct.

User current footprint metadata:
${userFootprint ? JSON.stringify(userFootprint) : "No assessment submitted yet."}

Keep your responses conversational and under 150 words.
`;

    const geminiPayload = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: instructions }] },
        ...geminiPayload
      ],
    });

    return res.json({ text: response.text || "I am processing your climate metrics. How else can I guide you?", isFallback: false });
  } catch (error: any) {
    console.error("Gemini API error in /api/chat:", error);
    return res.json({
      text: "I encountered a minor grid connectivity issue. To keep your momentum, recall that bicycling 10km instead of driving saves exactly 2.2 kg of CO₂ emissions!",
      isFallback: true,
    });
  }
});

// ENDPOINT 6: AI Carbon Reduction Roadmap Generator
app.post("/api/roadmap-generator", async (req, res) => {
  const { currentFootprintKg, targetPercent, timelineMonths, highestSector, breakdown } = req.body;
  const ai = getGenAI();

  const months = timelineMonths || 4;
  const targetSaveKg = Math.round((currentFootprintKg || 4800) * ((targetPercent || 20) / 100));

  if (!ai) {
    const roadmap = getFallbackRoadmap(months, targetSaveKg, highestSector || "transport", breakdown || { transport: 2400 });
    return res.json({
      roadmap,
      targetSaveKg,
      isFallback: true,
    });
  }

  try {
    const prompt = `
You are EcoPilot AI.
Generate a month-by-month carbon reduction roadmap.

Input specifications:
- Current annual footprint: ${currentFootprintKg || 4800} kg CO2
- Desired Target Reduction: ${targetPercent || 20}% (Total saving goal of ${targetSaveKg} kg CO2)
- Timeline: ${months} Months
- Highest emission sector: ${highestSector || "transport"}
- Footprint details: ${JSON.stringify(breakdown || {})}

Output:
A detailed monthly action plan of exactly ${months} elements, ordered sequentially from monthIndex 1 to ${months}.
For each month, provide:
- monthIndex (integer 1, 2, ...)
- label (e.g., "Month 1", "Month 2")
- primaryAction (Primary action name, short active title e.g. "Ditch Solo Commutes")
- description (difficulty/habit implementation details under 25 words)
- estimatedReductionKg (realistic monthly equivalent saving in kg, summing up closer to target average thresholds)
- difficulty ("Easy", "Medium", "Hard")
- progressMilestone (motivating milestone description e.g. "Save 45kg CO2, Level Up!")

Return a JSON object with a single list under the key "roadmap". Sort by monthIndex.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["roadmap"],
          properties: {
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["monthIndex", "label", "primaryAction", "description", "estimatedReductionKg", "difficulty", "progressMilestone"],
                properties: {
                  monthIndex: { type: Type.INTEGER },
                  label: { type: Type.STRING },
                  primaryAction: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedReductionKg: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING },
                  progressMilestone: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      roadmap: parsed.roadmap || getFallbackRoadmap(months, targetSaveKg, highestSector, breakdown),
      targetSaveKg,
      isFallback: false,
    });
  } catch (error: any) {
    console.error("Gemini error in /api/roadmap-generator:", error);
    return res.json({
      roadmap: getFallbackRoadmap(months, targetSaveKg, highestSector, breakdown),
      targetSaveKg,
      isFallback: true,
    });
  }
});

// Rules-based smart house diagnostics generator
function getRulesSmartHomeRecommendations(percentChange: number) {
  let explanation = "";
  let tips = [];
  if (percentChange > 0) {
    explanation = `Energy Audit Warning: Household electric usage upticked by ${percentChange}% compared to last month. Analysis shows heating/ventilation cooling cycles and appliance phantom power leakage represent major contributors.`;
    tips = [
      "Unplug main home entertainment grids and office setups on smart power strips to save standby power.",
      "Shift heating thermostats down by 1.5°C in cold weather or cooling thresholds up by 1.5°C in summer.",
      "Swap high-temperature clothes drying cycles for air-drying techniques to bypass heating elements.",
    ];
  } else {
    explanation = `Sustained smart home optimization! Power demand decreased by ${Math.abs(percentChange)}% compared to last period, showing excellent behavioral climate-positive control.`;
    tips = [
      "Transition kitchen and garage recess bulbs directly to high-efficiency micro-LED units.",
      "Run major washing cycles strictly on cold-water modes, avoiding heating boiler draw.",
      "Check refrigerator seal templates to avoid compressor cycle extension."
    ];
  }
  return { explanation, tips };
}

// Helper fallbacks for reduction recommendations
function getFallbackRecommendations(sector: string, breakdown: any, total: number) {
  const genericRecommendations = {
    transport: [
      {
        title: "Replace Car Commuting with Light Rail",
        whyItMatters: `Your transportation emissions account for ${breakdown.transport} kg of carbon. By swapping just 2 commutes per week from single-occupant driving to public transit, you bypass combustion and save fuel expense.`,
        annualSavingKg: 320,
        difficulty: "Easy",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to planting 15 mature native trees.",
        priorityScore: 9,
      },
      {
        title: "Swap Regional Flights for Eco Rail",
        whyItMatters: "Bypassing high-altitude jet turbine fuel combustion by traveling via intercity express trains reduces travel carbon by up to 88% per passenger kilometer.",
        annualSavingKg: 450,
        difficulty: "Medium",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to saving 98 gallons of premium gasoline fuel.",
        priorityScore: 8,
      },
      {
        title: "Telecommute 2 Days per Week",
        whyItMatters: "Eliminating vehicle travel by working from home saves immediate tailpipe fuel emissions, oil consumption, and vehicle toll rates.",
        annualSavingKg: 280,
        difficulty: "Easy",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to avoiding 650 miles of traditional car driving.",
        priorityScore: 7,
      },
    ],
    energy: [
      {
        title: "Transition to Green Community Solar Tariffs",
        whyItMatters: `Your home power emissions constitute ${breakdown.energy} kg CO2. Subscribing to a local community solar provider allows solar production credits to subtract fossil fuel mix from the local grid.`,
        annualSavingKg: 850,
        difficulty: "Easy",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to removing 1,900 lbs of burnt coal from the environment.",
        priorityScore: 10,
      },
      {
        title: "Install Smart Programmable Thermostat",
        whyItMatters: "Automating home temperature levels so heating scales down 3°C during sleep or away hours prevents unnecessary furnace or electrical heater cycling.",
        annualSavingKg: 190,
        difficulty: "Easy",
        costImpact: "Low Cost",
        environmentalEquivalent: "Equivalent to driving 450 miles fewer in a gas car.",
        priorityScore: 8,
      },
      {
        title: "Deploy Cold-Water Washing Settings",
        whyItMatters: "Up to 90% of a laundry washing machine's electrical power usage is spent heating the water. Cold detergents clean fabrics perfectly at a fraction of energy load.",
        annualSavingKg: 110,
        difficulty: "Easy",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to preserving 5 mature trees in high growth phases.",
        priorityScore: 9,
      },
    ],
    diet: [
      {
        title: "Incorporate Midweek Vegetarian Meals",
        whyItMatters: `With dietary emissions totaling ${breakdown.diet} kg, replacing meat with plant-based soy, grains, or lentil proteins 3 days a week bypasses methane-heavy production lines.`,
        annualSavingKg: 520,
        difficulty: "Easy",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to planting 24 trees' annual bio-sequestration capacity.",
        priorityScore: 9,
      },
      {
        title: "Plan Zero Waste Meal Preps",
        whyItMatters: "Around 30% of global food is wasted. Buying only what is consumed and freezing leftovers prevents the organic degradation of kitchen waste into landfill methane gas.",
        annualSavingKg: 180,
        difficulty: "Easy",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to bypassing 15 days of residential garbage generation.",
        priorityScore: 8,
      },
      {
        title: "Increase Regional Farm Sourcing",
        whyItMatters: "Choosing seasonal vegetables and items distributed locally from surrounding farm networks reduces the intercontinental truck and air shipping logistics load.",
        annualSavingKg: 95,
        difficulty: "Easy",
        costImpact: "Low Cost",
        environmentalEquivalent: "Equivalent to saving 11 gallons of diesel shipping fuel.",
        priorityScore: 7,
      },
    ],
    consumption: [
      {
        title: "Transition to a 'Buy Second-Hand' Habit",
        whyItMatters: `Manufacturing and shipping new goods accounts for ${breakdown.consumption} kg of carbon. Consistently purchasing high-quality thrifted goods halves this output.`,
        annualSavingKg: 640,
        difficulty: "Easy",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to saving 2,500 kilowatt-hours of industrial machinery energy.",
        priorityScore: 9,
      },
      {
        title: "Repair Electronics and Match Apparel",
        whyItMatters: "Extending the life of electronic gear and clothing items halts immediate mine extraction and offshore carbon production processing loop.",
        annualSavingKg: 210,
        difficulty: "Medium",
        costImpact: "Saves Money",
        environmentalEquivalent: "Equivalent to bypassing 3 standard electronic landfill items.",
        priorityScore: 8,
      },
      {
        title: "Initiate Household Organic Composting Unit",
        whyItMatters: "Composting breaks down food peels, coffee grounds, and yard clippings aerobically, yielding healthy soil rather than landfill greenhouse methane emissions.",
        annualSavingKg: 120,
        difficulty: "Easy",
        costImpact: "Low Cost",
        environmentalEquivalent: "Equivalent to 1,500 smartphone battery charge sessions.",
        priorityScore: 8,
      },
    ],
  };

  return (genericRecommendations as any)[sector] || genericRecommendations.transport;
}

function getFallbackChallenges(sector: string) {
  const dynamicQuests = {
    transport: [
      {
        title: "7-Day Transit Champion",
        description: "Trade your private car commutes for public buses or subways on your next 4 active transit routes.",
        category: "transport",
        points: 220,
        savedCo2ExpectedKg: 16.5,
        daysRequired: 4,
        successCriteria: "Commute strictly using public bus or train 4 times.",
        motivationalMessage: "Duolingo says: Trade those keys for transit trees, you are protecting the breeze!",
      },
      {
        title: "Sub-5km Bike Commuter Quest",
        description: "Ride a mechanical bicycle or electric bike for any local store chores under 5 kilometers.",
        category: "transport",
        points: 180,
        savedCo2ExpectedKg: 12.0,
        daysRequired: 3,
        successCriteria: "Bicycle or walk for all trips under 5km for 3 separate activities.",
        motivationalMessage: "Feel the leg burn, save the earth! Every pedal counts.",
      },
    ],
    energy: [
      {
        title: "Phantom Grid Killer",
        description: "Unplug high-draw entertainment boards, gaming systems, and smart kitchen displays before bed for 5 consecutive nights.",
        category: "energy",
        points: 150,
        savedCo2ExpectedKg: 3.5,
        daysRequired: 5,
        successCriteria: "Cut standby phantom power loads by shutting down power boards for 5 nights.",
        motivationalMessage: "Disconnect those outlets while you count sheep! Save power in your sleep.",
      },
      {
        title: "Cold Water Laundry Star",
        description: "Execute 3 separate laundry cycles on the Cold Temp setting to save hot water heating energy.",
        category: "energy",
        points: 180,
        savedCo2ExpectedKg: 4.8,
        daysRequired: 3,
        successCriteria: "Complete 3 full laundry washes using only the cold washer cycle.",
        motivationalMessage: "Washing on cold keeps fibers fresh and carbon down! Clean and green.",
      },
    ],
    diet: [
      {
        title: "Week of Plant-Based Lunches",
        description: "Cook or purchase zero-meat (vegetarian or vegan) nutrient-rich plant plates for 5 lunches in a row.",
        category: "diet",
        points: 250,
        savedCo2ExpectedKg: 18.0,
        daysRequired: 5,
        successCriteria: "Maintain consecutive plant-sourced vegetarian or vegan lunch meals for 5 weekdays in a row.",
        motivationalMessage: "Plant power activates! Your plate holds the easiest climate key.",
      },
      {
        title: "Planned Plate - No Waste Challenge",
        description: "Finish all leftovers and prepare only the groceries you fully intend to eat for 4 days.",
        category: "diet",
        points: 160,
        savedCo2ExpectedKg: 8.5,
        daysRequired: 4,
        successCriteria: "Log exactly zero food waste across 4 consecutive home meal sessions.",
        motivationalMessage: "Empty plates, happy planet! Keep organic scraps out of the landfill drawer.",
      },
    ],
    consumption: [
      {
        title: "Thrift & Rewear Target",
        description: "Acquire any necessary apparel or accessories solely from secondhand stores or reuse cycles for 2 needed updates.",
        category: "consumption",
        points: 200,
        savedCo2ExpectedKg: 22.0,
        daysRequired: 2,
        successCriteria: "Procure remaining textile additions exclusively from secondhand thrift or trade cycles.",
        motivationalMessage: "Circular threads beat chemical synthetic lines! Thrift is chic and green.",
      },
      {
        title: "Soil Alchemist Composting",
        description: "Redirect organic peel scraps and tea bags away from landfills and into a composting system for 5 days.",
        category: "consumption",
        points: 170,
        savedCo2ExpectedKg: 9.0,
        daysRequired: 5,
        successCriteria: "Segregate organic items on 5 separate cooking log events. No compostables into standard trash.",
        motivationalMessage: "Transform scraps into black gold! Soil chemistry says: dynamic!",
      },
    ],
  };

  return (dynamicQuests as any)[sector] || dynamicQuests.transport;
}

function getFallbackRoadmap(months: number, targetSaveKg: number, highestSector: string, breakdown: any) {
  const steps = [
    {
      monthIndex: 1,
      label: "Month 1",
      primaryAction: "Swap to public transit commuting",
      description: "Ditch single-driver car commutes twice weekly for local light rail/transit lines.",
      estimatedReductionKg: Math.round(targetSaveKg * 0.25),
      difficulty: "Easy",
      progressMilestone: "Transit milestone locked!",
    },
    {
      monthIndex: 2,
      label: "Month 2",
      primaryAction: "Introduce vegetarian lunch weeks",
      description: "Eat plant-rich veggie/vegan dishes for corporate lunch sessions.",
      estimatedReductionKg: Math.round(targetSaveKg * 0.25),
      difficulty: "Easy",
      progressMilestone: "Food system optimized!",
    },
    {
      monthIndex: 3,
      label: "Month 3",
      primaryAction: "Kill standby power draw",
      description: "Unplug home gaming hubs and appliances during sleep to eliminate phantom watts.",
      estimatedReductionKg: Math.round(targetSaveKg * 0.20),
      difficulty: "Easy",
      progressMilestone: "Smart energy master!",
    },
    {
      monthIndex: 4,
      label: "Month 4",
      primaryAction: "Transition to thrift shopping",
      description: "Ensure lifestyle textile updates are sourced from secondary thrift loops.",
      estimatedReductionKg: Math.round(targetSaveKg * 0.30),
      difficulty: "Medium",
      progressMilestone: "Circular economy locked!",
    }
  ];

  // Adjust output length to match requested months
  if (months <= 4) {
    return steps.slice(0, months);
  } else {
    // scale steps
    const extendedSteps = [...steps];
    for (let i = 5; i <= months; i++) {
      extendedSteps.push({
        monthIndex: i,
        label: `Month ${i}`,
        primaryAction: "Upgrade residential light grids",
        description: "Swap remaining home halogen recesses with high-efficiency LEDs.",
        estimatedReductionKg: Math.round(targetSaveKg / months),
        difficulty: "Easy",
        progressMilestone: "Progressing toward Net Zero!",
      });
    }
    return extendedSteps;
  }
}

// -------------------------------------------------------------
// VITE AND STATIC ASSETS HANDLERS
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware integration for live client-side HMR proxying
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving from bundled dist directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EcoPilot AI Server] listening on http://localhost:${PORT}`);
  });
}

startServer();
