import React from 'react';
import { ShieldAlert, BookOpen, PlayCircle, Flame, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onStartLearning: () => void;
  onEnterSimulator: () => void;
  onEnterCamp: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartLearning,
  onEnterSimulator,
  onEnterCamp,
}) => {
  return (
    <section className="relative overflow-hidden py-14 lg:py-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>零真实资金 · 零财务门槛 · 纯教育科普</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              30 分钟，看懂
              <span className="block mt-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                币圈合约交易
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              从杠杆、做多做空，到爆仓与风险控制；先模拟，再决定是否继续了解。
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartLearning}
                className="px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <BookOpen className="w-5 h-5" />
                <span>开始学习</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
              </button>

              <button
                onClick={onEnterSimulator}
                className="px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 hover:text-white border border-slate-700 shadow-md transition-all flex items-center gap-2 transform active:scale-95"
              >
                <PlayCircle className="w-5 h-5 text-emerald-400" />
                <span>进入模拟盘</span>
              </button>

              <button
                onClick={onEnterCamp}
                className="px-5 py-3.5 rounded-xl font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>闯关实操训练营</span>
              </button>
            </div>

            {/* Feature Highlights Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>5 门通识交互卡片</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>杠杆盈亏即时推演</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>虚拟 BTC/USDT 盘口</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent Risk Warning Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-2 border-rose-500/40 shadow-2xl shadow-rose-950/50 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-1">
                    首要原则 · 必读警告
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    合约交易具有极高破产风险
                  </h3>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300 leading-relaxed">
                <p className="font-medium text-rose-200">
                  合约交易风险极高，杠杆会同时放大收益与亏损；新手绝不应直接使用真实资金交易！
                </p>
                <div className="space-y-2 pt-1 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-200">杠杆双向放大：</strong> 10x 杠杆下，标的价格仅反向波动 10% 即可导致全部本金归零（爆仓）。
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-200">极端行情波动：</strong> 加密市场 24/7 不间断运转且无熔断机制，经常出现几分钟内剧烈插针行情。
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-200">非投资建议：</strong> 本产品仅供机制科普与模拟演练，绝不承诺任何收益，严禁盲目投入真金白银。
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>当前处于：完全虚拟仿真沙盒</span>
                </span>
                <span className="text-indigo-400 font-medium">标注：模拟数据</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
