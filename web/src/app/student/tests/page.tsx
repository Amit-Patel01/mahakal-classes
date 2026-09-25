'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckSquare, Clock, AlertCircle, ArrowRight, Award, CheckCircle2 } from 'lucide-react';

export default function StudentTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tests').then((res) => {
      if (res.success && res.data) {
        setTests(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            National Online Examination
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950">Online CBT Mock Tests</h1>
        </div>
        <Link
          href="/student/analytics"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2.5 rounded-xl border border-brand-200 self-start sm:self-auto"
        >
          <Award className="w-4 h-4" />
          <span>My Test History & Analytics</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading online tests...
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No tests currently available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test) => {
            const hasAttempted = test.lastAttempt && test.lastAttempt.status === 'SUBMITTED';

            return (
              <div
                key={test.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase">
                      {test.subject?.name || 'General Test'}
                    </span>
                    {hasAttempted && (
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed ({test.lastAttempt.percentage}%)</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-navy-950 mb-2 leading-snug">
                    {test.title}
                  </h3>

                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    {test.description || 'Full syllabus practice test simulating the real competitive exam.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl text-center mb-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Duration</span>
                      <span className="text-xs font-bold text-navy-950 flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{test.durationMinutes}m</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Marks</span>
                      <span className="text-xs font-bold text-navy-950 mt-0.5 block">{test.totalMarks}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Negative</span>
                      <span className="text-xs font-bold text-red-500 mt-0.5 block">
                        -{test.negativeMarkingRate * 100}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Questions: {test.totalQuestions || 0}
                  </span>
                  {hasAttempted ? (
                    <Link
                      href={`/student/tests/${test.id}/result?attemptId=${test.lastAttempt.id}`}
                      className="bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                    >
                      <span>Review Scorecard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/student/tests/${test.id}/take`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5"
                    >
                      <span>Start Test Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
