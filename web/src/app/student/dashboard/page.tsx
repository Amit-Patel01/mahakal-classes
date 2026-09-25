'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Radio,
  BookOpen,
  FileText,
  Video,
  CheckSquare,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  PlayCircle,
  Bell,
  Target,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeLive, setActiveLive] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for Active Live Class
    api.get('/live-classes/active').then((res) => {
      if (res.success && res.data) {
        setActiveLive(res.data);
      }
    });

    // 2. Fetch recent tests
    api.get('/tests').then((res) => {
      if (res.success && res.data) {
        setTests(res.data.slice(0, 3));
      }
    });

    // 3. Fetch latest study materials
    api.get('/materials').then((res) => {
      if (res.success && res.data) {
        setMaterials(res.data.slice(0, 4));
      }
    });

    // 4. Fetch announcements
    api.get('/announcements').then((res) => {
      if (res.success && res.data) {
        setAnnouncements(res.data.slice(0, 3));
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. LIVE NOW BANNER */}
      {activeLive && (
        <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-red-500/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white text-red-600 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  LIVE NOW
                </span>
                <span className="text-xs text-red-100 font-semibold">
                  {activeLive.subject?.name}
                </span>
              </div>
              <h3 className="text-lg font-bold">{activeLive.title}</h3>
              <p className="text-xs text-red-100 mt-0.5">
                Conducted by {activeLive.teacher?.name} • Started at {activeLive.startTime}
              </p>
            </div>
          </div>
          <Link
            href="/student/live"
            className="bg-white hover:bg-slate-100 text-red-600 font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 whitespace-nowrap"
          >
            <span>Enter Live Classroom</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 2. WELCOME HERO CARD */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs text-amber-300 font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enrollment: {user?.studentProfile?.enrollmentNumber || 'Active'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Goal: {user?.studentProfile?.academicGoal || 'Crack IIT-JEE / NEET with Top Rank'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/tests"
              className="bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold text-xs px-5 py-3 rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Take Online Test</span>
            </Link>
            <Link
              href="/student/material"
              className="bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold text-xs px-5 py-3 rounded-xl transition flex items-center gap-1.5 border border-navy-700"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Study Notes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION MODULES */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Quick Modules
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { title: 'Live Classes', icon: Radio, href: '/student/live', color: 'text-red-500 bg-red-50' },
            { title: 'HE Material', icon: FileText, href: '/student/material', color: 'text-blue-500 bg-blue-50' },
            { title: 'Lectures', icon: Video, href: '/student/lectures', color: 'text-purple-500 bg-purple-50' },
            { title: 'Online Tests', icon: CheckSquare, href: '/student/tests', color: 'text-emerald-500 bg-emerald-50' },
            { title: 'Test Results', icon: Award, href: '/student/analytics', color: 'text-amber-500 bg-amber-50' },
            { title: 'Enrolled Batches', icon: BookOpen, href: '/student/courses', color: 'text-indigo-500 bg-indigo-50' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="bg-white border border-slate-200/80 hover:border-amber-400/50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-navy-950 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. TWO COLUMN: AVAILABLE TESTS & HE MATERIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Tests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-navy-950 text-base">Active Online Tests</h3>
              </div>
              <Link href="/student/tests" className="text-xs font-bold text-brand-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {tests.length > 0 ? (
                tests.map((test) => (
                  <div
                    key={test.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-navy-950">{test.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{test.durationMinutes} Mins</span>
                        </span>
                        <span>•</span>
                        <span>Marks: {test.totalMarks}</span>
                        <span>•</span>
                        <span className="text-red-500 font-semibold">
                          Neg: -{test.negativeMarkingRate * 100}%
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/student/tests/${test.id}/take`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
                    >
                      Start Test
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No active tests scheduled</p>
              )}
            </div>
          </div>
        </div>

        {/* Latest HE Study Material */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-navy-950 text-base">Latest HE Study Material</h3>
              </div>
              <Link href="/student/material" className="text-xs font-bold text-brand-600 hover:underline">
                Explore All
              </Link>
            </div>

            <div className="space-y-3">
              {materials.length > 0 ? (
                materials.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div className="overflow-hidden pr-3">
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {m.category}
                      </span>
                      <h4 className="text-xs font-bold text-navy-950 mt-1 truncate">{m.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{m.subject?.name}</p>
                    </div>
                    <Link
                      href="/student/material"
                      className="bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition whitespace-nowrap"
                    >
                      View Notes
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No materials uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. ANNOUNCEMENTS TICKER */}
      {announcements.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-amber-950 mb-0.5">
              Notice: {announcements[0].title}
            </h4>
            <p className="text-xs text-amber-800 line-clamp-2 leading-relaxed">
              {announcements[0].content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
