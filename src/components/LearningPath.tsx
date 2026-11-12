import React, { useState } from 'react';
import { LESSONS_DATA } from '../data/lessonsData';
import { Lesson, QuizQuestion } from '../types';
import {
  CheckCircle,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Award,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LearningPathProps {
  completedLessons: number[];
  onToggleLessonComplete: (id: number) => void;
  onResetProgress: () => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  completedLessons,
  onToggleLessonComplete,
  onResetProgress,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [expandedExamples, setExpandedExamples] = useState<Record<number, boolean>>({ 1: true });
  // Quiz user choices: { [quizId]: selectedOptionIndex }
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  // Track if user wants to see explanation
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const activeLesson = LESSONS_DATA.find((l) => l.id === selectedLessonId) || LESSONS_DATA[0];
  const progressPercent = Math.round((completedLessons.length / LESSONS_DATA.length) * 100);

  const toggleExample = (id: number) => {
    setExpandedExamples((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectQuizOption = (q: QuizQuestion, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [q.id]: true }));

    // If answer is correct, check if all quizzes in current lesson are answered correctly
    if (optionIndex === q.correctIndex) {
      const otherQuizzes = activeLesson.quizzes.filter((item) => item.id !== q.id);
      const allOthersCorrect = otherQuizzes.every((item) => quizAnswers[item.id] === item.correctIndex);
      if (allOthersCorrect && !completedLessons.includes(activeLesson.id)) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }
  };

  const handleCompleteCurrentLesson = () => {
    const isCompleted = completedLessons.includes(activeLesson.id);
    onToggleLessonComplete(activeLesson.id);
    if (!isCompleted) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <section id="learning-path" className="py-16 bg-slate-900/60 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>通识精讲 · 5 节基础课</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              合约基础学习路径
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              由浅入深，每个概念都配有生活比喻、深度示例与随堂即时测验。
            </p>
          </div>

          {/* Progress Bar & Actions */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">学习总进度</span>
              <span className="text-indigo-400">
                {completedLessons.length} / {LESSONS_DATA.length} 门已掌握 ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {completedLessons.length > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={onResetProgress}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置学习记录</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Tabs / Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {LESSONS_DATA.map((lesson, idx) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isSelected = selectedLessonId === lesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`relative text-left p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300">
                      第 0{idx + 1} 课
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        已掌握
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">{lesson.readTime}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{lesson.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{lesson.summary}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                  <span className="text-indigo-300 font-medium">{lesson.tag}</span>
                  <span className="text-slate-400">3 道测验</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Lesson Detail Panel */}
        <div className="bg-slate-800/80 border border-slate-700/90 rounded-2xl p-6 lg:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-700/70">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  第 0{activeLesson.id} 课 · {activeLesson.tag}
                </span>
                <span className="text-xs text-slate-400">预计学习用时：{activeLesson.readTime}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">{activeLesson.title}</h3>
            </div>

            {/* Complete button */}
            <button
              onClick={handleCompleteCurrentLesson}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                completedLessons.includes(activeLesson.id)
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{completedLessons.includes(activeLesson.id) ? '已掌握此课 (点击撤回)' : '我学会了，标记完成'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Left 7 cols: Definition, Metaphor, Example */}
            <div className="lg:col-span-7 space-y-6">
              {/* Definition */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>核心通俗定义</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-sm leading-relaxed whitespace-pre-line font-normal">
                  {activeLesson.definition}
                </div>
              </div>

              {/* Real-life Analogy */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>{activeLesson.analogy.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeLesson.analogy.content}
                </p>
              </div>

              {/* Expandable Example */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/60">
                <button
                  onClick={() => toggleExample(activeLesson.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-sm text-white">
                      {activeLesson.detailedExample.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-indigo-400 font-medium">
                    <span>{expandedExamples[activeLesson.id] ? '收起详情' : '展开案例解析'}</span>
                    {expandedExamples[activeLesson.id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {expandedExamples[activeLesson.id] && (
                  <div className="p-4 pt-0 space-y-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800/80">
                    <p className="text-slate-400">{activeLesson.detailedExample.description}</p>
                    <div className="space-y-2 mt-2">
                      {activeLesson.detailedExample.steps.map((st, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
                          <span className="font-semibold text-indigo-300 block mb-0.5">{st.label}</span>
                          <span className="text-slate-300 leading-relaxed">{st.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Takeaways */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>本课要点小结</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeLesson.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right 5 cols: 3 Interactive Quizzes */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>随堂测验 (3 道题)</span>
                </h4>
                <span className="text-[11px] text-slate-400">点击选项立即显示解析</span>
              </div>

              <div className="space-y-4">
                {activeLesson.quizzes.map((q, qIndex) => {
                  const userAnswer = quizAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = hasAnswered && userAnswer === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                          Q{qIndex + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                          {q.question}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          let optStyle =
                            'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700';

                          if (hasAnswered) {
                            if (optIdx === q.correctIndex) {
                              optStyle =
                                'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40';
                            } else if (optIdx === userAnswer) {
                              optStyle =
                                'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
                            } else {
                              optStyle = 'bg-slate-900/50 text-slate-500 border-slate-800';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(q, optIdx)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && optIdx === q.correctIndex && (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />
                              )}
                              {hasAnswered && optIdx === userAnswer && optIdx !== q.correctIndex && (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Instant Explanation */}
                      {hasAnswered && (
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed border mt-2 ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1 mb-1">
                            {isCorrect ? '✅ 答对了！' : '❌ 答错了，请看解析：'}
                          </div>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
