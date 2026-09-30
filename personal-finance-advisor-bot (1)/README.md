# Personal Finance Advisor Bot 💰🤖

An AI-powered personal financial planning assistant designed to help individuals take control of their finances with clarity and confidence. The platform integrates real-time income and expense tracking, category envelope budgeting (50/30/20 rule), goal-based savings, natural language transaction logging, a "Can I Afford This?" purchase simulator, and deep spending diagnostics powered by Gemini 3.8 Flash.

---

## 🌟 Key Features

- **Executive Financial Dashboard**: Real-time tracking of monthly income inflow, expense outflow, net cash flow surplus/deficit, and savings rate.
- **Financial Health Score (0–100)**: Autonomous diagnostic rating assessing savings rate, emergency reserve adequacy, budget variance, and discretionary discipline.
- **Dynamic 50/30/20 Budget Envelopes**: Automated comparison between actual spending in Needs (Essentials), Wants (Lifestyle), and Savings vs. persona benchmarks, with an AI auto-balancer.
- **AI Natural Language Quick-Log**: Type entries like *"Dinner with team at Chipotle $32.50 yesterday"* or *"Bought textbooks $79.99"* — the AI automatically extracts the description, amount, category, and date.
- **Overspending Alert System**: Highlights categories exceeding limits with actionable reduction advice.
- **Goal-Based Savings Tracker**: Visual milestone meters, target completion dates, and monthly required pace calculators for emergency funds, vacations, tech upgrades, and debt payoffs.
- **Interactive AI Advisor Bot**: Chat directly with a context-aware financial advisor grounded in your exact live balances and category budgets.
- **"Can I Afford This?" Purchase Simulator**: Stress-tests potential purchases before you buy, returning a verdict (**SAFE**, **CAUTION**, or **NOT RECOMMENDED**) with cash flow impact.
- **Exportable & Printable Monthly Statement**: One-click printable financial summary and CSV export.
- **Pre-configured Scenario Switcher**:
  1. **Salaried Professional (Alex Bennett, $5,400/mo)**: Corporate salary, rent, dining creep, and emergency buffer.
  2. **College Student (Maya Patel, $1,250/mo)**: Strict family allowance & work-study job, textbooks, and low-cost emergency reserve.
  3. **Freelancer / Consultant (Sam Chen, $4,300/mo)**: Variable client retainers, quarterly tax withholding, and equipment upgrades.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion
- **Backend**: Node.js, Express, TSX
- **AI Engine**: `@google/genai` (Gemini 3.8 Flash)
- **Tooling**: Vite

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `bun`

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/personal-finance-advisor-bot.git
cd personal-finance-advisor-bot
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and provide your Gemini API Key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Get a free API key from [Google AI Studio](https://aistudio.google.com/))*

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm start
```

---

## 📄 License
Apache-2.0
