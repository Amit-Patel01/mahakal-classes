'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BarChart3, Award, Users, CheckCircle2, Clock } from 'lucide-react';

export default function TeacherResultsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tests').then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const firstTest = res.data[0];
        setSelectedTestId(firstTest?.id || firstTest?._id?.toString() || '');
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedTestId) return;

    api.get(`/results/leaderboard/${selectedTestId}`).then((res) => {
      if (res.success && res.data) {
        setLeaderboard(res.data);
      }
    });
  }, [selectedTestId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Evaluation Ledger
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Student Examination Results</h1>
        </div>

        {tests.length > 0 && (
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-navy-950 shadow-sm"
          >
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Submissions Leaderboard Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-base mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Student Submissions & Ranks ({leaderboard.length})</span>
        </h3>

        {leaderboard.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">
            No student submissions recorded for this examination yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Rank</th>
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Score Obtained</th>
                  <th className="pb-3 font-semibold">Percentage</th>
                  <th className="pb-3 font-semibold">Time Taken</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((item) => (
                  <tr key={item.rank} className="hover:bg-slate-50/50">
                    <td className="py-3 font-black text-navy-950">
                      {item.rank === 1 ? '🥇 1st' : item.rank === 2 ? '🥈 2nd' : item.rank === 3 ? '🥉 3rd' : `#${item.rank}`}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">{item.studentName}</td>
                    <td className="py-3 font-black text-navy-950">{item.score}</td>
                    <td className="py-3 text-brand-600 font-bold">{item.percentage}%</td>
                    <td className="py-3 text-slate-500">{Math.floor(item.timeTakenSeconds / 60)}m {item.timeTakenSeconds % 60}s</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                          item.isPassed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {item.isPassed ? 'QUALIFIED' : 'FAILED'}
                      </span>
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
