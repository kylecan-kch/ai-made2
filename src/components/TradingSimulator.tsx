import React, { useState, useEffect } from 'react';
import { MarketScenario, TradeSide, VirtualPosition } from '../types';
import { calculateFuturesPnL, evaluatePositionStatus, formatPrice, formatUSDT } from '../utils/calculator';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Info,
} from 'lucide-react';

export const TradingSimulator: React.FC = () => {
  // Simulator Market State
  const [scenario, setScenario] = useState<MarketScenario>('bull');
  const [basePrice, setBasePrice] = useState<number>(65000);
  const [currentPrice, setCurrentPrice] = useState<number>(65000);
  const [priceHistory, setPriceHistory] = useState<number[]>([
    64200, 64500, 64100, 64800, 65000,
  ]);

  // Order Inputs
  const [side, setSide] = useState<TradeSide>('long');
  const [leverage, setLeverage] = useState<number>(5);
  const [margin, setMargin] = useState<number>(1000);
  const [stopLossInput, setStopLossInput] = useState<string>('61750'); // default -5% for long
  const [takeProfitInput, setTakeProfitInput] = useState<string>('71500'); // default +10% for long

  // Position State
  const [position, setPosition] = useState<VirtualPosition | null>(null);
  const [closedSummary, setClosedSummary] = useState<{
    pnl: number;
    roe: number;
    reason: string;
    closePrice: number;
  } | null>(null);

  // Update default TP/SL when side or price changes (if position is not yet opened)
  const syncDefaultTPSL = (newSide: TradeSide, price: number) => {
    if (newSide === 'long') {
      setStopLossInput(Math.round(price * 0.95).toString());
      setTakeProfitInput(Math.round(price * 1.08).toString());
    } else {
      setStopLossInput(Math.round(price * 1.05).toString());
      setTakeProfitInput(Math.round(price * 0.92).toString());
    }
  };

  // Switch Side
  const handleSideChange = (newSide: TradeSide) => {
    setSide(newSide);
    if (!position) {
      syncDefaultTPSL(newSide, currentPrice);
    }
  };

  // Open Position
  const handleOpenPosition = () => {
    const sl = stopLossInput ? Number(stopLossInput) : undefined;
    const tp = takeProfitInput ? Number(takeProfitInput) : undefined;
    const pnlCalc = calculateFuturesPnL(side, currentPrice, currentPrice, leverage, margin);

    const newPos: VirtualPosition = {
      id: `pos-${Date.now()}`,
      symbol: 'BTC/USDT 模拟合约',
      side,
      entryPrice: currentPrice,
      currentPrice,
      leverage,
      margin,
      notionalValue: margin * leverage,
      quantity: (margin * leverage) / currentPrice,
      liquidationPrice: pnlCalc.liquidationPrice,
      stopLossPrice: sl,
      takeProfitPrice: tp,
      unrealizedPnl: 0,
      roePercent: 0,
      openedAt: new Date().toLocaleTimeString(),
      status: 'open',
    };

    setPosition(newPos);
    setClosedSummary(null);
  };

  // Close Position Manually
  const handleClosePosition = () => {
    if (!position) return;
    const pnlCalc = calculateFuturesPnL(
      position.side,
      position.entryPrice,
      currentPrice,
      position.leverage,
      position.margin
    );

    setClosedSummary({
      pnl: pnlCalc.pnlAmount,
      roe: pnlCalc.roePercent,
      reason: '用户主动市价平仓',
      closePrice: currentPrice,
    });
    setPosition(null);
  };

  // Price Advancement Engine
  const advancePriceBy = (deltaPercent: number, customDesc?: string) => {
    const nextPrice = Math.max(100, Math.round(currentPrice * (1 + deltaPercent / 100)));
    setCurrentPrice(nextPrice);
    setPriceHistory((prev) => [...prev.slice(-15), nextPrice]);

    // Check position trigger if active
    if (position) {
      const pnlCalc = calculateFuturesPnL(
        position.side,
        position.entryPrice,
        nextPrice,
        position.leverage,
        position.margin
      );

      const status = evaluatePositionStatus(
        position.side,
        nextPrice,
        position.liquidationPrice,
        position.stopLossPrice,
        position.takeProfitPrice
      );

      if (status === 'liquidated') {
        setClosedSummary({
          pnl: -position.margin,
          roe: -100,
          reason: '💥 触碰强平线，仓位已触发模拟爆仓！',
          closePrice: nextPrice,
        });
        setPosition(null);
      } else if (status === 'stopped_out') {
        setClosedSummary({
          pnl: pnlCalc.pnlAmount,
          roe: pnlCalc.roePercent,
          reason: '🛡️ 触及预设止损价，系统自动平仓避免进一步损失。',
          closePrice: nextPrice,
        });
        setPosition(null);
      } else if (status === 'take_profit') {
        setClosedSummary({
          pnl: pnlCalc.pnlAmount,
          roe: pnlCalc.roePercent,
          reason: '🎯 触及预设止盈价，系统自动平仓锁定收益！',
          closePrice: nextPrice,
        });
        setPosition(null);
      } else {
        // Update floating position
        setPosition({
          ...position,
          currentPrice: nextPrice,
          unrealizedPnl: pnlCalc.pnlAmount,
          roePercent: pnlCalc.roePercent,
        });
      }
    }
  };

  // Next Scenario Step
  const handleScenarioStep = () => {
    let delta = 0;
    if (scenario === 'bull') {
      // Generally moves up with slight pullbacks
      delta = Math.random() > 0.3 ? +(1.5 + Math.random() * 2) : -(0.5 + Math.random() * 1.5);
    } else if (scenario === 'bear') {
      // Generally moves down
      delta = Math.random() > 0.3 ? -(1.5 + Math.random() * 2) : +(0.5 + Math.random() * 1.5);
    } else {
      // Sideways chop
      delta = (Math.random() - 0.5) * 4;
    }
    advancePriceBy(Number(delta.toFixed(2)));
  };

  // Reset simulator
  const handleReset = () => {
    setBasePrice(65000);
    setCurrentPrice(65000);
    setPriceHistory([64200, 64500, 64100, 64800, 65000]);
    setPosition(null);
    setClosedSummary(null);
    syncDefaultTPSL(side, 65000);
  };

  // Current position metrics (if open)
  const currentPnl = position
    ? calculateFuturesPnL(
        position.side,
        position.entryPrice,
        currentPrice,
        position.leverage,
        position.margin
      )
    : null;

  // Chart SVG coordinates
  const minPrice = Math.min(...priceHistory, position?.liquidationPrice || Infinity) * 0.98;
  const maxPrice = Math.max(...priceHistory, position?.liquidationPrice || 0) * 1.02;
  const chartHeight = 160;
  const chartWidth = 600;

  const getSvgY = (val: number) => {
    const range = maxPrice - minPrice || 1;
    return chartHeight - ((val - minPrice) / range) * chartHeight;
  };

  const pointsSvg = priceHistory
    .map((val, idx) => {
      const x = (idx / (priceHistory.length - 1 || 1)) * chartWidth;
      const y = getSvgY(val);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section id="trading-simulator" className="py-16 bg-slate-900/40 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>完全虚拟沙盒 · 零真实资金</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              BTC/USDT 模拟交易台
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              测试不同市场情景下的多空开仓、浮动盈亏、止盈止损与强平临界状态。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              数据来源：离线仿真引擎
            </span>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置模拟行情</span>
            </button>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Live Chart & Scenario Advancement (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Chart Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              {/* Header inside chart */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-base text-white">BTC/USDT 模拟合约</span>
                  <span className="font-mono text-lg font-bold text-indigo-400">
                    {formatPrice(currentPrice)}
                  </span>
                  <span
                    className={`font-mono font-medium px-2 py-0.5 rounded ${
                      currentPrice >= basePrice
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {currentPrice >= basePrice ? '+' : ''}
                    {(((currentPrice - basePrice) / basePrice) * 100).toFixed(2)}%
                  </span>
                </div>

                {/* Scenario switcher */}
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-[11px]">
                  <span className="px-2 text-slate-400 font-medium">情景：</span>
                  <button
                    onClick={() => setScenario('bull')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                      scenario === 'bull'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🚀 上涨趋势
                  </button>
                  <button
                    onClick={() => setScenario('bear')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                      scenario === 'bear'
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📉 下跌趋势
                  </button>
                  <button
                    onClick={() => setScenario('sideways')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                      scenario === 'sideways'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    〰️ 震荡洗盘
                  </button>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="relative w-full h-44 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0.25, 0.5, 0.75].map((ratio) => (
                    <line
                      key={ratio}
                      x1="0"
                      y1={chartHeight * ratio}
                      x2={chartWidth}
                      y2={chartHeight * ratio}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Liquidation Line (Red dashed) if position exists */}
                  {position && (
                    <line
                      x1="0"
                      y1={getSvgY(position.liquidationPrice)}
                      x2={chartWidth}
                      y2={getSvgY(position.liquidationPrice)}
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />
                  )}

                  {/* Entry Price Line (Indigo) if position exists */}
                  {position && (
                    <line
                      x1="0"
                      y1={getSvgY(position.entryPrice)}
                      x2={chartWidth}
                      y2={getSvgY(position.entryPrice)}
                      stroke="#818cf8"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Area fill */}
                  <polygon
                    points={`0,${chartHeight} ${pointsSvg} ${chartWidth},${chartHeight}`}
                    fill="url(#chartGradient)"
                  />

                  {/* Path line */}
                  <polyline
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsSvg}
                  />

                  {/* Current price marker */}
                  {priceHistory.length > 0 && (
                    <circle
                      cx={chartWidth}
                      cy={getSvgY(currentPrice)}
                      r="4"
                      fill="#a855f7"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </svg>

                {/* Legend badges on chart overlay */}
                <div className="absolute top-2 left-3 flex flex-wrap gap-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ── 价格轨迹
                  </span>
                  {position && (
                    <>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        ┄┄ 开仓价: ${position.entryPrice}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        ┅┅ 强平线: ${position.liquidationPrice}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Price Advancement Control Bar */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  推动市场演练（观察价格变动对持仓的影响）：
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={handleScenarioStep}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>按情景推进</span>
                  </button>
                  <button
                    onClick={() => advancePriceBy(2)}
                    className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>上涨 +2%</span>
                  </button>
                  <button
                    onClick={() => advancePriceBy(-2)}
                    className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>下跌 -2%</span>
                  </button>
                  <button
                    onClick={() => advancePriceBy(5)}
                    className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>单边大涨 +5%</span>
                  </button>
                  <button
                    onClick={() => advancePriceBy(-5)}
                    className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>急跌跳水 -5%</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Closed / Liquidated Summary Card (if triggered) */}
            {closedSummary && (
              <div
                className={`p-5 rounded-2xl border ${
                  closedSummary.pnl >= 0
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm">{closedSummary.reason}</span>
                  <span className="font-mono text-xs text-slate-300">
                    平仓价：{formatPrice(closedSummary.closePrice)}
                  </span>
                </div>
                <div className="flex items-baseline gap-4 mt-2">
                  <div>
                    <span className="text-xs text-slate-400 block">实现盈亏</span>
                    <span className="font-mono text-xl font-extrabold">
                      {closedSummary.pnl >= 0 ? `+${closedSummary.pnl.toFixed(2)}` : closedSummary.pnl.toFixed(2)} USDT
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">收益率 (ROE)</span>
                    <span className="font-mono text-xl font-extrabold">
                      {closedSummary.roe >= 0 ? `+${closedSummary.roe.toFixed(2)}%` : `${closedSummary.roe.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300/90 mt-2">
                  {closedSummary.roe <= -100
                    ? '提示：这就是高杠杆爆仓的后果——资金全额损失。在真实交易中，务必设好止损，切忌重仓死扛！'
                    : '模拟交易完成。你可以调整参数重新开仓，继续测试不同行情下的策略效果。'}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Order Placement & Active Position Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {!position ? (
              /* Order Form */
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>开立模拟仓位</span>
                  </h3>
                  <span className="text-xs text-indigo-400">零资金损耗</span>
                </div>

                {/* Side toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSideChange('long')}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      side === 'long'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>做多 (买入看涨)</span>
                  </button>
                  <button
                    onClick={() => handleSideChange('short')}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      side === 'short'
                        ? 'bg-rose-600 text-white border-rose-500 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>做空 (卖出看跌)</span>
                  </button>
                </div>

                {/* Leverage buttons */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-semibold text-slate-300">杠杆倍数</span>
                    <span className="font-mono text-purple-400 font-bold">{leverage}x</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 5, 10, 20].map((lev) => (
                      <button
                        key={lev}
                        onClick={() => setLeverage(lev)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          leverage === lev
                            ? 'bg-purple-600 text-white border-purple-400'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Margin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    保证金 (USDT)
                  </label>
                  <input
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(Math.max(10, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>名义总仓位价值：</span>
                    <span className="font-mono text-slate-200">
                      {(margin * leverage).toLocaleString()} USDT
                    </span>
                  </div>
                </div>

                {/* Stop Loss & Take Profit */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      止损价 (SL)
                    </label>
                    <input
                      type="number"
                      value={stopLossInput}
                      onChange={(e) => setStopLossInput(e.target.value)}
                      placeholder="选填"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      止盈价 (TP)
                    </label>
                    <input
                      type="number"
                      value={takeProfitInput}
                      onChange={(e) => setTakeProfitInput(e.target.value)}
                      placeholder="选填"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Open Button */}
                <button
                  onClick={handleOpenPosition}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform active:scale-95 ${
                    side === 'long'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/60'
                  }`}
                >
                  开立模拟{side === 'long' ? '多' : '空'}单 ({leverage}x · {margin} U)
                </button>
              </div>
            ) : (
              /* Active Position Card */
              <div className="bg-slate-900 border-2 border-indigo-500/50 p-6 rounded-2xl shadow-2xl shadow-indigo-950/60 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                        position.side === 'long'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {position.side === 'long' ? '做多 · 看涨' : '做空 · 看跌'} {position.leverage}x
                    </span>
                    <span className="text-xs text-slate-400">{position.symbol}</span>
                  </div>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    持仓运行中
                  </span>
                </div>

                {/* Unrealized PnL Hero */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">未实现盈亏 (浮动)</span>
                  <div
                    className={`text-3xl font-black font-mono tracking-tight ${
                      (currentPnl?.pnlAmount || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(currentPnl?.pnlAmount || 0) >= 0 ? '+' : ''}
                    {currentPnl?.pnlAmount} USDT
                  </div>
                  <div
                    className={`text-sm font-bold font-mono mt-1 ${
                      (currentPnl?.roePercent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ROE: {(currentPnl?.roePercent || 0) >= 0 ? '+' : ''}
                    {currentPnl?.roePercent}%
                  </div>
                </div>

                {/* Key Position Metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60">
                    <span className="text-slate-400 block">开仓价格</span>
                    <span className="font-mono font-bold text-white">
                      {formatPrice(position.entryPrice)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60">
                    <span className="text-slate-400 block">当前模拟价</span>
                    <span className="font-mono font-bold text-indigo-300">
                      {formatPrice(currentPrice)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60">
                    <span className="text-slate-400 block">保证金 (本金)</span>
                    <span className="font-mono font-bold text-white">
                      {formatUSDT(position.margin)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40">
                    <span className="text-rose-300 font-semibold block">预估强平价</span>
                    <span className="font-mono font-extrabold text-rose-300">
                      {formatPrice(position.liquidationPrice)}
                    </span>
                  </div>
                </div>

                {/* Risk Warning Proximity Box */}
                {currentPnl && currentPnl.distanceToLiquidationPercent < 6 && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>接近爆仓警告！</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      当前价格距离强平价仅剩{' '}
                      <strong>{currentPnl.distanceToLiquidationPercent}%</strong>
                      。如果行情继续朝不利方向波动，该仓位将被强制清算！
                    </p>
                  </div>
                )}

                {/* Close position action */}
                <button
                  onClick={handleClosePosition}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>立即市价平仓锁定盈亏</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
