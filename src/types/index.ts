export type TradeSide = 'long' | 'short';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: number;
  title: string;
  tag: string;
  readTime: string;
  summary: string;
  definition: string;
  analogy: {
    title: string;
    content: string;
  };
  detailedExample: {
    title: string;
    description: string;
    steps: { label: string; detail: string }[];
  };
  keyTakeaways: string[];
  quizzes: QuizQuestion[];
}

export interface CalculationResult {
  priceChangePercent: number; // e.g. 5 for +5%
  pnlAmount: number; // in USDT
  roePercent: number; // Return on Equity percentage
  liquidationPrice: number;
  distanceToLiquidationPercent: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  riskLabel: string;
  riskDescription: string;
  explanation: string;
}

export interface VirtualPosition {
  id: string;
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  margin: number;
  notionalValue: number; // margin * leverage
  quantity: number; // notionalValue / entryPrice
  liquidationPrice: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  unrealizedPnl: number;
  roePercent: number;
  openedAt: string;
  status: 'open' | 'closed' | 'liquidated' | 'stopped_out' | 'take_profit';
  closePrice?: number;
  realizedPnl?: number;
}

export interface PricePoint {
  time: string;
  price: number;
  change: number;
}

export type MarketScenario = 'bull' | 'bear' | 'sideways';

export interface BootcampState {
  currentLevel: number; // 1 to 6
  coachMode: boolean; // Pre-action risk hints
  virtualBalance: number; // default 10,000 USDT
  selectedSide?: TradeSide | 'wait';
  directionReason?: string;
  chosenMargin: number;
  chosenLeverage: number;
  positionPercent: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  orderConfirmed: boolean;
  activeScenario: 'favorable' | 'sideways' | 'adverse';
  stepIndex: number; // in Level 5
  priceHistory: { step: number; price: number; pnl: number; roe: number; eventDesc: string }[];
  actionsTaken: string[];
  highRiskActionsCount: number;
  hadStopLoss: boolean;
  adheredToStopLoss: boolean;
  impulseAddPositionCount: number;
  maxDrawdownRoe: number;
  maxProfitRoe: number;
  finalPnl: number;
  finalRoe: number;
  isLiquidated: boolean;
  status: 'idle' | 'in_progress' | 'completed' | 'liquidated';
  completedAt?: string;
}

export interface TrainingRecord {
  id: string;
  date: string;
  side: TradeSide | 'wait';
  leverage: number;
  margin: number;
  finalPnl: number;
  finalRoe: number;
  isLiquidated: boolean;
  riskBehaviors: string[];
  advice: string;
  score: number; // 0-100
}
