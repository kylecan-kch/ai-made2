import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LearningPath } from './components/LearningPath';
import { Calculator } from './components/Calculator';
import { TradingSimulator } from './components/TradingSimulator';
import { TrainingCamp } from './components/TrainingCamp';
import { RiskChecklist } from './components/RiskChecklist';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { TrainingHistoryModal } from './components/TrainingHistoryModal';
import { TrainingRecord } from './types';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('crypto_futures_theme');
      return saved ? saved === 'dark' : true; // Default dark
    } catch {
      return true;
    }
  });

  const [completedLessons, setCompletedLessons] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('crypto_futures_completed_lessons');
      return saved ? JSON.parse(saved) : [1]; // Start with lesson 1 acknowledged or empty
    } catch {
      return [1];
    }
  });

  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('crypto_futures_training_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('crypto_futures_theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'crypto_futures_completed_lessons',
        JSON.stringify(completedLessons)
      );
    } catch {
      // ignore
    }
  }, [completedLessons]);

  const handleToggleLessonComplete = (id: number) => {
    setCompletedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetProgress = () => {
    setCompletedLessons([]);
  };

  const handleSaveRecord = (record: TrainingRecord) => {
    setTrainingRecords((prev) => {
      const updated = [record, ...prev].slice(0, 10);
      try {
        localStorage.setItem('crypto_futures_training_records', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setTrainingRecords([]);
    try {
      localStorage.removeItem('crypto_futures_training_records');
    } catch {
      // ignore
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200 ${
        darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* Top Navigation */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        trainingCount={trainingRecords.length}
      />

      <main>
        {/* 1. Hero Section */}
        <Hero
          onStartLearning={() => scrollTo('learning-path')}
          onEnterSimulator={() => scrollTo('trading-simulator')}
          onEnterCamp={() => scrollTo('training-camp')}
        />

        {/* 2. Learning Path (5 lessons with quizzes) */}
        <LearningPath
          completedLessons={completedLessons}
          onToggleLessonComplete={handleToggleLessonComplete}
          onResetProgress={handleResetProgress}
        />

        {/* 3. Leverage PnL Calculator */}
        <Calculator />

        {/* 4. Virtual Trading Simulator (BTC/USDT) */}
        <TradingSimulator />

        {/* 8. 模拟实操训练营 (6-Level Core Campaign) */}
        <TrainingCamp
          onSaveRecord={handleSaveRecord}
          onReturnToLearning={() => scrollTo('learning-path')}
        />

        {/* 5. Risk Control Checklist */}
        <RiskChecklist />

        {/* 6. Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* 7. Footer Disclaimer */}
      <Footer />

      {/* History Modal */}
      <TrainingHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        records={trainingRecords}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
