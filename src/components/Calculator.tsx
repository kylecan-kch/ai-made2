import React, { useState } from 'react';
import { TradeSide } from '../types';
import { calculateFuturesPnL, formatPrice, formatUSDT } from '../utils/calculator';
import {
  Calculator as CalcIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Info,
  Zap,
} from 'lucide-react';

export const Calculator: React.FC = () => {
  const [side, setSide] = useState<TradeSide>('long');
  const [entryPrice, setEntryPrice] = useState<number>(65000);
  const [currentPrice, setCurrentPrice] = useState<number>(68250); // default +5%
  const [leverage, setLeverage] = useState<number>(10);
  const [margin, setMargin] = useState<number>(1000);

  const result = calculateFuturesPnL(side, entryPrice, currentPrice, leverage, margin);

  // Quick preset helpers
  const handlePriceOffset = (percent: number) => {
    const newPrice = Math.round(entryPrice * (1 + percent / 100));
    setCurrentPrice(newPrice);
  };

  const leverageOptions = [1, 2, 5, 10, 20];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'extreme':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <section id="calculator" className="py-16 bg-slate-950 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <CalcIcon className="w-3.5 h-3.5" />
            <span>实时测算 · 机制直观化</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            杠杆盈亏计算器
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            动态调整价格、方向与杠杆倍数，亲眼观察本金收益率与爆仓红线的连锁反应。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 p-6 sm:p-7 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span>参数设定</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                  模拟数据
                </span>
              </span>
              <button
                onClick={() => {
                  setEntryPrice(65000);
                  setCurrentPrice(68250);
                  setLeverage(10);
                  setMargin(1000);
                  setSide('long');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                重置为标准示例
              </button>
            </div>

            {/* Side Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                交易方向 (Side)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSide('long')}
                  className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                    side === 'long'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>做多 (Long · 看涨)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSide('short')}
                  className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                    side === 'short'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>做空 (Short · 看跌)</span>
                </button>
              </div>
            </div>

            {/* Leverage Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  杠杆倍数 (Leverage)
                </label>
                <span className="text-xs font-mono font-bold text-purple-400">
                  当前：{leverage}x
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {leverageOptions.map((lev) => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setLeverage(lev)}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      leverage === lev
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/60'
                        : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {leverage >= 10
                  ? '⚠️ 高杠杆：标的反向波动小幅震荡即可触发爆仓'
                  : '提示：新手推荐 1x ~ 3x 极低杠杆起步体验'}
              </p>
            </div>

            {/* Entry Price & Current Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  开仓价格 (USDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={entryPrice || ''}
                    onChange={(e) => setEntryPrice(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="例如 65000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  平仓/当前价格 (USDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={currentPrice || ''}
                    onChange={(e) => setCurrentPrice(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="例如 68000"
                  />
                </div>
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">快速调整当前价格：</span>
              <div className="flex flex-wrap gap-2">
                {[-10, -5, -2, 2, 5, 10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePriceOffset(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                      pct > 0
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                    }`}
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  投入保证金金额 (USDT)
                </label>
                <span className="text-xs font-mono text-slate-400">
                  撬动名义价值：{(margin * leverage).toLocaleString()} USDT
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={margin || ''}
                  onChange={(e) => setMargin(Math.max(10, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  placeholder="例如 1000"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMargin(preset)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                  >
                    {preset} U
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Real-time Calculation Results & Educational Explanation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-7 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>实时盈亏测算结果</span>
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(result.riskLevel)}`}>
                  {result.riskLabel}
                </span>
              </div>

              {/* Main metrics display */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* PnL Amount */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 col-span-2 sm:col-span-1">
                  <span className="text-xs text-slate-400 block mb-1">预估盈亏金额</span>
                  <div
                    className={`text-xl font-extrabold font-mono ${
                      result.pnlAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.pnlAmount >= 0 ? `+${result.pnlAmount}` : result.pnlAmount} USDT
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">扣除保证金前</span>
                </div>

                {/* ROE % */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-xs text-slate-400 block mb-1">保证金收益率 (ROE)</span>
                  <div
                    className={`text-xl font-extrabold font-mono ${
                      result.roePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.roePercent >= 0 ? `+${result.roePercent}%` : `${result.roePercent}%`}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {leverage}x 杠杆放大后
                  </span>
                </div>

                {/* Price change % */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-xs text-slate-400 block mb-1">标的价格涨跌幅</span>
                  <div
                    className={`text-xl font-extrabold font-mono ${
                      result.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.priceChangePercent >= 0
                      ? `+${result.priceChangePercent}%`
                      : `${result.priceChangePercent}%`}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">底层未放大变动</span>
                </div>
              </div>

              {/* Liquidation Threshold Warning Box */}
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>预估强平（爆仓）价格</span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-rose-300">
                    {formatPrice(result.liquidationPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-rose-900/40">
                  <span>距当前价格距离</span>
                  <span
                    className={`font-mono font-bold ${
                      result.distanceToLiquidationPercent <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-300'
                    }`}
                  >
                    {result.distanceToLiquidationPercent > 0
                      ? `${result.distanceToLiquidationPercent}%`
                      : '已触及/跌穿强平线 (爆仓)'}
                  </span>
                </div>
                <p className="text-[11px] text-rose-300/80 leading-relaxed pt-1">
                  {side === 'long'
                    ? `做多时，若价格下跌至 $${result.liquidationPrice.toLocaleString()}，你的 ${margin} USDT 保证金将被全部清空强制平仓。`
                    : `做空时，若价格反向上涨至 $${result.liquidationPrice.toLocaleString()}，你的 ${margin} USDT 保证金将被全部清空强制平仓。`}
                </p>
              </div>

              {/* Educational Explanation Box: 为什么会这样 */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>为什么会这样？（原理透视）</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {result.explanation}
                </p>
                <div className="text-[11px] text-slate-400 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <strong>核心公式：</strong> 收益率 = 价格方向波动率 × 杠杆倍数；盈亏金额 = 保证金 × 收益率。
                </div>
              </div>

              {/* Educational Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  <strong>教学声明：</strong> 此计算器为简化教学模型。真实交易所还包含交易手续费（Maker/Taker）、隔夜或8小时资金费率（Funding Fee）、滑点以及维持保证金率（MMR）保护机制，实际强平点位会稍早于本测算点。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
