import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  HelpCircle,
  Copy,
  Check,
  TrendingDown,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { ChatMessage, FinancialPersona, FinancialSnapshot } from '../types/finance';

interface AdvisorChatProps {
  snapshot: FinancialSnapshot;
  persona: FinancialPersona;
  currency: string;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  snapshot,
  persona,
  currency,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        text: `Hello ${persona.name}! I'm your AI Personal Finance Advisor. I'm connected to your live financial dashboard:
• Total Monthly Inflow: **$${snapshot.totalIncome.toFixed(2)}**
• Total Outflow Logged: **$${snapshot.totalExpenses.toFixed(2)}**
• Net Cash Flow: **${snapshot.netCashFlow >= 0 ? '+' : ''}$${snapshot.netCashFlow.toFixed(2)}** (${snapshot.savingsRate.toFixed(1)}% savings rate)
${
  snapshot.overspentCategories.length > 0
    ? `• Areas needing attention: **${snapshot.overspentCategories.map((c) => c.category).join(', ')}**`
    : '• All expense categories are currently within budget limits!'
}

How can I assist your financial planning today? You can ask me to audit your spending, generate a cutback strategy, or test a financial goal.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickPrompts: [
          'Audit my spending this month',
          'Where am I bleeding cash or overspending?',
          'Generate a step-by-step savings plan',
          'What is the ideal emergency fund for me?',
        ],
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle triggered initial prompt from other views
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          financialSnapshot: snapshot,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach AI Advisor');
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'I analyzed your query based on your financial snapshot.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      // Local fallback response
      const fallbackReply = generateFallbackChatReply(text, snapshot, persona);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        text: `Chat reset. I am ready to advise you, ${persona.name}. What would you like to review?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickPrompts: [
          'Audit my spending this month',
          'Where am I bleeding cash or overspending?',
          'Generate a step-by-step savings plan',
        ],
      },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm sm:text-base">Personal Finance Advisor Bot</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-300">
              Context-Aware AI • Synced with {persona.name}&apos;s live accounts
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {/* Message Text with basic markdown support for bolding and bullets */}
                <div className="whitespace-pre-line space-y-1">
                  {msg.text.split('\n').map((line, idx) => {
                    // Render bullet points nicely
                    if (line.startsWith('• ') || line.startsWith('- ')) {
                      return (
                        <div key={idx} className="flex items-start space-x-2 pl-1 py-0.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{parseBold(line.substring(2))}</span>
                        </div>
                      );
                    }
                    return <div key={idx}>{parseBold(line)}</div>;
                  })}
                </div>

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Quick prompt suggestions (if present) */}
                {msg.quickPrompts && msg.quickPrompts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.quickPrompts.map((promptText) => (
                      <button
                        key={promptText}
                        onClick={() => handleSendMessage(promptText)}
                        className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        {promptText} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-slate-200 shadow-xs flex items-center space-x-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Analyzing financial snapshot and preparing advice...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about spending, overspending cutbacks, 50/30/20 budget..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// Helper function to turn markdown bold **text** into <strong>
function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Fallback logic if server API fails
function generateFallbackChatReply(
  prompt: string,
  snapshot: FinancialSnapshot,
  persona: FinancialPersona
): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('audit') || lower.includes('bleeding') || lower.includes('overspend')) {
    if (snapshot.overspentCategories.length > 0) {
      const list = snapshot.overspentCategories
        .map(
          (c) =>
            `• **${c.category}**: Spent $${c.spent.toFixed(2)} vs limit of $${c.budget.toFixed(
              2
            )} (Over by +$${c.variance.toFixed(2)})`
        )
        .join('\n');
      return `Here is your spending audit:\n\n${list}\n\n**Actionable Recommendation:** Trim discretionary food delivery and pause non-essential shopping until next payday to recover $${snapshot.overspentCategories
        .reduce((sum, c) => sum + c.variance, 0)
        .toFixed(2)}.`;
    }
    return `Great news! You have no categories in an overspending status right now. Your net cash flow is +$${snapshot.netCashFlow.toFixed(
      2
    )} with a healthy ${snapshot.savingsRate.toFixed(1)}% savings rate.`;
  }

  if (lower.includes('plan') || lower.includes('savings') || lower.includes('goal')) {
    return `Based on your $${snapshot.totalIncome.toFixed(
      2
    )} monthly income, here is your customized plan:
• **Essentials (Needs)**: Keep around 50% ($${(snapshot.totalIncome * 0.5).toFixed(2)})
• **Lifestyle (Wants)**: Cap at 30% ($${(snapshot.totalIncome * 0.3).toFixed(2)})
• **Savings & Buffer**: Aim for 20% ($${(snapshot.totalIncome * 0.2).toFixed(2)})

Set up an automated transfer on your payday to lock in this savings before discretionary spending starts!`;
  }

  if (lower.includes('emergency')) {
    const baselineMonthly = snapshot.totalExpenses > 0 ? snapshot.totalExpenses : 2000;
    return `For ${persona.name}, a resilient emergency buffer should cover **3 to 6 months of fixed essentials**:
• 3-Month Target: **$${(baselineMonthly * 3).toFixed(2)}**
• 6-Month Target: **$${(baselineMonthly * 6).toFixed(2)}**

Keep this in a High-Yield Savings Account (HYSA) so it stays liquid while beating inflation.`;
  }

  return `I have reviewed your financial snapshot ($${snapshot.totalIncome.toFixed(
    2
  )} income, $${snapshot.totalExpenses.toFixed(2)} expenses, $${snapshot.netCashFlow.toFixed(
    2
  )} cash flow). How else can I assist your budgeting, investment readiness, or expense categorization?`;
}
