'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users,
  Award,
  BookOpen,
  Radio,
  FileText,
  Video,
  CheckSquare,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((res) => {
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm">
        Aggregating system-wide institutional metrics...
      </div>
    );
  }

  const counts = stats.counts;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Executive Summary
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950 mt-1">
            Institutional Control Center
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>MongoDB & GridFS Active</span>
        </div>
      </div>

      {/* 8 DASHBOARD STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Students</span>
          <p className="text-2xl font-black text-navy-950 mt-0.5">{counts.totalStudents}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Faculty</span>
          <p className="text-2xl font-black text-navy-950 mt-0.5">{counts.totalTeachers}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Courses</span>
          <p className="text-2xl font-black text-navy-950 mt-0.5">{counts.totalCourses}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2">
            <Radio className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Live Broadcasts</span>
          <p className="text-2xl font-black text-red-500 mt-0.5">{counts.totalLiveClasses}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Online Tests</span>
          <p className="text-2xl font-black text-navy-950 mt-0.5">{counts.totalTests}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">HE Materials</span>
          <p className="text-2xl font-black text-navy-950 mt-0.5">{counts.totalMaterials}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Percent className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Test Score</span>
          <p className="text-2xl font-black text-brand-600 mt-0.5">{counts.avgScore}%</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Pass Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{counts.passRate}%</p>
        </div>
      </div>

      {/* TWO COLUMN CHARTS & TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Enrollment Growth */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-navy-950 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Student Growth Trend (Monthly)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">Current Academic Year</span>
          </div>

          <div className="space-y-3 pt-2">
            {stats.studentGrowth?.map((item: any) => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{item.month}</span>
                  <span className="text-navy-950 font-extrabold">{item.students} Students</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (item.students / 120) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-navy-950 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Course Batch Resource Distribution</span>
            </h3>
            <Link href="/admin/courses" className="text-xs font-bold text-brand-600 hover:underline">
              Manage Batches
            </Link>
          </div>

          <div className="space-y-4">
            {stats.courseDistribution?.map((cd: any) => (
              <div
                key={cd.courseName}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-navy-950">{cd.courseName}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>{cd.studentsCount} Students</span>
                    <span>•</span>
                    <span>{cd.materialsCount} HE Materials</span>
                    <span>•</span>
                    <span>{cd.testsCount} Tests</span>
                  </div>
                </div>
                <Link
                  href="/admin/courses"
                  className="p-2 text-slate-400 hover:text-navy-950 rounded-lg hover:bg-slate-200 transition"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
