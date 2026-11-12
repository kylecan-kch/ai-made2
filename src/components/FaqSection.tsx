import React, { useState } from 'react';
import { FAQ_DATA, FaqItem } from '../data/faqData';
import { HelpCircle, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-2']);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', '基础对比', '操作机制', '风险剖析', '清算规则', '交易心态', '模拟 vs 实战'];

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCat = selectedCategory === '全部' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="faq" className="py-16 bg-slate-950 border-b border-slate-800 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>答疑解惑 · 击碎误区</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            常见问题解答 (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            针对新手最常困惑的 6 大关键难题，提供通俗透彻的专业解答。
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索任何疑问关键词（例如：做空、爆仓、杠杆、逐仓）..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs">
              未找到匹配的问题，尝试换个关键词搜索。
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {faq.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {faq.badge}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">{faq.category}</span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-white">
                          {faq.question}
                        </h4>
                      </div>
                    </div>
                    <div className="mt-1 text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/70 whitespace-pre-line bg-slate-950/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
