'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import {
  GraduationCap,
  Radio,
  BookOpen,
  Video,
  FileText,
  CheckSquare,
  Award,
  ArrowRight,
  Users,
  BarChart3,
  Zap,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [activeLive, setActiveLive] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/courses').then((res) => {
        if (res.success && res.data) setCourses(res.data.slice(0, 3));
      }),
      api.get('/live-classes/active').then((res) => {
        if (res.success && res.data) setActiveLive(res.data);
      }),
      api.get('/admin/stats').then((res) => {
        if (res.success && res.data) setStats(res.data.counts);
      }),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* LIVE BANNER */}
      {activeLive && (
        <div className="bg-red-500/10 backdrop-blur-md border-b border-red-200/80 px-4 py-3">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                Live Now
              </span>
              <p className="text-xs sm:text-sm font-semibold text-red-950 truncate max-w-xs sm:max-w-md">
                {activeLive.title}
              </p>
            </div>
            <Link
              href="/login"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-full transition shadow-xs flex items-center gap-1 shrink-0"
            >
              <span>Join Class</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* MODERN LIGHT HERO WITH COLORFUL GLOW */}
      <section className="relative py-14 sm:py-20 lg:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Admissions Pill */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-blue-200/80 shadow-sm px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 tracking-wide uppercase">
                Admissions Open • 2026 Batch
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
              Excel in{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                IIT-JEE & NEET
              </span>
              <br className="hidden sm:block" /> with Mahakal Classes
            </h1>

            {/* Subheading */}
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
              Empowering students with top faculty lectures, live doubt clearing, comprehensive
              handwritten study material, and all-India level computer-based mock tests.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-full text-sm transition shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Enroll Online Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/courses"
                className="w-full sm:w-auto bg-white/80 backdrop-blur-md hover:bg-white border border-slate-200/80 text-slate-700 font-semibold px-8 py-3.5 rounded-full text-sm transition shadow-sm hover:border-slate-300 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Explore Batches</span>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16 max-w-4xl mx-auto">
            {[
              { value: stats ? `${stats.totalStudents}+` : '...', label: 'Active Students' },
              { value: stats ? `${stats.totalCourses}+` : '...', label: 'Target Batches' },
              { value: stats ? `${stats.totalTests}+` : '...', label: 'Tests Conducted' },
              { value: stats ? `${stats.totalMaterials}+` : '...', label: 'Study Resources' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/70 backdrop-blur-lg border border-white/80 p-4 sm:p-5 rounded-2xl text-center shadow-xs hover:shadow-md transition-all hover:bg-white/90"
              >
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
                  {s.value}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACCESS ECOSYSTEM */}
      <section className="py-12 sm:py-16 bg-white/50 backdrop-blur-md border-y border-slate-200/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">
              Student Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Everything in One Portal
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              All digital learning tools tailored for competitive exam success
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              {
                title: 'Live Classes',
                desc: 'Real-time lectures',
                icon: Radio,
                href: '/student/live',
                color: 'text-red-600 bg-red-50/90 border-red-100',
              },
              {
                title: 'Study Material',
                desc: 'Notes & Formulae',
                icon: FileText,
                href: '/student/material',
                color: 'text-blue-600 bg-blue-50/90 border-blue-100',
              },
              {
                title: 'Video Lectures',
                desc: 'Recorded modules',
                icon: Video,
                href: '/student/lectures',
                color: 'text-purple-600 bg-purple-50/90 border-purple-100',
              },
              {
                title: 'Online Tests',
                desc: 'CBT Exam Series',
                icon: CheckSquare,
                href: '/student/tests',
                color: 'text-emerald-600 bg-emerald-50/90 border-emerald-100',
              },
              {
                title: 'Gallery',
                desc: 'Campus & Toppers',
                icon: Award,
                href: '/gallery',
                color: 'text-amber-600 bg-amber-50/90 border-amber-100',
              },
              {
                title: 'Performance',
                desc: 'Analytics & Rank',
                icon: BarChart3,
                href: '/student/analytics',
                color: 'text-indigo-600 bg-indigo-50/90 border-indigo-100',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="bg-white/80 backdrop-blur-md hover:bg-white border border-white/80 hover:border-blue-300 p-4 sm:p-5 rounded-2xl text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col items-center group shadow-xs"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border ${item.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 mt-1 line-clamp-1">
                    {item.desc}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-10 gap-3">
            <div>
              <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">
                Target Batches
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Featured Programs
              </h2>
            </div>
            <Link
              href="/courses"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <span>Explore all courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 rounded-3xl border border-white h-64 animate-pulse" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div
                  key={c._id || c.id}
                  className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group hover:bg-white"
                >
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                        {c.code || 'BATCH'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {c.subject || 'All Subjects'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {c.name || c.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {c.description || 'Structured academic preparation with live lectures and test series.'}
                    </p>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {c.fee ? (
                          <>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Course Fee
                            </span>
                            <span className="text-lg font-black text-slate-900">
                              ₹{Number(c.fee).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Free Enrolment
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/courses/${c._id || c.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1 shadow-xs active:scale-95"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/70 backdrop-blur-md rounded-3xl border border-white p-8">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No courses listed at the moment</p>
              <p className="text-xs text-slate-400 mt-1">Check back shortly for new batch openings</p>
            </div>
          )}
        </div>
      </section>

      {/* WHY MAHAKAL */}
      <section className="py-12 sm:py-16 bg-white/50 backdrop-blur-md border-y border-slate-200/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">
              Proven Pedagogy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Why Choose Mahakal Classes?
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Dedicated to academic rigor, individual mentorship, and rank delivery
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Users,
                title: 'Expert Faculty',
                desc: 'Specialized mentors with decades of proven exam success and track records.',
                color: 'text-blue-600 bg-blue-50 border-blue-100',
              },
              {
                icon: Radio,
                title: 'Live Interactive Sessions',
                desc: 'Engage live with faculty, clarify your concepts, and solve doubts instantly.',
                color: 'text-red-600 bg-red-50 border-red-100',
              },
              {
                icon: ShieldCheck,
                title: 'Comprehensive Notes',
                desc: 'Complete handwritten chapter notes, formula sheets, and DPP problem sheets.',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
              },
              {
                icon: Zap,
                title: 'National CBT Tests',
                desc: 'Exact exam simulation test engine with detailed ranking and question analytics.',
                color: 'text-amber-600 bg-amber-50 border-amber-100',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white/80 backdrop-blur-md border border-white/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all hover:bg-white"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODERN CTA CARD */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-8 sm:p-12 shadow-2xl shadow-indigo-500/25 relative overflow-hidden text-center">
            {/* Ambient Circles inside card */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-100 uppercase tracking-widest bg-white/10 px-3.5 py-1 rounded-full inline-block mb-4">
                Start Today
              </span>
              <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight leading-tight">
                Ready to Secure Your Top Rank?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-lg mx-auto">
                Join Mahakal Classes now to unlock structured video lectures, test series, and study
                materials.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="bg-white text-indigo-900 font-bold px-8 py-3.5 rounded-full text-sm hover:bg-blue-50 transition shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Enroll for Free</span>
                </Link>
                <Link
                  href="/contact"
                  className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition flex items-center justify-center gap-1.5"
                >
                  <span>Contact Campus</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
