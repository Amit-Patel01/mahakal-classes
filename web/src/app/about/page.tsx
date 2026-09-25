'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { Award, ShieldCheck, Users, CheckCircle2, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

export default function AboutPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => {
      if (res.success && res.data) setStats(res.data.counts);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white py-14 sm:py-20 border-b border-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200/80 px-4 py-1.5 rounded-full mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Our Vision & Pedagogy
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            About Mahakal Classes
          </h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-4 leading-relaxed max-w-2xl mx-auto">
            Founded with a vision to democratize competitive exam education, Mahakal Classes has
            empowered thousands of students to achieve their dreams of entering premier institutions.
          </p>
        </div>
      </section>

      {/* Live Stats from MongoDB */}
      {stats && (
        <section className="bg-slate-50/60 border-b border-slate-100 py-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
              {[
                { label: 'Enrolled Students', value: stats.totalStudents },
                { label: 'Active Batches', value: stats.totalCourses },
                { label: 'Study Resources', value: stats.totalMaterials },
                { label: 'Tests Conducted', value: stats.totalTests },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all"
                >
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">{s.value}+</p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Institutional Pillars */}
      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1 space-y-12 sm:space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Pioneering Pedagogy</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Conceptual clarity over rote memorization. Our multi-tiered teaching architecture
              ensures rigorous foundations from fundamental concepts to national competition levels.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Expert Mentorship</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Mentored by experienced educators with proven track records in IIT-JEE, NEET, and
              Board exam preparation with years of specialized coaching expertise.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Digital Learning Platform</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Powered by an integrated LMS with MongoDB GridFS file chunking, low-latency live
              streaming masterclasses, and instant CBT auto-evaluation.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-blue-500/15 relative overflow-hidden">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                Core Offerings
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">What Mahakal Classes Delivers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Live Interactive Classes with Experienced Faculty',
                'Recorded Video Lectures — Revisit Anytime',
                'Handwritten HE Notes & Complete Formula Sheets',
                'National Level Online CBT Exam Test Series',
                'Instant Auto-Evaluation & Performance Analytics',
                'Personal Academic Mentorship & Doubt Resolution',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-white font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
