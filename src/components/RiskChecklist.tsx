import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckSquare, Square, Award, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChecklistItem {
  id: string;
  text: string;
  detail: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'c1',
    text: '我知道杠杆会放大亏损',
    detail: '在倍数放大下，几点微小的反向波动就可能清空我的保证金，不能只幻想利润而无视下行深渊。',
  },
  {
    id: 'c2',
    text: '我不会把全部资金用于一笔交易',
    detail: '严格控制单笔交易保证金占总资产的极小比例（如 2%~5%），绝不全仓孤注一掷。',
  },
  {
    id: 'c3',
    text: '我会预先设置止损',
    detail: '在开仓的同时即确定认错离场的红线，宁可小亏出局，也绝不抱有侥幸心理被动等待强平。',
  },
  {
    id: 'c4',
    text: '我不因亏损而冲动加仓',
    detail: '不因不甘心而在浮亏时盲目“死扛”或加倍下注，情绪失控是绝大多数交易者破产的致命根源。',
  },
  {
    id: 'c5',
    text: '我理解模拟盈利不代表真实盈利',
    detail: '模拟盘没有心理恐惧与真实滑点，几笔模拟运气盈利绝不代表自己在真实残酷市场里能够持续赚钱。',
  },
  {
    id: 'c6',
    text: '我不会借钱或使用生活必需资金交易',
    detail: '永远只使用哪怕全部亏损也完全不影响正常生活的极小闲散资金，远离借贷与信用卡套现。',
  },
];

export const RiskChecklist: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('crypto_futures_risk_checklist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('crypto_futures_risk_checklist', JSON.stringify(checkedIds));
    } catch {
      // ignore
    }
  }, [checkedIds]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (next.length === CHECKLIST_ITEMS.length && prev.length !== CHECKLIST_ITEMS.length) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 },
        });
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setCheckedIds(CHECKLIST_ITEMS.map((item) => item.id));
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.8 },
    });
  };

  const isAllChecked = checkedIds.length === CHECKLIST_ITEMS.length;

  return (
    <section id="checklist" className="py-16 bg-slate-900/60 border-b border-slate-800 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>自律防护网 · 6 项军规</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            新手交易风险控制清单
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            在考虑尝试任何真实交易之前，请认真审视并确认你已真正理解以下六条生存法则。
          </p>
        </div>

        {/* Checklist Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">
              完成度：
              <span className="font-bold text-white font-mono ml-1">
                {checkedIds.length} / {CHECKLIST_ITEMS.length}
              </span>
            </span>
            <button
              onClick={handleSelectAll}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              一键全部确认
            </button>
          </div>

          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => {
              const isChecked = checkedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isChecked
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span
                      className={`font-bold text-sm block ${
                        isChecked ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {item.text}
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {item.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Completion Celebration Card */}
          {isAllChecked ? (
            <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-2 border-emerald-500/50 text-center space-y-2 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-white">
                🎉 你已完成风险意识检查
              </h4>
              <p className="text-xs sm:text-sm text-emerald-300 font-medium max-w-lg mx-auto">
                请优先从低杠杆模拟开始。敬畏市场、遵守纪律，是金融交易中唯一能够长期陪伴你的护身符。
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>请逐条阅读并勾选，全部确认后即可解锁风控检查完成凭据。</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
