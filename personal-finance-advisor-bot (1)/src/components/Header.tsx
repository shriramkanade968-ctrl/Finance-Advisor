import React, { useState } from 'react';
import {
  Bot,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Palette,
  User,
} from 'lucide-react';
import { FinancialPersona, FinancialPersonaId } from '../types/finance';

interface HeaderProps {
  currentPersona: FinancialPersona;
  onSelectPersona: (personaId: FinancialPersonaId) => void;
  currency: string;
  onChangeCurrency: (currency: string) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAdvisor: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  onSelectPersona,
  currency,
  onChangeCurrency,
  onResetData,
  onExportData,
  onImportData,
  onOpenAdvisor,
  onOpenReport,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const personas = [
    {
      id: 'salaried' as FinancialPersonaId,
      name: 'Salaried Professional',
      subtitle: 'Alex ($5,400/mo) • Discretionary spending creep & investment goals',
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'student' as FinancialPersonaId,
      name: 'College Student',
      subtitle: 'Maya ($1,250/mo) • Tight allowance, textbook costs & emergency buffer',
      icon: GraduationCap,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'freelancer' as FinancialPersonaId,
      name: 'Freelancer / Consultant',
      subtitle: 'Sam ($4,300/mo) • Variable client retainers & quarterly tax cushion',
      icon: Palette,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Personal Finance Advisor
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Intelligent budget planning, spending diagnostics & goal tracking
              </p>
            </div>
          </div>

          {/* Center: Scenario Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
              title="Switch user scenario preset"
            >
              <span className="text-base">{currentPersona.avatar}</span>
              <span className="max-w-[130px] sm:max-w-none truncate font-semibold">
                {currentPersona.roleTitle}
              </span>
              <span className="text-xs text-slate-400 font-normal hidden md:inline">
                ({currentPersona.name})
              </span>
              <span className="text-xs text-slate-400">▼</span>
            </button>

            {showPersonaMenu && (
              <div
                className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowPersonaMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Switch Persona & Scenario
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preloaded realistic scenarios to test AI budgeting & insights
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  {personas.map((p) => {
                    const Icon = p.icon;
                    const isSelected = currentPersona.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectPersona(p.id)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 border border-emerald-300'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${p.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">
                              {p.name}
                            </span>
                            {isSelected && (
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {p.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value)}
              className="text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-700 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title="Select display currency"
            >
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
              <option value="₹">₹ (INR)</option>
              <option value="C$">C$ (CAD)</option>
              <option value="A$">A$ (AUD)</option>
            </select>

            {/* Quick AI Advisor trigger button */}
            <button
              onClick={onOpenAdvisor}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Advisor</span>
            </button>

            {/* Monthly Report button */}
            <button
              onClick={onOpenReport}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <span>Monthly Report</span>
            </button>

            {/* Export / Import / Reset dropdown */}
            <div className="relative group">
              <button
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Data options & Scenarios"
              >
                <Download className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block z-50">
                <a
                  href="/api/download-zip"
                  download="personal-finance-advisor-bot.zip"
                  className="w-full text-left px-3 py-1.5 text-xs text-emerald-700 font-semibold hover:bg-emerald-50 flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Project (.ZIP)</span>
                </a>
                <button
                  onClick={onExportData}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export JSON</span>
                </button>
                <a
                  href="/api/download-archive"
                  download="personal-finance-advisor-bot.tar.gz"
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Code (.tar.gz)</span>
                </a>
                <label className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportData}
                    className="hidden"
                  />
                </label>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={onResetData}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reset to Preset</span>
                </button>
              </div>
            </div>

            {/* Scenario Info */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="About this platform & scenarios"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Personal Finance Advisor Bot</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                An AI-powered financial planning assistant developed to help individuals take control of their personal finances with clarity and confidence.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                  Tested Scenarios
                </div>
                <div>
                  <strong className="text-slate-900">Scenario 1 (Salaried Professional):</strong> Alex logs $5,400 monthly salary, rent, food, transport & shopping. The AI flags dining & wardrobe overspending and crafts an actionable savings buffer.
                </div>
                <div>
                  <strong className="text-slate-900">Scenario 2 (College Student):</strong> Maya manages a tight $1,250 allowance/campus job across essentials, textbooks & study coffee, allocating a safe emergency reserve.
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Powered by server-side Gemini 3.8 Flash for instant spending diagnostics, natural language expense logging, and &quot;Can I Afford This?&quot; purchase simulations.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
