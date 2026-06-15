# EcoPilot AI — Carbon Footprint Tracker & Reduction Assistant

EcoPilot AI is a comprehensive web platform designed to help individuals measure, understand, and systematically reduce their environmental impact. By combining multi-sector emission calculation, real-time interactive simulations, gamified reward loops, and personalized action roadmaps, EcoPilot AI converts abstract environmental data into a guided personal sustainability journey.

---

## 🌟 Key Pillars

- **Measure:** Complete a granular multiphase assessment covering transport, dietary, utility, and shopping sectors.
- **Understand:** Visualize emission distributions with responsive custom radial charts and historical Smart Home electricity grids calibrated against IPCC and US EPA standards.
- **Reduce:** Experiment with lifestyle adjustments using an interactive dynamic simulator, get curated advisory recommendations, and access month-by-month reduction timelines.
- **Track:** Log daily carbon-saving choices, earn experience points (XP), complete eco-challenges, and sponsor verified offset projects.

---

## 🛠️ Key Features

### 1. 📋 Granular Carbon Calculator
A multi-stage, interactive onboarding quiz that profiles your lifestyle in four key sectors:
- **Transportation:** Weekly driving mileage, fuel fuel-type efficiency, public transit mileage, and annual aviation hours.
- **Dietary Habits:** Choice-based profiles (Meat-heavy, Flexitarian, Vegetarian, Vegan) adjusted for local sourcing percentages and food waste tendencies.
- **Home Energy:** Monthly electricity grid usage, heating fuel types (Natural Gas, Oil, Electricity, Biomass), and renewable energy offsets.
- **Shopping & Waste:** Consumption frequency indices paired with active household recycling and composting credits.

### 2. 🎚️ What-If Scenario Simulator
An interactive control board that lets you immediately simulate the combined carbon-saving effects of switching to lower-emission alternatives:
- transitioning to a plant-based diet,
- installing solar panels,
- switching to low-carbon commuting option (EV / cycling),
- activating home compost structures,
- practicing conscious physical circular consumption.
*Instantly renders side-by-side projected carbon totals, environmental grade improvements, and live feedback.*

### 3. 📊 Interactive Visual Insights & Carbon Twin
Beautiful custom-built SVG visualizations engineered for multi-viewport compatibility:
- **Concentric Sector Breakdown Ring:** Interactive segments representing exactly where your annual emissions originate.
- **Comparative Benchmarking:** A horizontal tracker mapping your annual footprint against the global per-capita average and the United Nations IPCC sustainable target to halt warming (2.0t CO₂e).
- **Digital Twin Visualizer:** Renders "Current You" vs. "Eco You" side-by-side to visibly outline achievable optimized footprints.

### 4. ⚡ Smart Home Electricity Diagnostic Panel
Includes a visual dashboard charting multi-month electricity consumption. The accompanying analysis engine diagnoses standby phantom loads, HVAC spikes, and thermal usage patterns to suggest actionable household utility efficiency fixes.

### 5. 🗺️ Personalized Roadmaps & Challenge Engine
- **Month-by-Month Timelines:** Interactively maps a staged monthly ecological pathway based on your desired timeline (3–12 months) and targeted reduction goals (5%–50%).
- **Eco Challenge Board:** Displays interactive campaign quests (such as "Car-Free Week" or "Locavore Feast") analyzed and updated dynamically based on your heaviest-emitting lifestyle sectors.

### 6. 🏆 Streak Engine, Daily Logger & Virtual Offset Bazaar
- **Action Logger:** Log daily green choices in a categorized registry (Diet, Transit, Home, Conscious Choice) to earn points and XP.
- **Habit Streaks:** Built-in streak trackers reward daily engagement with bonus XP, milestones, and status levels.
- **Virtual Offset Bazaar:** Exchange earned activity credits to virtually sponsor high-impact conservation pathways (e.g., Andes reforestation, clean cookstoves, or remote wind turbines) and expand your global carbon offsets.

---

## 📐 Scientific Formulae & Constants

All calculations are calibrated against validated global indices:
- **Transportation:** Private driving emissions are calculated via fuel density parameters ($0.185 \text{ kg CO}_2/km$ for gasoline; $0.035 \text{ kg CO}_2/km$ for EV lifecycle). Flights are estimated at $95.0 \text{ kg CO}_2$ per hour.
- **Home Utilities:** Calculated at $0.380 \text{ kg CO}_2/kWh$ for general grid electricity, offset by proportioned renewable energy configurations.
- **EPA Equivalency Factors:** Converts absolute carbon mass into intuitive real-world equivalents:
  - **Mature Trees:** $\text{CO}_2 \text{ kg} / 22$ (annual absorption equivalent of an active pine tree).
  - **Gasoline Saved:** $\text{CO}_2 \text{ kg} / 2.3$ (average chemical density).
  - **Smartphone Charges:** $\text{CO}_2 \text{ kg} \times 120$ (relative electrical battery capacity).

---

## 🛠️ Technical Implementation

- **Frontend:** React 19, TypeScript, Tailwind CSS, Framer Motion (`motion/react`) for layout transition animations.
- **Backend:** Node.js, Express, server-side environment configurations.
- **Data Safety:** Client-side state is synchronized to `localStorage` keying (`ECO_FOOTPRINT_USER_STATE_2026`) for persistent offline tracking.

---

## 💻 Local Development

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### Setup Instructions

1. **Clone the project & install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file at the root in accordance with `.env.example`:
   ```env
   # .env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

4. **Production Build:**
   Compile both the client bundle and compiled server build to the `dist/` directory:
   ```bash
   npm run build
   ```
   To launch the compiled server on port 3000:
   ```bash
   npm start
   ```

---

## 📄 License
This project is open-source and free for educational or personal use.
