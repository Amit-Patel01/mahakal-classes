'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  BookOpen,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

export default function TestResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = params.id as string;
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;

    api.get(`/results/${attemptId}`).then((res) => {
      if (res.success && res.data) {
        setAttempt(res.data);
      }
      setLoading(false);
    });

    api.get(`/results/leaderboard/${testId}`).then((res) => {
      if (res.success && res.data) {
        setLeaderboard(res.data);
      }
    });
  }, [attemptId, testId]);

  if (loading || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Generating your detailed scorecard...
      </div>
    );
  }

  const test = attempt.test;
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/tests"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-navy-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tests</span>
        </Link>
        <span className="text-xs font-semibold text-slate-400">
          Submitted on: {new Date(attempt.submittedAt).toLocaleString()}
        </span>
      </div>

      {/* SCORECARD HERO CARD */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="bg-amber-400 text-navy-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              Official Evaluation Result
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{test.title}</h1>
            <p className="text-xs text-slate-300 mt-1">
              Course: {test.course?.title} • Subject: {test.subject?.name}
            </p>
          </div>

          <div className="text-center md:text-right bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Score</span>
            <p className="text-4xl font-black text-amber-400 my-1">
              {attempt.totalScore}{' '}
              <span className="text-sm font-normal text-slate-300">/ {test.totalMarks}</span>
            </p>
            <div className="inline-flex items-center gap-1.5 mt-1">
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  attempt.isPassed ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'
                }`}
              >
                {attempt.isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'} ({attempt.percentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Questions</span>
          <p className="text-2xl font-extrabold text-navy-950 mt-1">{attempt.totalQuestions}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Attempted</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{attempt.attemptedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Correct</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{attempt.correctCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Wrong (-neg)</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{attempt.wrongCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Taken</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{formatTime(attempt.timeTakenSeconds)}</span>
          </p>
        </div>
      </div>

      {/* QUESTION-BY-QUESTION SOLUTIONS REVIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-navy-950">Detailed Solutions & Explanations</h2>
          <span className="text-xs text-slate-500">Verified by Mahakal Academic Council</span>
        </div>

        {test.questions.map((q: any, idx: number) => {
          const studentAns = attempt.answers?.find((a: any) => a.questionId === q.id);
          const studentOptionIds = studentAns?.selectedOptionIds || [];
          const isCorrect = studentAns?.isCorrect;
          const isUnattempted = studentOptionIds.length === 0;

          return (
            <div
              key={q.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              {/* Question Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600">Question {idx + 1}</span>
                <div className="flex items-center gap-2">
                  {isUnattempted ? (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                      UNATTEMPTED (0 Marks)
                    </span>
                  ) : isCorrect ? (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CORRECT (+{studentAns.marksAwarded})</span>
                    </span>
                  ) : (
                    <span className="bg-red-50 text-red-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>WRONG ({studentAns.marksAwarded} Marks)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                {q.questionText}
              </p>

              {/* Options Breakdown */}
              <div className="space-y-2">
                {q.options.map((opt: any, optIdx: number) => {
                  const isStudentPicked = studentOptionIds.includes(opt.id);
                  const isActuallyCorrect = opt.isCorrect;

                  let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                  if (isActuallyCorrect) {
                    optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                  } else if (isStudentPicked && !isActuallyCorrect) {
                    optionStyle = 'bg-red-50 border-red-300 text-red-950 line-through';
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white/80 border border-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt.optionText}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isStudentPicked && (
                          <span className="text-[10px] uppercase font-bold bg-navy-950 text-white px-2 py-0.5 rounded">
                            Your Choice
                          </span>
                        )}
                        {isActuallyCorrect && (
                          <span className="text-[10px] uppercase font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Faculty Step-by-Step Explanation */}
              {q.explanation && (
                <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl text-xs text-amber-950">
                  <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-900 uppercase tracking-wider text-[10px]">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Faculty Solution & Concept:</span>
                  </span>
                  <p className="leading-relaxed text-slate-700 whitespace-pre-line">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LEADERBOARD TABLE */}
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-navy-950 text-base">Top Ranks Leaderboard</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Rank</th>
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Percentage</th>
                  <th className="pb-3 font-semibold">Time Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((item) => (
                  <tr key={item.rank} className="hover:bg-slate-50/50">
                    <td className="py-3 font-black text-navy-950">
                      {item.rank === 1 ? '🥇 1st' : item.rank === 2 ? '🥈 2nd' : item.rank === 3 ? '🥉 3rd' : `#${item.rank}`}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">{item.studentName}</td>
                    <td className="py-3 font-bold text-navy-950">{item.score}</td>
                    <td className="py-3 text-emerald-600 font-bold">{item.percentage}%</td>
                    <td className="py-3 text-slate-500">{formatTime(item.timeTakenSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
