import React, { useState } from 'react';
import { BootcampState, TradeSide, TrainingRecord } from '../types';
import { calculateFuturesPnL, formatPrice, formatUSDT } from '../utils/calculator';
import {
  Award,
  Compass,
  Sliders,
  ShieldCheck,
  FileCheck2,
  Activity,
  BarChart3,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrainingCampProps {
  onSaveRecord: (record: TrainingRecord) => void;
  onReturnToLearning: () => void;
}

export const TrainingCamp: React.FC<TrainingCampProps> = ({
  onSaveRecord,
  onReturnToLearning,
}) => {
  // Global Bootcamp state
  const initialBalance = 10000;
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [coachMode, setCoachMode] = useState<boolean>(true); // Pre-action risk hints switch

  // Level 1: Market Direction
  const [directionChoice, setDirectionChoice] = useState<TradeSide | 'wait' | null>(null);
  const [directionFeedback, setDirectionFeedback] = useState<string | null>(null);

  // Level 2: Position & Leverage
  const [chosenMargin, setChosenMargin] = useState<number>(500); // 5% of balance
  const [chosenLeverage, setChosenLeverage] = useState<number>(3); // 3x leverage

  // Level 3: SL & TP
  const entryPrice = 64000;
  const [stopLoss, setStopLoss] = useState<number | undefined>(60800); // -5% default
  const [takeProfit, setTakeProfit] = useState<number | undefined>(70400); // +10% default
  const [hasAcknowledgedNoSL, setHasAcknowledgedNoSL] = useState<boolean>(false);

  // Level 5: Live Market Drill State
  const [scenarioType, setScenarioType] = useState<'favorable' | 'sideways' | 'adverse'>('favorable');
  const [drillStep, setDrillStep] = useState<number>(1);
  const [drillPrice, setDrillPrice] = useState<number>(64000);
  const [drillMargin, setDrillMargin] = useState<number>(500);
  const [drillHistory, setDrillHistory] = useState<
    { step: number; price: number; pnl: number; roe: number; event: string }[]
  >([]);
  const [drillActionFeedback, setDrillActionFeedback] = useState<string | null>(null);
  const [showAddPositionModal, setShowAddPositionModal] = useState<boolean>(false);
  const [addedPositionCount, setAddedPositionCount] = useState<number>(0);
  const [maxProfitRoe, setMaxProfitRoe] = useState<number>(0);
  const [maxDrawdownRoe, setMaxDrawdownRoe] = useState<number>(0);
  const [isLiquidated, setIsLiquidated] = useState<boolean>(false);
  const [adheredToStopLoss, setAdheredToStopLoss] = useState<boolean>(true);
  const [highRiskActions, setHighRiskActions] = useState<string[]>([]);
  const [completedReport, setCompletedReport] = useState<{
    finalPnl: number;
    finalRoe: number;
    advice: string;
    score: number;
  } | null>(null);

  // Beginner preset loader
  const handleLoadBeginnerPreset = () => {
    setDirectionChoice('long');
    setChosenMargin(500); // 5% of 10,000 U
    setChosenLeverage(3); // 3x low leverage
    setStopLoss(60800); // 5% SL
    setTakeProfit(70400); // 10% TP
    setCurrentLevel(1);
    setDirectionFeedback(
      '已为您载入「新手稳健推荐参数」：小仓位 500 USDT (5% 仓位占比)、低杠杆 3x、设置了 5% 止损。这是适合新手的防御型配置。'
    );
  };

  // Level 1: Submit Direction
  const handleSubmitDirection = (choice: TradeSide | 'wait') => {
    setDirectionChoice(choice);
    if (choice === 'wait') {
      setDirectionFeedback(
        '💡 极其敏锐的选择！在没有明确信号或市场处于关键均线博弈时，“观望不交易”往往比强行押注更具智慧。现金也是一种仓位，不亏钱就是盈利的前提。为便于继续后续关卡，你可以点击“下一步”体验轻仓模拟。'
      );
    } else if (choice === 'long') {
      setDirectionFeedback(
        '📈 选择做多：假设判断比特币回踩支撑线获得支撑。切记：做多需要有合理的止损位防范破位风险。'
      );
    } else {
      setDirectionFeedback(
        '📉 选择做空：假设判断上方存在密集套牢盘阻力。切记：做空需要提防突发大阳线拉升挤压空头。'
      );
    }
  };

  // Level 2: Sizing Analysis
  const positionPercent = Math.round((chosenMargin / initialBalance) * 100);
  const notionalValue = chosenMargin * chosenLeverage;

  const getPositionRiskAlerts = () => {
    const alerts: string[] = [];
    if (positionPercent > 30) {
      alerts.push(
        `⚠️ 单笔保证金占比高达 ${positionPercent}%（重仓警告）：新手单笔风险建议控制在总资金的 1%~5% 内，过重仓位在连续失误时会导致资金不可逆腰斩。`
      );
    }
    if (chosenLeverage >= 10) {
      alerts.push(
        `⚠️ 使用了 ${chosenLeverage}x 较高杠杆：标的价格只需反向变动 ${(100 / chosenLeverage).toFixed(1)}% 就会爆仓。`
      );
    }
    return alerts;
  };

  // Start Level 5 Drill
  const handleStartDrill = () => {
    // Determine random scenario
    const scenarios: ('favorable' | 'sideways' | 'adverse')[] = ['favorable', 'sideways', 'adverse'];
    const chosenScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setScenarioType(chosenScenario);
    setDrillStep(1);
    setDrillPrice(entryPrice);
    setDrillMargin(chosenMargin);
    setDrillHistory([
      {
        step: 0,
        price: entryPrice,
        pnl: 0,
        roe: 0,
        event: '模拟订单已成交，以 $64,000 建仓',
      },
    ]);
    setDrillActionFeedback('行情开始按模拟推演发展，请观察浮动盈亏并做出你的决策。');
    setCurrentLevel(5);
  };

  // Advance Drill Step
  const handleDrillAction = (
    action: 'hold' | 'close' | 'adjust_sl' | 'trim' | 'add'
  ) => {
    const tradeSide = directionChoice === 'short' ? 'short' : 'long';
    let nextStep = drillStep + 1;
    let nextPrice = drillPrice;
    let eventText = '';

    // Record high risk actions
    if (action === 'add') {
      setHighRiskActions((prev) => [...prev, '逆势/浮动加仓']);
      setAddedPositionCount((prev) => prev + 1);
    }

    if (action === 'close') {
      finishBootcamp('用户在第 ' + drillStep + ' 步主动平仓');
      return;
    }

    // Next price based on scenario and step
    if (scenarioType === 'favorable') {
      // Moves in favorable direction
      const diff = tradeSide === 'long' ? +1600 : -1600;
      nextPrice = Math.round(drillPrice + diff * (0.8 + Math.random() * 0.4));
      eventText = '走势顺应预期，价格出现有力突破！';
    } else if (scenarioType === 'sideways') {
      // Choppy
      const diff = (Math.random() - 0.5) * 1800;
      nextPrice = Math.round(drillPrice + diff);
      eventText = '市场剧烈拉锯震荡，多空双方在均线反复争夺。';
    } else {
      // Adverse
      const diff = tradeSide === 'long' ? -2200 : +2200;
      nextPrice = Math.round(drillPrice + diff * (0.9 + Math.random() * 0.4));
      eventText = '市场突发反向异动，价格逼近预设止损及强平危险区！';
    }

    setDrillPrice(nextPrice);
    setDrillStep(nextStep);

    // Calculate current PnL with current leverage
    const currentPnl = calculateFuturesPnL(
      tradeSide,
      entryPrice,
      nextPrice,
      chosenLeverage,
      drillMargin
    );

    // Update drawdowns
    if (currentPnl.roePercent > maxProfitRoe) setMaxProfitRoe(currentPnl.roePercent);
    if (currentPnl.roePercent < maxDrawdownRoe) setMaxDrawdownRoe(currentPnl.roePercent);

    // Action specific feedback
    let feedback = '';
    if (action === 'hold') {
      feedback = `你选择了「继续持有」。${eventText} 当前浮动盈亏为 ${currentPnl.pnlAmount} USDT (${currentPnl.roePercent}%)。`;
    } else if (action === 'adjust_sl') {
      feedback = `你选择了「调整止损」，将止损位向入场价移动锁定保本。${eventText}`;
    } else if (action === 'trim') {
      setDrillMargin((prev) => Math.round(prev * 0.5));
      feedback = `你执行了「减仓 50%」，锁定了部分敞口，有效降低了后续波动风险。${eventText}`;
    } else if (action === 'add') {
      setDrillMargin((prev) => Math.round(prev * 1.5));
      feedback = `⚠️ 你执行了「模拟加仓」，保证金敞口扩大！${eventText}`;
    }

    setDrillActionFeedback(feedback);

    setDrillHistory((prev) => [
      ...prev,
      {
        step: nextStep,
        price: nextPrice,
        pnl: currentPnl.pnlAmount,
        roe: currentPnl.roePercent,
        event: feedback,
      },
    ]);

    // Check liquidation or stop loss condition
    if (currentPnl.roePercent <= -100) {
      setIsLiquidated(true);
      finishBootcamp('由于价格剧烈反向异动，仓位已触发模拟爆仓（强平）！', true);
      return;
    }

    if (stopLoss) {
      const isHitSL =
        tradeSide === 'long' ? nextPrice <= stopLoss : nextPrice >= stopLoss;
      if (isHitSL) {
        finishBootcamp('触发预设止损价，系统自动平仓，坚决保全了剩余本金。', false);
        return;
      }
    }

    // If 4 steps completed, auto conclude
    if (nextStep >= 4) {
      finishBootcamp('模拟行情演练阶段已顺利结束，进入复盘报告。');
    }
  };

  // Conclude Bootcamp & Generate Report
  const finishBootcamp = (reason: string, liquidated = false) => {
    const tradeSide = directionChoice === 'short' ? 'short' : 'long';
    const finalCalc = calculateFuturesPnL(
      tradeSide,
      entryPrice,
      drillPrice,
      chosenLeverage,
      drillMargin
    );

    const finalPnl = liquidated ? -drillMargin : finalCalc.pnlAmount;
    const finalRoe = liquidated ? -100 : finalCalc.roePercent;

    // Detect risk behaviors
    const detectedRisks: string[] = [];
    if (chosenLeverage >= 10) detectedRisks.push(`高杠杆 (${chosenLeverage}x)`);
    if (positionPercent > 20) detectedRisks.push(`重仓操作 (${positionPercent}%)`);
    if (!stopLoss) detectedRisks.push('未预设止损');
    if (addedPositionCount > 0) detectedRisks.push('冲动/途中加仓');

    // Score calculation (0 to 100)
    let score = 85;
    if (stopLoss) score += 10;
    else score -= 20;
    if (chosenLeverage <= 3) score += 5;
    else if (chosenLeverage >= 10) score -= 20;
    if (positionPercent <= 10) score += 5;
    else if (positionPercent > 25) score -= 15;
    if (liquidated) score = Math.min(score, 45);
    score = Math.max(20, Math.min(100, score));

    // Personalized Advice
    let advice = '';
    if (liquidated) {
      advice =
        '本次模拟触发了强平。核心教训：高杠杆缩窄了容错空间，加上未严格遵守或过晚止损。下次建议将杠杆降至 2x~3x，并把单笔风险锁定在总资金的 2% 以内。';
    } else if (detectedRisks.length === 0 && finalRoe > 0) {
      advice =
        '表现极佳！你展现出了合格交易员的克制与纪律：低杠杆、合理的仓位占比并预设了止损。请在未来的实操中继续保持这份敬畏心。';
    } else if (detectedRisks.length > 0) {
      advice = `本次模拟中检测到风险习惯：【${detectedRisks.join('、')}】。在真实交易中，这些习惯往往会在某一次黑天鹅中造成致命伤害。请优先优化仓位与止损管理。`;
    } else {
      advice =
        '模拟流程执行规范。不论单笔盈亏如何，只要遵循了交易计划与风控准则，从长期数学期望来看就是成功的实践。';
    }

    setCompletedReport({
      finalPnl,
      finalRoe,
      advice,
      score,
    });

    // Save record to parent/storage
    const record: TrainingRecord = {
      id: `rec-${Date.now()}`,
      date: new Date().toLocaleString(),
      side: directionChoice || 'long',
      leverage: chosenLeverage,
      margin: drillMargin,
      finalPnl,
      finalRoe,
      isLiquidated: liquidated,
      riskBehaviors: detectedRisks,
      advice,
      score,
    };
    onSaveRecord(record);

    if (!liquidated && score >= 70) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setCurrentLevel(6);
  };

  // Reset entire camp
  const handleRestartCamp = () => {
    setCurrentLevel(1);
    setDirectionChoice(null);
    setDirectionFeedback(null);
    setChosenMargin(500);
    setChosenLeverage(3);
    setStopLoss(60800);
    setTakeProfit(70400);
    setHasAcknowledgedNoSL(false);
    setDrillStep(1);
    setDrillPrice(64000);
    setDrillMargin(500);
    setDrillHistory([]);
    setDrillActionFeedback(null);
    setAddedPositionCount(0);
    setMaxProfitRoe(0);
    setMaxDrawdownRoe(0);
    setIsLiquidated(false);
    setHighRiskActions([]);
    setCompletedReport(null);
  };

  const levelsList = [
    { num: 1, name: '判断方向', icon: Compass },
    { num: 2, name: '仓位与杠杆', icon: Sliders },
    { num: 3, name: '止盈止损', icon: ShieldCheck },
    { num: 4, name: '模拟开仓', icon: FileCheck2 },
    { num: 5, name: '行情演练', icon: Activity },
    { num: 6, name: '复盘报告', icon: BarChart3 },
  ];

  return (
    <section id="training-camp" className="py-16 bg-slate-950 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Simulation Disclaimer Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                核心模块 · 6 关交互式实操
              </span>
              <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                模拟训练，不构成投资建议
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              模拟实操训练营
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              从读懂盘面到参数设定、行情应对与战后复盘，亲身领悟交易纪律与风险控制。
            </p>
          </div>

          {/* Quick utility controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Coach Mode switch */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-300">提示模式 (Coach Mode)：</span>
              <button
                onClick={() => setCoachMode((prev) => !prev)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  coachMode ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                aria-label="Toggle coach mode"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    coachMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-[11px] text-indigo-400 font-medium">
                {coachMode ? '前置提示已开启' : '关闭'}
              </span>
            </div>

            {/* Beginner preset button */}
            <button
              onClick={handleLoadBeginnerPreset}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>一键载入新手推荐参数</span>
            </button>
          </div>
        </div>

        {/* Level Map & Progress Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl mb-8 shadow-lg">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-slate-400 font-medium">
              关卡进度：第 <span className="text-white font-bold">{currentLevel}</span> / 6 关
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">虚拟可用本金：</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                10,000.00 USDT
              </span>
            </div>
          </div>

          {/* Level icons step bar */}
          <div className="grid grid-cols-6 gap-2">
            {levelsList.map((lvl) => {
              const Icon = lvl.icon;
              const isPast = currentLevel > lvl.num;
              const isCurrent = currentLevel === lvl.num;

              return (
                <div
                  key={lvl.num}
                  className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                      : isPast
                      ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <Icon
                      className={`w-4 h-4 ${
                        isCurrent
                          ? 'text-indigo-400 animate-bounce'
                          : isPast
                          ? 'text-emerald-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] font-bold truncate">
                    {lvl.num}. {lvl.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level Specific Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* LEVEL 1: 判断方向 */}
          {currentLevel === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  关卡 01 · 盘面感知
                </span>
                <h3 className="text-xl font-bold text-white">第一关：判断交易方向</h3>
                <p className="text-xs text-slate-400 mt-1">
                  给出一段模拟行情走势图与市场描述，请做出你的决断。
                </p>
              </div>

              {/* Simplified Market Chart & Description */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">
                    BTC/USDT 4小时K线观察 (模拟行情)
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">$64,000</span>
                </div>

                {/* Mini SVG Trend Line */}
                <div className="w-full h-24 bg-slate-900 rounded-lg p-2 flex items-center justify-center border border-slate-800">
                  <svg viewBox="0 0 400 80" className="w-full h-full">
                    <path
                      d="M 10 50 Q 70 20 120 45 T 230 35 T 320 60 T 390 30"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                    />
                    <circle cx="390" cy="30" r="4" fill="#a855f7" />
                  </svg>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <strong>盘面情景描述：</strong> 比特币在经历了连续 3
                  天的温和上涨后，当前在 $64,000
                  附近遇到前期高点密集抛压阻力位，成交量有所萎缩，同时下方 $62,000
                  有较强均线支撑。
                </div>
              </div>

              {/* Coach Hint */}
              {coachMode && (
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>导师提示：</strong> 许多新手误以为只要打开软件就必须下单。实际上，“看不清方向时坚决观望”是保全本金最高级的防御手段！
                  </div>
                </div>
              )}

              {/* Choice Buttons */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">
                  根据当前行情，你的决断是：
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSubmitDirection('wait')}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      directionChoice === 'wait'
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg ring-1 ring-purple-500/50'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-purple-300 mb-1 flex items-center justify-between">
                      <span>🛡️ 保持观望</span>
                      {directionChoice === 'wait' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      方向未明，空仓等待形态明朗，绝不盲目出手。
                    </p>
                  </button>

                  <button
                    onClick={() => handleSubmitDirection('long')}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      directionChoice === 'long'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-emerald-300 mb-1 flex items-center justify-between">
                      <span>📈 选择做多 (Long)</span>
                      {directionChoice === 'long' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      博弈蓄力后向上突破，需在支撑位设止损。
                    </p>
                  </button>

                  <button
                    onClick={() => handleSubmitDirection('short')}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      directionChoice === 'short'
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg ring-1 ring-rose-500/50'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-rose-300 mb-1 flex items-center justify-between">
                      <span>📉 选择做空 (Short)</span>
                      {directionChoice === 'short' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      博弈遇阻回落调整，防范假突破大阳线。
                    </p>
                  </button>
                </div>
              </div>

              {/* Direction rationale feedback */}
              {directionFeedback && (
                <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {directionFeedback}
                </div>
              )}

              {/* Next step button */}
              <div className="flex justify-end pt-3">
                <button
                  disabled={!directionChoice}
                  onClick={() => setCurrentLevel(2)}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg flex items-center gap-2"
                >
                  <span>进入第二关：设置仓位与杠杆</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* LEVEL 2: 设置仓位与杠杆 */}
          {currentLevel === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  关卡 02 · 资金配比
                </span>
                <h3 className="text-xl font-bold text-white">第二关：设置仓位与杠杆</h3>
                <p className="text-xs text-slate-400 mt-1">
                  你的可用虚拟余额为 10,000 USDT。合理选择本次投入的保证金与杠杆倍数。
                </p>
              </div>

              {coachMode && (
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>导师提示：</strong> 专业机构普遍遵循“1%~5% 仓位规则”。若将 30% 甚至 50% 资金押在单笔高杠杆上，只要遇到连续两次假突破，本金就再难回本。
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Margin input */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      本次投入保证金 (USDT)
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">
                      仓位占比：{positionPercent}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={chosenMargin}
                    onChange={(e) => setChosenMargin(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />

                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-white font-bold">{chosenMargin} USDT</span>
                    <span className="text-slate-400 text-xs">
                      预留后备资金：{(initialBalance - chosenMargin).toLocaleString()} USDT
                    </span>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex gap-2 text-xs">
                    {[500, 1000, 3000, 8000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setChosenMargin(amt)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                          chosenMargin === amt
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {amt === 500
                          ? '500 U (5% 稳健)'
                          : amt === 1000
                          ? '1000 U (10%)'
                          : amt === 3000
                          ? '3000 U (30% 偏重)'
                          : '8000 U (80% 极危)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leverage selector */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">杠杆倍数 (Leverage)</span>
                    <span className="font-mono text-purple-400 font-bold">
                      {chosenLeverage}x
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 5, 10, 20].map((lev) => (
                      <button
                        key={lev}
                        onClick={() => setChosenLeverage(lev)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          chosenLeverage === lev
                            ? 'bg-purple-600 text-white border-purple-500 shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                    <div>
                      名义仓位价值：
                      <span className="font-mono text-white font-bold">
                        {notionalValue.toLocaleString()} USDT
                      </span>
                    </div>
                    <div>
                      理论反向爆仓波动空间：
                      <span className="font-mono text-rose-300 font-bold">
                        {(100 / chosenLeverage).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Risk Analysis Alerts */}
              {getPositionRiskAlerts().map((msg, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 leading-relaxed"
                >
                  {msg}
                </div>
              ))}

              <div className="flex justify-between pt-3">
                <button
                  onClick={() => setCurrentLevel(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  返回上一关
                </button>
                <button
                  onClick={() => setCurrentLevel(3)}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center gap-2"
                >
                  <span>进入第三关：设置止盈止损</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* LEVEL 3: 设置止盈止损 */}
          {currentLevel === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  关卡 03 · 防护网构建
                </span>
                <h3 className="text-xl font-bold text-white">第三关：设置止盈与止损 (TP / SL)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  开仓前必须想好在哪里认输离场。当前模拟开仓基准价：${entryPrice.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stop Loss Input */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>止损价格 (Stop Loss · 必修项)</span>
                    </span>
                    <button
                      onClick={() => setStopLoss(undefined)}
                      className="text-[11px] text-slate-400 hover:text-rose-400"
                    >
                      清空(不设止损)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={stopLoss !== undefined ? stopLoss : ''}
                    onChange={(e) =>
                      setStopLoss(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="例如 60800"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStopLoss(Math.round(entryPrice * 0.95))}
                      className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700"
                    >
                      5% 止损 ($60,800)
                    </button>
                    <button
                      onClick={() => setStopLoss(Math.round(entryPrice * 0.92))}
                      className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700"
                    >
                      8% 止损 ($58,880)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    若价格朝不利方向触碰此价位，系统将主动平仓截断亏损。
                  </p>
                </div>

                {/* Take Profit Input */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>止盈价格 (Take Profit · 目标位)</span>
                    </span>
                    <button
                      onClick={() => setTakeProfit(undefined)}
                      className="text-[11px] text-slate-400 hover:text-emerald-400"
                    >
                      清空
                    </button>
                  </div>
                  <input
                    type="number"
                    value={takeProfit !== undefined ? takeProfit : ''}
                    onChange={(e) =>
                      setTakeProfit(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="例如 70400"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTakeProfit(Math.round(entryPrice * 1.1))}
                      className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700"
                    >
                      10% 止盈 ($70,400)
                    </button>
                    <button
                      onClick={() => setTakeProfit(Math.round(entryPrice * 1.15))}
                      className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700"
                    >
                      15% 止盈 ($73,600)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    达到预期利润目标时，自动锁定落袋为安。
                  </p>
                </div>
              </div>

              {/* Warning when NO STOP LOSS is set */}
              {stopLoss === undefined && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/60 text-xs text-rose-200 leading-relaxed space-y-2">
                  <div className="font-bold flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>⚠️ 严正风险警告：你当前未设置止损！</span>
                  </div>
                  <p>
                    系统不禁止你继续操作，但请务必清醒认识到：<strong>未设止损时，价格持续朝不利方向变化可能扩大损失直至保证金全额清零爆仓！</strong>在真实交易中，不设止损是导致新手爆仓的最核心罪魁祸首。
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-3">
                <button
                  onClick={() => setCurrentLevel(2)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  返回上一关
                </button>
                <button
                  onClick={() => setCurrentLevel(4)}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center gap-2"
                >
                  <span>进入第四关：确认模拟开仓</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* LEVEL 4: 模拟开仓确认单 */}
          {currentLevel === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  关卡 04 · 订单终审
                </span>
                <h3 className="text-xl font-bold text-white">第四关：模拟开仓确认单</h3>
                <p className="text-xs text-slate-400 mt-1">
                  请仔细核对即将提交的订单所有参数与潜在盈亏极限。
                </p>
              </div>

              {/* Order Confirmation Card */}
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        (directionChoice || 'long') === 'long'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {(directionChoice || 'long') === 'long' ? '做多 (买入看涨)' : '做空 (卖出看跌)'}
                    </span>
                    <span className="text-xs font-mono text-purple-400 font-bold">
                      {chosenLeverage}x 杠杆
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">BTC/USDT 模拟合约</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">开仓基准价格</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatPrice(entryPrice)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">占用保证金</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatUSDT(chosenMargin)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">名义仓位价值</span>
                    <span className="font-mono font-bold text-indigo-300 text-sm">
                      {formatUSDT(chosenMargin * chosenLeverage)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">综合风险等级</span>
                    <span
                      className={`font-bold text-sm ${
                        chosenLeverage >= 10 || positionPercent > 30
                          ? 'text-rose-400'
                          : chosenLeverage >= 5
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {chosenLeverage >= 10 || positionPercent > 30
                        ? '高风险'
                        : chosenLeverage >= 5
                        ? '中风险'
                        : '稳健低风险'}
                    </span>
                  </div>
                </div>

                {/* SL / TP Expected Outcomes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <span className="font-bold text-rose-300 block mb-1">
                      🛑 预估止损时最大亏损
                    </span>
                    {stopLoss ? (
                      <div className="font-mono text-sm text-rose-200">
                        {stopLoss.toLocaleString()} USDT (约 -
                        {Math.abs(
                          ((stopLoss - entryPrice) / entryPrice) * chosenLeverage * chosenMargin
                        ).toFixed(1)}{' '}
                        USDT)
                      </div>
                    ) : (
                      <div className="text-rose-400 font-bold">
                        未设置止损（最坏情况损失 100% 保证金 = {chosenMargin} USDT）
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <span className="font-bold text-emerald-300 block mb-1">
                      🎯 预估止盈时目标收益
                    </span>
                    {takeProfit ? (
                      <div className="font-mono text-sm text-emerald-200">
                        {takeProfit.toLocaleString()} USDT (约 +
                        {Math.abs(
                          ((takeProfit - entryPrice) / entryPrice) * chosenLeverage * chosenMargin
                        ).toFixed(1)}{' '}
                        USDT)
                      </div>
                    ) : (
                      <div className="text-slate-400">未设置止盈价位</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  onClick={() => setCurrentLevel(3)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  返回修改参数
                </button>
                <button
                  onClick={handleStartDrill}
                  className="px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-xl shadow-indigo-950/60 flex items-center gap-2 transform active:scale-95"
                >
                  <span>确认开立模拟仓位，进入行情演练</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* LEVEL 5: 行情演练 */}
          {currentLevel === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                    关卡 05 · 实盘推演 (第 {drillStep} 步 / 共 4 步)
                  </span>
                  <h3 className="text-xl font-bold text-white">第五关：行情演练与应变决策</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    情景：
                    {scenarioType === 'favorable'
                      ? '🚀 顺应预期走势'
                      : scenarioType === 'sideways'
                      ? '〰️ 震荡多空洗盘'
                      : '📉 逆向不利波动'}
                  </span>
                </div>
              </div>

              {/* Live Drill HUD Display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">当前演练价格</span>
                  <span className="font-mono text-base font-extrabold text-white">
                    {formatPrice(drillPrice)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    入场价: {formatPrice(entryPrice)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">未实现浮动盈亏</span>
                  {(() => {
                    const sideToEval = directionChoice === 'short' ? 'short' : 'long';
                    const pnl = calculateFuturesPnL(
                      sideToEval,
                      entryPrice,
                      drillPrice,
                      chosenLeverage,
                      drillMargin
                    );
                    return (
                      <div
                        className={`font-mono text-base font-extrabold ${
                          pnl.pnlAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pnl.pnlAmount >= 0 ? `+${pnl.pnlAmount}` : pnl.pnlAmount} USDT
                      </div>
                    );
                  })()}
                  <span className="text-[11px] text-slate-500 block">
                    ROE: {calculateFuturesPnL(
                      directionChoice === 'short' ? 'short' : 'long',
                      entryPrice,
                      drillPrice,
                      chosenLeverage,
                      drillMargin
                    ).roePercent}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">当前持仓本金</span>
                  <span className="font-mono text-base font-extrabold text-white">
                    {drillMargin} USDT
                  </span>
                  <span className="text-[11px] text-slate-500 block">{chosenLeverage}x 杠杆</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">预设止损点位</span>
                  <span className="font-mono text-base font-extrabold text-rose-300">
                    {stopLoss ? formatPrice(stopLoss) : '未设置止损'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">防范破位</span>
                </div>
              </div>

              {/* Event Feedback Box */}
              {drillActionFeedback && (
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-lg">
                  {drillActionFeedback}
                </div>
              )}

              {/* Decision Actions for User */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  面对当前盘面，你选择采取什么操作？
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <button
                    onClick={() => handleDrillAction('hold')}
                    className="p-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <span>🛡️ 继续持有</span>
                    <span className="text-[10px] text-slate-400 font-normal">遵守原计划</span>
                  </button>

                  <button
                    onClick={() => handleDrillAction('close')}
                    className="p-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex flex-col items-center justify-center gap-1 transition-all shadow-md"
                  >
                    <span>🎯 市价平仓</span>
                    <span className="text-[10px] text-indigo-200 font-normal">锁定盈亏离场</span>
                  </button>

                  <button
                    onClick={() => handleDrillAction('adjust_sl')}
                    className="p-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <span>⚙️ 调整止损</span>
                    <span className="text-[10px] text-slate-400 font-normal">移动止损保本</span>
                  </button>

                  <button
                    onClick={() => handleDrillAction('trim')}
                    className="p-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <span>✂️ 减仓 50%</span>
                    <span className="text-[10px] text-slate-400 font-normal">降低风险敞口</span>
                  </button>

                  <button
                    onClick={() => setShowAddPositionModal(true)}
                    className="p-3 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <span>⚠️ 模拟加仓</span>
                    <span className="text-[10px] text-rose-400 font-normal">高风险警告</span>
                  </button>
                </div>
              </div>

              {/* Price Trajectory History Steps */}
              {drillHistory.length > 1 && (
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    演练过程轨迹记录：
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-400 max-h-36 overflow-y-auto">
                    {drillHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-950 flex items-center justify-between font-mono"
                      >
                        <span>
                          第 {item.step} 步: {formatPrice(item.price)}
                        </span>
                        <span className={item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.pnl >= 0 ? `+${item.pnl}` : item.pnl} U ({item.roe}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LEVEL 6: 可视化复盘报告 */}
          {currentLevel === 6 && completedReport && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    关卡 06 · 战后复盘
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    实操复盘诊断报告
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">综合纪律评分</span>
                  <span
                    className={`font-mono text-2xl font-black ${
                      completedReport.score >= 80
                        ? 'text-emerald-400'
                        : completedReport.score >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {completedReport.score} / 100
                  </span>
                </div>
              </div>

              {/* Final outcome banner */}
              <div
                className={`p-6 rounded-2xl border text-center ${
                  completedReport.finalPnl >= 0
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <span className="text-xs text-slate-400 block mb-1">最终模拟结算盈亏</span>
                <div className="text-4xl font-black font-mono tracking-tight">
                  {completedReport.finalPnl >= 0
                    ? `+${completedReport.finalPnl.toFixed(2)}`
                    : completedReport.finalPnl.toFixed(2)}{' '}
                  USDT
                </div>
                <div className="text-sm font-bold font-mono mt-1">
                  最终收益率 (ROE)：{completedReport.finalRoe >= 0 ? '+' : ''}
                  {completedReport.finalRoe.toFixed(2)}%
                </div>
                {isLiquidated && (
                  <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    💥 本次演练触发了模拟爆仓 (强平)
                  </div>
                )}
              </div>

              {/* Detailed Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">开仓方向与价格</span>
                  <span className="font-bold text-white block">
                    {(directionChoice || 'long') === 'long' ? '做多' : '做空'} · {formatPrice(entryPrice)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">杠杆与保证金</span>
                  <span className="font-bold text-white block">
                    {chosenLeverage}x · {drillMargin} USDT
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">最大浮盈 / 浮亏</span>
                  <span className="font-mono font-bold block text-slate-200">
                    +{maxProfitRoe.toFixed(1)}% / {maxDrawdownRoe.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">止损执行状态</span>
                  <span
                    className={`font-bold block ${
                      stopLoss ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stopLoss ? '已设置止损' : '未设置止损 (高危)'}
                  </span>
                </div>
              </div>

              {/* High Risk Behavior Checklist */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-300 block mb-1">
                  高风险交易行为诊断：
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      chosenLeverage >= 10
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    <span>使用过高杠杆 (≥10x)</span>
                    <span className="font-bold">{chosenLeverage >= 10 ? '存在风险' : '通过'}</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      positionPercent > 20
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    <span>单笔重仓押注 (&gt;20%)</span>
                    <span className="font-bold">{positionPercent > 20 ? '存在风险' : '通过'}</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      !stopLoss
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    <span>未设止损防护</span>
                    <span className="font-bold">{!stopLoss ? '存在风险' : '通过'}</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      addedPositionCount > 0
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    <span>途中冲动加仓</span>
                    <span className="font-bold">
                      {addedPositionCount > 0 ? `出现 ${addedPositionCount} 次` : '通过'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personalized Guidance Card */}
              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>个性化进阶复盘建议</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {completedReport.advice}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={onReturnToLearning}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  返回学习路径巩固知识
                </button>

                <button
                  onClick={handleRestartCamp}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>再练一次 (重开新局)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Position High-Risk Modal */}
      {showAddPositionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-8 h-8 shrink-0" />
              <div>
                <h4 className="font-extrabold text-base text-white">
                  ⚠️ 高风险教育警示：加仓
                </h4>
                <p className="text-xs text-rose-300">
                  逆势加仓与频繁浮盈加仓是新手破产的催化剂
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <p>
                <strong>加仓的风险原理：</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>
                  若是浮亏加仓（摊平成本），标的若继续顺延原趋势下跌，巨额新仓位会使本金瞬间暴毙；
                </li>
                <li>
                  若是浮盈加仓，持仓均价会被大幅拉高，行情稍有回踩就会迅速吃光所有利润变成亏损。
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddPositionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                放弃加仓，遵守纪律
              </button>
              <button
                onClick={() => {
                  setShowAddPositionModal(false);
                  handleDrillAction('add');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                我了解高风险，仍然模拟加仓
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
