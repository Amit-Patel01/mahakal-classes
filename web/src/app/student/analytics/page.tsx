'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  BarChart3,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function StudentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/results/analytics'), api.get('/results/student')]).then(
      ([analyticsRes, resultsRes]) => {
        if (analyticsRes.success && analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }
        if (resultsRes.success && resultsRes.data) {
          setAttempts(resultsRes.data);
        }
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm">
        Computing performance analytics...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Diagnostic Insights
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">
          Performance & Test History
        </h1>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Tests Taken</span>
          <p className="text-3xl font-black text-navy-950 mt-1">
            {analytics?.totalAttempted || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Accuracy</span>
          <p className="text-3xl font-black text-brand-600 mt-1">
            {analytics?.averagePercentage || 0}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Highest Score</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {analytics?.bestScore || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Passed Tests</span>
          <p className="text-3xl font-black text-amber-500 mt-1">
            {analytics?.passedCount || 0}
          </p>
        </div>
      </div>

      {/* SUBJECT-WISE ACCURACY BREAKDOWN */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-base mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" />
          <span>Subject-Wise Mastery Breakdown</span>
        </h3>

        {analytics?.subjectStats && Object.keys(analytics.subjectStats).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(analytics.subjectStats).map(([subj, data]: [string, any]) => (
              <div key={subj} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-navy-950">{subj}</span>
                  <span className="text-brand-600">{data.avgPercentage}% Avg Score</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, data.avgPercentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">
            Attempt online tests to generate subject mastery telemetry.
          </p>
        )}
      </div>

      {/* TEST ATTEMPTS HISTORY TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-base mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          <span>Historical Examination Attempts</span>
        </h3>

        {attempts.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No tests completed yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Test Title</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Obtained Score</th>
                  <th className="pb-3 font-semibold">Percentage</th>
                  <th className="pb-3 font-semibold">Result</th>
                  <th className="pb-3 font-semibold text-right">Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-navy-950">{att.test?.title}</td>
                    <td className="py-3 text-slate-500">
                      {new Date(att.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-black text-navy-950">
                      {att.totalScore} / {att.test?.totalMarks}
                    </td>
                    <td className="py-3 text-brand-600 font-bold">{att.percentage}%</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          att.isPassed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {att.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/student/tests/${att.testId}/result?attemptId=${att.id}`}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        View Analysis →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
