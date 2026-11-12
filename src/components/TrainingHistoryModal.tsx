import React from 'react';
import { TrainingRecord } from '../types';
import { X, History, Trash2, Award, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { formatUSDT } from '../utils/calculator';

interface TrainingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TrainingRecord[];
  onClearHistory: () => void;
}

export const TrainingHistoryModal: React.FC<TrainingHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">我的实操训练记录</h3>
              <p className="text-xs text-slate-400">本地保存最近 10 次模拟复盘记录</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 transition-colors"
                title="清空记录"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">清空历史</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {records.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
              <p className="text-sm font-medium">暂无实操训练记录</p>
              <p className="text-xs text-slate-500">
                完成「实操训练营」的所有关卡后，系统会自动保存你的复盘诊断报告。
              </p>
            </div>
          ) : (
            records.map((rec, index) => (
              <div
                key={rec.id || index}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        rec.side === 'long'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : rec.side === 'short'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {rec.side === 'long' ? '做多' : rec.side === 'short' ? '做空' : '观望'} {rec.leverage}x
                    </span>
                    <span className="text-slate-400 font-mono">{rec.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">评分：</span>
                    <span
                      className={`font-mono font-bold ${
                        rec.score >= 80
                          ? 'text-emerald-400'
                          : rec.score >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {rec.score} 分
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[11px] text-slate-500 block">模拟盈亏</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        rec.finalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {rec.finalPnl >= 0 ? `+${rec.finalPnl.toFixed(2)}` : rec.finalPnl.toFixed(2)} USDT (
                      {rec.finalRoe >= 0 ? `+${rec.finalRoe.toFixed(1)}%` : `${rec.finalRoe.toFixed(1)}%`})
                    </span>
                  </div>
                  {rec.isLiquidated && (
                    <span className="text-xs px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      触发强平
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-900">
                  {rec.advice}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
