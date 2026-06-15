# Carbon Footprint Tracker — Architectural & Technical Documentation

This document records the exact system architecture, mathematical methodologies, custom components, and gamified mechanisms designed and implemented for the **Carbon Footprint Tracker**.

---

## 1. Application Architecture

To avoid massive file singletons prone to tokens clipping, the workspace was organized into an elegant, scalable, and modular structure:

*   `/src/types.ts`: Holds shared, strongly-typed TypeScript interfaces representing footprints, logs, quests, badges, and state packages.
*   `/src/data/footprintConstants.ts`: Stores standard carbon conversion factors (according to IPCC and EPA parameters), initial default lists of challenges/achievements, and loggable daily actions.
*   `/src/components/CustomChart.tsx`: Core visual metrics suite hosting three high-fidelity, interactive, custom SVG-based animated charts (Horizontal Benchmark, Sector Breakdown Circle, and Weekly Savings Bezier Area curve).
*   `/src/components/Calculator.tsx`: Complete multiphase quiz system (Transport, Energy, Diet, Consumption) with fluid sliders and inputs.
*   `/src/components/Logger.tsx`: Daily activity log center with categorized filter cards, custom note slots, and real-time XP tallies.
*   `/src/components/Insights.tsx`: Personalized, rules-based intelligence scanner and educational Advisor Chat system.
*   `/src/App.tsx`: The primary state controller, orchestrating tab routing, levels scaling math, reactive check triggers, browser `localStorage` syncing, and our Offset Bazaar.

---

## 2. Emission Calculations & Factors (IPCC/EPA Guidelines)

All conversions use real-world environmental constants, expressed in kilograms of CO₂ equivalent ($kg\text{ CO}_2e$) per unit:

### A. Transportation Sector (Scope 1 Emissions)
*   **Private Driving:**
    $$\text{Annual } CO_2 = \text{weekly } km \times \text{fuel factor} \times 52$$
    *   *Gasoline:* $0.185 \text{ kg CO}_2 / km$
    *   *Diesel:* $0.170 \text{ kg CO}_2 / km$
    *   *Hybrid:* $0.095 \text{ kg CO}_2 / km$
    *   *Electric:* $0.035 \text{ kg CO}_2 / km$ (Grid charge lifecycle average)
*   **Public Transit:** $0.045 \text{ kg CO}_2 / km$
*   **Aviation:** $95.0 \text{ kg CO}_2$ per passenger flight hour

### B. Home Energy (Scope 2 & Standard Heating Scopes)
*   **Electricity Draw:**
    $$\text{Net Electricity } CO_2 = (\text{monthly } kWh \times 12 \times 0.380) \times (1 - \frac{\text{renewable percentage}}{100})$$
    *   Grid intensity coefficient is $0.380 \text{ kg CO}_2 / kWh$ (global average mix).
*   **Residential Heating:**
    $$\text{Heating } CO_2 = \text{monthly } kWh \times 12 \times \text{fuel factor}$$
    *   *Natural Gas:* $0.181 \text{ kg CO}_2 / kWh$
    *   *Heating Oil:* $0.264 \text{ kg CO}_2 / kWh$
    *   *Electricity (Baseboards):* $0.380 \text{ kg CO}_2 / kWh$
    *   *Wood Biomass:* $0.035 \text{ kg CO}_2 / kWh$

### C. Dietary Impact (Agriculture Scopes)
Baseline coefficients represent average annual footprints in kg CO₂ per person:
*   *Meat-Heavy:* $3100 \text{ kg/year}$
*   *Balanced Mix:* $2100 \text{ kg/year}$
*   *Low-Meat / Flexitarian:* $1500 \text{ kg/year}$
*   *Vegetarian:* $1100 \text{ kg/year}$
*   *Vegan (Strictly plant-based):* $650 \text{ kg/year}$
*   **Discounts/Tolls:** Up to $-10\%$ reduction applied for $100\%$ local food sourcing. Food wastes reflect $+25\%$ (high waste) or $-10\%$ (low waste) corrections.

### D. Shopping & Waste Circle
*   *Retail Shopping Habits:*
    *   *Minimalist:* $550 \text{ kg/year}$
    *   *Average:* $1400 \text{ kg/year}$
    *   *Frequent Retail (Fast Fashion, Tech):* $3200 \text{ kg/year}$
*   **Separation credits:** Up to $-20\%$ subtraction on shopping base for active recycling. Dynamic credit of $-150 \text{ kg/year}$ applied if residential composting is switched on.

---

## 3. High-Fidelity Custom Charts (Framer Motion & SVGs)

Rather than risking external graphing libraries triggering build, layout, or hydration issues relative to React 19, we coded high-end custom SVGs engineered to run cleanly on all viewports:

1.  **Horizontal Regional Comparison:** Standardizes the user's footprint against global reference marks. Bars expand smoothly with staggered delays, and values are color-coded to denote relative efficiency.
2.  **Radial Segment breakdown Ring:** Concentric segments indicating exactly where emissions lie. Segment strokes calculations use custom circumference dash offsets. Segment hover interactions feed state variables back to focus the labels centerpiece.
3.  **Weekly Bezier Area Savings Chart:** Calculates active dates, queries matching logged savings, and plots coordinates. Uses automated Bezier coordinates (`C` parameters in SVG path nodes) to draw curves with color gradients fading to transparent underneath, augmented by responsive tooltip nodes.

---

## 4. Gamified Circles & Offset Economy

The dashboard incentivizes long-term daily lifestyle audits using nested games:

### A. Experience Levels & Tier Scaling
*   Standard XP needed for level up rises with user level ($250 \times \text{level} + 50$).
*   Completing logs or finishing quests awards XP. When a level-up is met, the system plays a fullscreen celebratory modal.

### B. Quest Challenges & Achievements
*   Includes modular tracker metrics (e.g., *Car-Free Commuter*, *Green Plate*). Completing specific daily actions automatically increments respective quest goals in real-time.
*   Achievements check for background milestones (e.g., logging 1 action, saving over 50kg, or completing 3 quests) and dynamically awards unlocked badges on the profile.

### C. Circular Offset Bazaar (Sponsorships)
*   Points earned from climate-saving logs act as virtual currency.
*   Users can "purchase" high-leverage environmental offset sponsorships:
    *   *Andes reforestation:* Plants high-altitude native saplings ($150\text{ XP}$ cost, saves $20\text{kg CO}_2$ immediately).
    *   *Clean cookstoves:* Prevents forest clearance ($300\text{ XP}$ cost, saves $50\text{kg CO}_2$ immediately).
    *   *Micro-wind turbine:* Decentralizes remote grid lines ($500\text{ XP}$ cost, saves $100\text{kg CO}_2$ immediately).
*   Purchases deduct points and expand cumulative offsets on the user profile.

---

## 5. Persistence

State is bound to the `localStorage` keyword `ECO_FOOTPRINT_USER_STATE_2026`. This enables completely persistent progress across page reloads. Users can also reset their metrics instantly using the trash utility icon in the header.
