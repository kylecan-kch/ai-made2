import { CalculationResult, TradeSide } from '../types';

/**
 * Calculates simplified futures PnL, ROE, liquidation price and risk metrics
 */
export function calculateFuturesPnL(
  side: TradeSide,
  entryPrice: number,
  currentPrice: number,
  leverage: number,
  margin: number
): CalculationResult {
  if (entryPrice <= 0 || margin <= 0 || leverage <= 0) {
    return {
      priceChangePercent: 0,
      pnlAmount: 0,
      roePercent: 0,
      liquidationPrice: 0,
      distanceToLiquidationPercent: 0,
      riskLevel: 'low',
      riskLabel: '低风险',
      riskDescription: '参数尚未输入完整',
      explanation: '请输入有效的价格、保证金和杠杆。',
    };
  }

  // Raw asset price percentage change relative to entry
  const rawPriceDiffRatio = (currentPrice - entryPrice) / entryPrice;
  const rawPriceChangePercent = rawPriceDiffRatio * 100;

  // Directional price change for the trader
  const directionalRatio = side === 'long' ? rawPriceDiffRatio : -rawPriceDiffRatio;

  // Leverage amplifies the return on equity
  const roePercent = directionalRatio * leverage * 100;
  const pnlAmount = (margin * roePercent) / 100;

  // Simplified liquidation threshold (loss equals 100% of margin)
  // At Nx leverage, a (100 / N)% move in the adverse direction triggers liquidation
  const maxAdverseRatio = 1 / leverage;
  const liquidationPrice =
    side === 'long'
      ? Math.max(0, entryPrice * (1 - maxAdverseRatio))
      : entryPrice * (1 + maxAdverseRatio);

  // Distance to liquidation from current price
  let distanceToLiquidationPercent = 0;
  if (side === 'long') {
    distanceToLiquidationPercent =
      currentPrice <= liquidationPrice
        ? 0
        : ((currentPrice - liquidationPrice) / currentPrice) * 100;
  } else {
    distanceToLiquidationPercent =
      currentPrice >= liquidationPrice
        ? 0
        : ((liquidationPrice - currentPrice) / currentPrice) * 100;
  }

  // Risk classification
  let riskLevel: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
  let riskLabel = '低风险 (适合初学)';
  let riskDescription = '杠杆倍数较低，容错空间较大。即使行情出现正常回撤，也不易迅速触碰强平。';

  if (leverage > 15) {
    riskLevel = 'extreme';
    riskLabel = '极高风险 (爆仓极快)';
    riskDescription = `当前 ${leverage}x 杠杆下，标的价格仅需反向波动 ${(100 / leverage).toFixed(1)}% 即会损失全部保证金！任何细微洗盘都会直接强平。`;
  } else if (leverage >= 8) {
    riskLevel = 'high';
    riskLabel = '高风险 (需严格止损)';
    riskDescription = `当前 ${leverage}x 杠杆，资产反向波动 ${(100 / leverage).toFixed(1)}% 就会导致本金全部归零。必须严控仓位并预设止损。`;
  } else if (leverage >= 4) {
    riskLevel = 'moderate';
    riskLabel = '中等风险 (进阶关注)';
    riskDescription = `当前 ${leverage}x 杠杆，盈亏以 ${leverage} 倍速度放大。市场日内正常波动可能带来较显著浮动盈亏。`;
  }

  // Educational explanation text
  const notionalValue = margin * leverage;
  const adversePercent = (100 / leverage).toFixed(1);
  const directionText = side === 'long' ? '上涨' : '下跌';
  const adverseDirectionText = side === 'long' ? '下跌' : '上涨';

  let explanation = '';
  if (roePercent >= 0) {
    explanation = `你使用了 ${margin.toLocaleString()} USDT 保证金与 ${leverage}x 杠杆，实际撬动了 ${notionalValue.toLocaleString()} USDT 价值的持仓。资产价格实际变动了 ${Math.abs(rawPriceChangePercent).toFixed(2)}%，由于方向做${side === 'long' ? '多' : '空'}判断正确，收益被杠杆放大了 ${leverage} 倍，实现浮盈 +${pnlAmount.toFixed(2)} USDT (+${roePercent.toFixed(2)}%)。但切记，标的资产若反向${adverseDirectionText}达 ${adversePercent}%，就会面临全部亏损风险。`;
  } else {
    explanation = `你使用了 ${margin.toLocaleString()} USDT 保证金与 ${leverage}x 杠杆。资产价格当前向不利方向变动了 ${Math.abs(rawPriceChangePercent).toFixed(2)}%，在 ${leverage}x 杠杆放大下，你已产生了 -${Math.abs(pnlAmount).toFixed(2)} USDT (${roePercent.toFixed(2)}%) 的亏损。当价格触及预估强平价 $${liquidationPrice.toFixed(1)}（即不利波动达到 ${adversePercent}%）时，保证金将被清零强平。`;
  }

  return {
    priceChangePercent: Number(rawPriceChangePercent.toFixed(2)),
    pnlAmount: Number(pnlAmount.toFixed(2)),
    roePercent: Number(roePercent.toFixed(2)),
    liquidationPrice: Number(liquidationPrice.toFixed(1)),
    distanceToLiquidationPercent: Number(distanceToLiquidationPercent.toFixed(2)),
    riskLevel,
    riskLabel,
    riskDescription,
    explanation,
  };
}

/**
 * Checks if a position is liquidated or triggered SL/TP
 */
export function evaluatePositionStatus(
  side: TradeSide,
  currentPrice: number,
  liquidationPrice: number,
  stopLossPrice?: number,
  takeProfitPrice?: number
): 'open' | 'liquidated' | 'stopped_out' | 'take_profit' {
  if (side === 'long') {
    if (currentPrice <= liquidationPrice) return 'liquidated';
    if (stopLossPrice && currentPrice <= stopLossPrice) return 'stopped_out';
    if (takeProfitPrice && currentPrice >= takeProfitPrice) return 'take_profit';
  } else {
    if (currentPrice >= liquidationPrice) return 'liquidated';
    if (stopLossPrice && currentPrice >= stopLossPrice) return 'stopped_out';
    if (takeProfitPrice && currentPrice <= takeProfitPrice) return 'take_profit';
  }
  return 'open';
}

/**
 * Formats USDT currency
 */
export function formatUSDT(amount: number): string {
  return `${amount >= 0 ? '' : '-'}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDT`;
}

/**
 * Formats price
 */
export function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
