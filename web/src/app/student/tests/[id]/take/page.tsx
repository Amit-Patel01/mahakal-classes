'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Send,
  HelpCircle,
} from 'lucide-react';

interface QuestionOption {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  questionText: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  marks: number;
  negativeMarks: number;
  options: QuestionOption[];
}

interface TestData {
  id: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  instructions: string;
  questions: Question[];
}

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = useState<TestData | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { selectedOptionIds: string[]; isMarkedForReview: boolean }>
  >({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Fetch test details without answers
    api.get(`/tests/${testId}/take`).then(async (res) => {
      if (res.success && res.data) {
        setTest(res.data);
        setSecondsRemaining(res.data.durationMinutes * 60);

        // 2. Start or resume attempt
        const startRes = await api.post(`/tests/${testId}/start`);
        if (startRes.success && startRes.data) {
          setAttemptId(startRes.data.id);
        }
      }
      setLoading(false);
    });
  }, [testId]);

  // Countdown timer effect
  useEffect(() => {
    if (!test || secondsRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [test, attemptId]);

  const handleAutoSubmit = () => {
    alert('⏱ Time has expired! Your answers are being submitted automatically.');
    submitTest();
  };

  const handleOptionSelect = (questionId: string, optionId: string, type: string) => {
    const current = answers[questionId]?.selectedOptionIds || [];
    let updatedOptions: string[];

    if (type === 'MULTIPLE_CHOICE') {
      if (current.includes(optionId)) {
        updatedOptions = current.filter((id) => id !== optionId);
      } else {
        updatedOptions = [...current, optionId];
      }
    } else {
      // Single choice or True/False
      updatedOptions = [optionId];
    }

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionIds: updatedOptions,
        isMarkedForReview: prev[questionId]?.isMarkedForReview || false,
      },
    }));
  };

  const toggleMarkForReview = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionIds: prev[questionId]?.selectedOptionIds || [],
        isMarkedForReview: !(prev[questionId]?.isMarkedForReview || false),
      },
    }));
  };

  const clearAnswer = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionIds: [],
        isMarkedForReview: prev[questionId]?.isMarkedForReview || false,
      },
    }));
  };

  const submitTest = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);

    const payload = Object.keys(answers).map((qId) => ({
      questionId: qId,
      selectedOptionIds: answers[qId].selectedOptionIds,
      isMarkedForReview: answers[qId].isMarkedForReview,
    }));

    const res = await api.post(`/tests/attempts/${attemptId}/submit`, { answers: payload });
    setSubmitting(false);

    if (res.success && res.data) {
      router.push(`/student/tests/${testId}/result?attemptId=${attemptId}`);
    } else {
      alert(res.message || 'Submission failed. Please check connection and retry.');
    }
  };

  if (loading || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        Initializing Online Test Engine...
      </div>
    );
  }

  const currentQuestion = test.questions[currentIndex];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stats for palette
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOptionIds && a.selectedOptionIds.length > 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none">
      {/* Test Exam Topbar */}
      <header className="bg-navy-950 text-white px-6 py-3 border-b border-navy-800 flex items-center justify-between shadow-md shrink-0">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
            National Online Examination
          </span>
          <h1 className="text-sm font-bold truncate max-w-md">{test.title}</h1>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-6">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-extrabold border ${
              secondsRemaining < 300
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                : 'bg-navy-900 text-amber-400 border-navy-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Time Left: {formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setConfirmModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Content: Question + Palette */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Question Card */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto p-6 lg:p-10 border-r border-slate-200">
          {/* Question Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <span className="text-xs font-extrabold text-navy-950 bg-slate-100 px-3 py-1.5 rounded-lg">
              Question {currentIndex + 1} of {test.questions.length}
            </span>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                +{currentQuestion.marks} Marks
              </span>
              <span className="text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded-lg">
                -{currentQuestion.negativeMarks} Negative
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-8">
            <p className="text-base text-slate-800 font-semibold leading-relaxed whitespace-pre-line">
              {currentQuestion.questionText}
            </p>
          </div>

          {/* Options List */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((opt, idx) => {
              const selectedIds = answers[currentQuestion.id]?.selectedOptionIds || [];
              const isSelected = selectedIds.includes(opt.id);

              return (
                <div
                  key={opt.id}
                  onClick={() =>
                    handleOptionSelect(currentQuestion.id, opt.id, currentQuestion.type)
                  }
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-navy-950'
                        : 'bg-white border border-slate-300 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm font-medium text-slate-800 leading-snug">
                    {opt.optionText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Question Action Footer */}
          <div className="mt-auto pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleMarkForReview(currentQuestion.id)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition flex items-center gap-1.5 ${
                  answers[currentQuestion.id]?.isMarkedForReview
                    ? 'bg-purple-100 border-purple-300 text-purple-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {answers[currentQuestion.id]?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
                </span>
              </button>

              <button
                onClick={() => clearAnswer(currentQuestion.id)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-2"
              >
                Clear Answer
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentIndex === test.questions.length - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 disabled:opacity-30"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette Drawer */}
        <aside className="w-full lg:w-80 bg-slate-50 p-6 border-t lg:border-t-0 lg:border-l border-slate-200 shrink-0 flex flex-col justify-between overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Question Palette
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-6 p-3 bg-white rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-500"></span>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-200"></span>
                <span>Unvisited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-400"></span>
                <span>Current</span>
              </div>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, idx) => {
                const ans = answers[q.id];
                const hasAnswered = ans && ans.selectedOptionIds && ans.selectedOptionIds.length > 0;
                const isReview = ans && ans.isMarkedForReview;
                const isCurrent = idx === currentIndex;

                let btnBg = 'bg-white border-slate-200 text-slate-700';
                if (hasAnswered) btnBg = 'bg-emerald-500 text-white border-emerald-600';
                if (isReview) btnBg = 'bg-purple-500 text-white border-purple-600';
                if (isCurrent) btnBg = 'bg-amber-400 text-navy-950 font-black border-amber-500 ring-2 ring-amber-400/40';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl border text-xs font-bold transition flex items-center justify-center ${btnBg}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Final Test</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold text-navy-950 mb-2">Submit Examination?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              You have answered <b>{answeredCount}</b> out of <b>{test.questions.length}</b> questions.
              Are you sure you want to finalize and grade your test?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  setConfirmModalOpen(false);
                  submitTest();
                }}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
              >
                {submitting ? 'Grading...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
