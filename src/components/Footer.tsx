import React from 'react';
import { ShieldAlert, ArrowUp, Heart, TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">合约交易快速入门</span>
              <p className="text-[11px] text-slate-500">新手 30 分钟交互式通识教学沙盒</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>回到顶部</span>
            </button>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>重要免责与法律声明</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            本网站仅作教育与模拟用途，不构成投资、交易或法律建议。加密资产及合约交易具有高风险，可能损失全部本金。请遵守所在地法律法规，并在充分理解风险后自行决策。
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            本站展示的所有标的行情数据、图表走势、仓位与盈亏金额均为离线仿真模拟数据，与真实交易所的实时撮合、资金费率、流动性深度及滑点存在显著差异。任何模拟盘测试成绩均不作为未来实盘收益的依据或保证。
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>© {new Date().getFullYear()} 合约交易快速入门. 仅供金融风险防范通识教育使用.</div>
          <div className="flex items-center gap-1">
            <span>理性交易 · 敬畏市场 · 风险第一</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
