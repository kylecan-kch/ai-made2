import React from 'react';
import { BookOpen, ShieldAlert, Award, Calculator, TrendingUp, History, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenHistory: () => void;
  trainingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  onOpenHistory,
  trainingCount,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 bg-slate-900/90 border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                合约交易快速入门
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                纯模拟教学
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">零风险 · 交互式 · 30 分钟通识指南</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
          <a
            href="#learning-path"
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>学习路径</span>
          </a>
          <a
            href="#calculator"
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4 text-purple-400" />
            <span>盈亏计算器</span>
          </a>
          <a
            href="#trading-simulator"
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>模拟交易台</span>
          </a>
          <a
            href="#training-camp"
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 relative"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>实操训练营</span>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </a>
          <a
            href="#checklist"
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>风控清单</span>
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Training history button */}
          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5"
            title="查看训练复盘记录"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">我的训练记录</span>
            {trainingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-indigo-600 text-white font-semibold">
                {trainingCount}
              </span>
            )}
          </button>

          {/* Theme switch */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
            title={darkMode ? '切换为亮色模式' : '切换为深色模式'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
