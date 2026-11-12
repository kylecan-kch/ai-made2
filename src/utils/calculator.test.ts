import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFuturesPnL, evaluatePositionStatus } from './calculator';

test('calculateFuturesPnL handles 10x Long properly', () => {
  // Entry 60,000, Current 63,000 (+5%), Leverage 10x, Margin 1,000
  const res = calculateFuturesPnL('long', 60000, 63000, 10, 1000);
  assert.equal(res.priceChangePercent, 5);
  assert.equal(res.roePercent, 50); // 5% * 10x = +50%
  assert.equal(res.pnlAmount, 500); // 1000 * 50% = +500 USDT
  assert.equal(res.liquidationPrice, 54000); // 60,000 * (1 - 1/10) = 54,000
  assert.equal(res.riskLevel, 'high');
});

test('calculateFuturesPnL handles 5x Short properly with price drop', () => {
  // Entry 50,000, Current 47,500 (-5%), Leverage 5x, Margin 2,000
  // In short, price dropping is profitable
  const res = calculateFuturesPnL('short', 50000, 47500, 5, 2000);
  assert.equal(res.priceChangePercent, -5);
  assert.equal(res.roePercent, 25); // +25%
  assert.equal(res.pnlAmount, 500); // 2000 * 25% = +500 USDT
  assert.equal(res.liquidationPrice, 60000); // 50,000 * (1 + 1/5) = 60,000
});

test('calculateFuturesPnL handles 20x Extreme Risk classification', () => {
  const res = calculateFuturesPnL('long', 70000, 70000, 20, 500);
  assert.equal(res.riskLevel, 'extreme');
  assert.equal(res.liquidationPrice, 66500); // 70,000 * (1 - 0.05)
});

test('evaluatePositionStatus detects liquidation and stop loss', () => {
  // Long liquidation check
  assert.equal(
    evaluatePositionStatus('long', 53900, 54000, 55000, 65000),
    'liquidated'
  );
  // Long stop loss triggered
  assert.equal(
    evaluatePositionStatus('long', 54800, 54000, 55000, 65000),
    'stopped_out'
  );
  // Long take profit triggered
  assert.equal(
    evaluatePositionStatus('long', 65500, 54000, 55000, 65000),
    'take_profit'
  );
  // Long normal open position
  assert.equal(
    evaluatePositionStatus('long', 61000, 54000, 55000, 65000),
    'open'
  );
});
