'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Radio,
  FileText,
  Video,
  CheckSquare,
  Users,
  BookOpen,
  ArrowRight,
  PlusCircle,
  Calendar,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/courses'), api.get('/live-classes')]).then(
      ([coursesRes, liveRes]) => {
        if (coursesRes.success && coursesRes.data) {
          setCourses(coursesRes.data);
        }
        if (liveRes.success && liveRes.data) {
          setLiveClasses(liveRes.data);
        }
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="bg-amber-400 text-navy-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
            Faculty Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {user?.teacherProfile?.qualification || 'Senior Faculty'} • {user?.teacherProfile?.experienceYears || 10}+ Years Experience
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/teacher/live"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md"
          >
            <Radio className="w-4 h-4" />
            <span>Schedule Live Class</span>
          </Link>
          <Link
            href="/teacher/materials"
            className="bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Upload HE Notes</span>
          </Link>
          <Link
            href="/teacher/tests"
            className="bg-navy-800 hover:bg-navy-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition border border-navy-700 flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>Create Test</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Batches</span>
          <p className="text-2xl font-black text-navy-950 mt-1">{courses.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Live Sessions</span>
          <p className="text-2xl font-black text-red-500 mt-1">{liveClasses.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Storage Engine</span>
          <p className="text-sm font-black text-emerald-600 mt-2">MongoDB GridFS</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">CBT Evaluation</span>
          <p className="text-sm font-black text-brand-600 mt-2">Automatic</p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Live Masterclasses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-navy-950 text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              <span>Live Masterclasses Broadcasts</span>
            </h3>
            <Link href="/teacher/live" className="text-xs font-bold text-brand-600 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {liveClasses.map((lc) => (
              <div
                key={lc.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        lc.status === 'LIVE'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {lc.status}
                    </span>
                    <span className="text-[11px] text-slate-500">{lc.startTime} - {lc.endTime}</span>
                  </div>
                  <h4 className="text-xs font-bold text-navy-950">{lc.title}</h4>
                </div>

                <Link
                  href="/teacher/live"
                  className="bg-navy-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                >
                  Edit Status
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Courses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-navy-950 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Assigned Batches & Curriculum</span>
            </h3>
            <Link href="/teacher/courses" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase block">{c.code}</span>
                  <h4 className="text-xs font-bold text-navy-950 mt-0.5">{c.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.duration}</p>
                </div>
                <Link
                  href="/teacher/materials"
                  className="bg-amber-400 text-navy-950 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-amber-500 transition"
                >
                  Upload Notes
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
