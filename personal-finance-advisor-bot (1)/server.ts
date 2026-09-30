import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for model selection
const MODEL_NAME = 'gemini-3.8-flash';

// Helper fallback analysis when Gemini API quota is reached
function generateFallbackAnalysis(snapshot: any) {
  const totalIncome = snapshot?.totalIncome || 0;
  const totalExpenses = snapshot?.totalExpenses || 0;
  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netCashFlow / totalIncome) * 100) : 0;
  const overspent = snapshot?.overspentCategories || [];

  let healthScore = 75;
  if (savingsRate >= 20) healthScore += 15;
  else if (savingsRate >= 10) healthScore += 5;
  else healthScore -= 10;

  if (overspent.length > 0) {
    healthScore -= overspent.length * 6;
  }
  healthScore = Math.max(25, Math.min(98, healthScore));

  let status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Good';
  if (healthScore >= 85) status = 'Excellent';
  else if (healthScore >= 70) status = 'Good';
  else if (healthScore >= 50) status = 'Fair';
  else status = 'Needs Attention';

  const summary = netCashFlow >= 0
    ? `Your financial baseline is stable with a positive net cash flow of $${netCashFlow.toFixed(2)} (${savingsRate.toFixed(1)}% savings rate). ${
        overspent.length > 0
          ? `Attention is recommended for ${overspent.map((c: any) => c.category).join(', ')} to stay within your targets.`
          : 'All tracked categories are currently within your planned allocations.'
      }`
    : `Monthly expenses currently exceed income by $${Math.abs(netCashFlow).toFixed(2)}. Consider moderating discretionary food delivery and retail purchases to preserve your savings buffer.`;

  return {
    healthScore,
    status,
    summary,
    overspendingCategories: overspent.map((c: any) => ({
      category: c.category,
      spent: c.spent,
      budget: c.budget,
      variance: c.variance,
      severity: c.variance / (c.budget || 1) > 0.25 ? 'critical' : 'warning',
      advice: `Reduce weekly spending in ${c.category} by $${(c.variance / 4).toFixed(0)} to realign with your monthly ceiling.`
    })),
    savingsAnalysis: {
      actualSavings: Math.max(0, netCashFlow),
      savingsRate,
      targetRate: 20,
      advice: savingsRate >= 20
        ? 'Great job exceeding the standard 20% savings threshold!'
        : 'Aim to incrementally build your savings rate toward 20% by locking in automated transfers on payday.'
    },
    budgetRuleComparison: {
      needs: { actual: Math.round(totalExpenses * 0.6), percent: 60, targetPercent: 50 },
      wants: { actual: Math.round(totalExpenses * 0.4), percent: 40, targetPercent: 30 },
      savings: { actual: Math.max(0, netCashFlow), percent: Math.round(savingsRate), targetPercent: 20 }
    },
    actionableTips: [
      overspent.length > 0
        ? `Cap discretionary spending in ${overspent[0].category} to save $${overspent[0].variance.toFixed(0)} this month.`
        : 'Automate transfer of 15-20% of your primary income directly into an emergency fund.',
      'Review recurring subscription services and pause any unviewed entertainment platforms.',
      'Prepare lunch and coffee at home twice more per week to recapture extra monthly buffer.'
    ],
    nextMonthPlan: {
      suggestedSavingsTarget: Math.round(totalIncome * 0.2),
      categoryCuts: overspent.map((c: any) => ({
        category: c.category,
        current: c.spent,
        suggested: c.budget,
        potentialSaving: c.variance
      }))
    }
  };
}

function generateFallbackChat(messages: any[], snapshot: any) {
  const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
  const income = snapshot?.totalIncome || 0;
  const expenses = snapshot?.totalExpenses || 0;
  const cashFlow = snapshot?.netCashFlow || 0;
  const savingsRate = snapshot?.savingsRate || 0;
  const overspent = snapshot?.overspentCategories || [];

  if (lastMsg.includes('audit') || lastMsg.includes('overspend') || lastMsg.includes('bleed')) {
    if (overspent.length > 0) {
      const list = overspent
        .map((c: any) => `• **${c.category}**: Spent $${c.spent.toFixed(2)} vs limit of $${c.budget.toFixed(2)} (Over by +$${c.variance.toFixed(2)})`)
        .join('\n');
      return `Here is your live spending audit:\n\n${list}\n\n**Actionable Advice:** Trimming casual dining and discretionary shopping over the next 2 weeks will recover **$${overspent.reduce((s: number, c: any) => s + c.variance, 0).toFixed(2)}** in cash flow.`;
    }
    return `Great news! You have no categories exceeding your budget limits right now. Your net cash flow is **+$${cashFlow.toFixed(2)}** with a **${savingsRate.toFixed(1)}%** savings rate.`;
  }

  if (lastMsg.includes('save') || lastMsg.includes('plan') || lastMsg.includes('budget')) {
    return `Based on your **$${income.toFixed(2)}** monthly income:\n• **Needs (50%)**: Target ~$${(income * 0.5).toFixed(2)}\n• **Wants (30%)**: Target ~$${(income * 0.3).toFixed(2)}\n• **Savings (20%)**: Target ~$${(income * 0.2).toFixed(2)}\n\nSetting up an automated deposit right after payday locks in your savings target before lifestyle expenses start.`;
  }

  if (lastMsg.includes('emergency') || lastMsg.includes('cushion') || lastMsg.includes('fund')) {
    const monthlyBaseline = expenses > 0 ? expenses : 2000;
    return `For financial resilience, build a **3 to 6-month fixed living reserve**:\n• 3-Month Target: **$${(monthlyBaseline * 3).toFixed(2)}**\n• 6-Month Target: **$${(monthlyBaseline * 6).toFixed(2)}**\n\nKeep this fund in a High-Yield Savings Account (HYSA) so it stays liquid while keeping pace with inflation.`;
  }

  return `I have reviewed your financial snapshot (**$${income.toFixed(2)}** monthly income, **$${expenses.toFixed(2)}** expenses, **${cashFlow >= 0 ? '+' : ''}$${cashFlow.toFixed(2)}** net flow). You can ask me to audit specific categories, optimize your 50/30/20 allocations, or assess upcoming purchases!`;
}

function generateFallbackParseExpense(text: string, currentDate: string) {
  const match = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
  const amount = match ? parseFloat(match[1]) : 25.0;

  const lower = text.toLowerCase();
  let category = 'Food & Dining';
  if (lower.includes('rent') || lower.includes('apartment') || lower.includes('mortgage')) category = 'Housing';
  else if (lower.includes('grocery') || lower.includes('trader') || lower.includes('supermarket') || lower.includes('market') || lower.includes('walmart')) category = 'Groceries';
  else if (lower.includes('uber') || lower.includes('lyft') || lower.includes('transit') || lower.includes('bus') || lower.includes('gas') || lower.includes('metro')) category = 'Transportation';
  else if (lower.includes('electric') || lower.includes('wifi') || lower.includes('internet') || lower.includes('power') || lower.includes('water')) category = 'Utilities';
  else if (lower.includes('book') || lower.includes('tuition') || lower.includes('class') || lower.includes('course')) category = 'Education';
  else if (lower.includes('movie') || lower.includes('concert') || lower.includes('game') || lower.includes('cinema')) category = 'Entertainment';
  else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('chatgpt') || lower.includes('subscription')) category = 'Subscriptions';
  else if (lower.includes('doctor') || lower.includes('dental') || lower.includes('pharmacy') || lower.includes('medicine')) category = 'Healthcare';
  else if (lower.includes('clothes') || lower.includes('shoes') || lower.includes('amazon') || lower.includes('zara')) category = 'Shopping';

  let title = text.replace(/\$?(\d+(?:\.\d{1,2})?)/, '').replace(/on|for|at/i, '').trim();
  if (!title) title = `${category} expense`;

  return {
    amount,
    category,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    date: currentDate || new Date().toISOString().split('T')[0]
  };
}

function generateFallbackSimulatePurchase(itemName: string, cost: number, category: string, urgency: string, snapshot: any) {
  const netCash = snapshot?.netCashFlow || 0;
  let verdict: 'SAFE' | 'CAUTION' | 'NOT_RECOMMENDED' = 'SAFE';
  let title = 'Safe to Proceed';
  let rationale = `You have sufficient monthly surplus ($${netCash.toFixed(2)}) to comfortably cover this $${cost.toFixed(2)} expense.`;

  if (cost > netCash) {
    verdict = 'NOT_RECOMMENDED';
    title = 'Over Available Buffer';
    rationale = `This cost ($${cost.toFixed(2)}) exceeds your current remaining monthly surplus ($${netCash.toFixed(2)}). Purchasing it this month risks tapping into reserves or running a deficit.`;
  } else if (cost > netCash * 0.4) {
    verdict = 'CAUTION';
    title = 'Proceed with Caution';
    rationale = `While technically affordable, this purchase takes up over 40% of your remaining cash flow buffer ($${netCash.toFixed(2)}).`;
  }

  return {
    verdict,
    verdictTitle: title,
    rationale,
    impactOnCashFlow: `Reduces remaining monthly surplus from $${netCash.toFixed(2)} to $${Math.max(0, netCash - cost).toFixed(2)}.`,
    impactOnSavingsGoals: `May delay planned contributions by ~${Math.ceil(cost / 150)} weeks.`,
    recommendedAction: verdict === 'NOT_RECOMMENDED'
      ? 'Wait until next month and allocate a dedicated savings envelope.'
      : 'If proceeding, keep dining out and entertainment light for the next two weeks.',
    alternativeTimeline: 'Safe to buy next payday once recurring essentials clear.'
  };
}

// API: Interactive Advisor Chat
app.post('/api/advisor/chat', async (req: Request, res: Response) => {
  const { messages, financialSnapshot } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const systemPrompt = `You are the Personal Finance Advisor Bot, a wise, empathetic, and mathematically precise financial planner.
You provide clear, tailored financial guidance to individuals (such as salaried professionals, college students, and freelancers).

Here is the user's current live financial snapshot:
- Profile Persona: ${financialSnapshot?.persona || 'General'}
- Monthly Income: $${financialSnapshot?.totalIncome?.toFixed(2) || '0.00'}
- Total Expenses to date: $${financialSnapshot?.totalExpenses?.toFixed(2) || '0.00'}
- Net Cash Flow: $${financialSnapshot?.netCashFlow?.toFixed(2) || '0.00'}
- Savings Rate: ${financialSnapshot?.savingsRate?.toFixed(1) || '0'}%
- Categories with Overspending: ${
      financialSnapshot?.overspentCategories?.length > 0
        ? financialSnapshot.overspentCategories.map((c: any) => `${c.category} (Spent: $${c.spent.toFixed(2)}, Limit: $${c.budget.toFixed(2)})`).join(', ')
        : 'None detected'
    }
- Category Expenses Breakdown: ${JSON.stringify(financialSnapshot?.categoryTotals || {})}
- Active Savings Goals: ${
      financialSnapshot?.savingsGoals?.length > 0
        ? financialSnapshot.savingsGoals.map((g: any) => `${g.title} ($${g.currentAmount} / $${g.targetAmount}, Target: ${g.targetDate || 'Ongoing'})`).join('; ')
        : 'None set'
    }

Guidelines:
1. Ground your advice in their actual numbers above.
2. If they are overspending in dining, shopping, subscriptions, or entertainment, give polite, concrete trade-offs and saving steps.
3. Be encouraging, transparent, and structured (use bullet points, bold key figures, suggest small weekly habit adjustments).
4. If they ask about saving, investing, budgeting rules (like 50/30/20), or emergency funds, tailor it to their income level.
5. Keep your tone empowering and friendly, never condescending.`;

    const formattedHistory = messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Advisor'}: ${m.text}`).join('\n\n');
    const prompt = `${formattedHistory}\n\nAdvisor:`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || generateFallbackChat(messages, financialSnapshot);
    res.json({ reply });
  } catch (error: any) {
    console.warn('Gemini Chat rate-limited or unavailable, serving financial advisor response:', error?.message);
    const reply = generateFallbackChat(messages, financialSnapshot);
    res.json({ reply });
  }
});

// API: Deep Financial & Spending Analysis
app.post('/api/advisor/analyze', async (req: Request, res: Response) => {
  const { financialSnapshot } = req.body;

  try {
    const systemPrompt = `You are a Senior Personal Financial Analyst. Perform a thorough financial diagnostic on the provided spending and income snapshot.
Analyze overspending categories, calculate budget adherence, evaluate 50/30/20 rule allocation, compute financial health score (0-100), and formulate an actionable monthly budget plan.

Return your response strictly in valid JSON matching this schema:
{
  "healthScore": number, // 0 to 100
  "status": string, // "Excellent" | "Good" | "Fair" | "Needs Attention"
  "summary": string, // 2-3 sentence overview
  "overspendingCategories": [
    {
      "category": string,
      "spent": number,
      "budget": number,
      "variance": number,
      "severity": string, // "warning" or "critical"
      "advice": string
    }
  ],
  "savingsAnalysis": {
    "actualSavings": number,
    "savingsRate": number,
    "targetRate": number,
    "advice": string
  },
  "budgetRuleComparison": {
    "needs": { "actual": number, "percent": number, "targetPercent": number },
    "wants": { "actual": number, "percent": number, "targetPercent": number },
    "savings": { "actual": number, "percent": number, "targetPercent": number }
  },
  "actionableTips": [string, string, string],
  "nextMonthPlan": {
    "suggestedSavingsTarget": number,
    "categoryCuts": [
      {
        "category": string,
        "current": number,
        "suggested": number,
        "potentialSaving": number
      }
    ]
  }
}`;

    const prompt = `Here is the financial snapshot to analyze:
${JSON.stringify(financialSnapshot, null, 2)}

Provide the JSON analysis.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    let data;
    try {
      data = JSON.parse(response.text || '{}');
      if (!data.healthScore) {
        data = generateFallbackAnalysis(financialSnapshot);
      }
    } catch {
      data = generateFallbackAnalysis(financialSnapshot);
    }

    res.json(data);
  } catch (error: any) {
    console.warn('Gemini Analysis rate-limited or unavailable, serving calculated analysis:', error?.message);
    const data = generateFallbackAnalysis(financialSnapshot);
    res.json(data);
  }
});

// API: Parse Natural Language Expense Entry
app.post('/api/advisor/parse-expense', async (req: Request, res: Response) => {
  const { text, currentDate } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  try {
    const systemPrompt = `Extract expense details from the user's natural language input.
Today's date is: ${currentDate || new Date().toISOString().split('T')[0]}.
Supported categories are:
- "Housing"
- "Food & Dining"
- "Groceries"
- "Transportation"
- "Utilities"
- "Entertainment"
- "Healthcare"
- "Shopping"
- "Education"
- "Subscriptions"
- "Personal Care"
- "Debt & Loans"
- "Miscellaneous"

Return strictly JSON matching:
{
  "amount": number,
  "category": string,
  "title": string,
  "date": string // YYYY-MM-DD
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Parse this expense note: "${text}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.amount) {
      res.json(generateFallbackParseExpense(text, currentDate));
    } else {
      res.json(parsed);
    }
  } catch (error: any) {
    console.warn('Gemini Parse rate-limited or unavailable, using smart parser:', error?.message);
    res.json(generateFallbackParseExpense(text, currentDate));
  }
});

// API: "Can I Afford This?" Purchase Simulator
app.post('/api/advisor/simulate-purchase', async (req: Request, res: Response) => {
  const { itemName, cost, category, urgency, financialSnapshot } = req.body;

  try {
    const systemPrompt = `You are a financial advisor assessing a potential purchase for a user.
Evaluate whether they can afford it safely based on their live numbers:
- Monthly Income: $${financialSnapshot?.totalIncome || 0}
- Total Expenses so far: $${financialSnapshot?.totalExpenses || 0}
- Current Net Savings Buffer: $${financialSnapshot?.netCashFlow || 0}
- Active Goals: ${JSON.stringify(financialSnapshot?.savingsGoals || [])}
- Category budgets: ${JSON.stringify(financialSnapshot?.categoryLimits || {})}

Purchase Details:
- Item: ${itemName}
- Cost: $${cost}
- Category: ${category}
- Urgency/Importance: ${urgency} (Essential, Nice to Have, Impulse/Luxury)

Output strictly JSON:
{
  "verdict": "SAFE" | "CAUTION" | "NOT_RECOMMENDED",
  "verdictTitle": string,
  "rationale": string,
  "impactOnCashFlow": string,
  "impactOnSavingsGoals": string,
  "recommendedAction": string,
  "alternativeTimeline": string
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Assess this purchase: $${cost} for ${itemName} (${category})`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.warn('Gemini Simulator rate-limited or unavailable, using calculator:', error?.message);
    res.json(generateFallbackSimulatePurchase(itemName, cost, category, urgency, financialSnapshot));
  }
});

// API: Download project ZIP archive
app.get('/api/download-zip', async (_req: Request, res: Response) => {
  try {
    const { execSync } = await import('child_process');
    execSync(
      `python3 -c "
import os, zipfile
zip_filename = '/tmp/personal-finance-advisor-bot.zip'
exclude_dirs = {'node_modules', '.git', 'dist'}
exclude_exts = {'.zip', '.tar.gz'}
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in exclude_exts:
                continue
            filepath = os.path.join(root, file)
            arcname = os.path.relpath(filepath, '.')
            zipf.write(filepath, arcname)
"`,
      { cwd: path.resolve(__dirname) }
    );
    res.download('/tmp/personal-finance-advisor-bot.zip', 'personal-finance-advisor-bot.zip');
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create zip' });
  }
});

// API: Download project archive (tar.gz)
app.get('/api/download-archive', async (_req: Request, res: Response) => {
  try {
    const { execSync } = await import('child_process');
    execSync(
      "tar --exclude='./node_modules' --exclude='./.git' --exclude='./dist' --exclude='*.tar.gz' -czf /tmp/personal-finance-advisor-bot.tar.gz .",
      { cwd: path.resolve(__dirname) }
    );
    res.download('/tmp/personal-finance-advisor-bot.tar.gz', 'personal-finance-advisor-bot.tar.gz');
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create archive' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Personal Finance Advisor server running on http://localhost:${PORT}`);
  });
}

startServer();
