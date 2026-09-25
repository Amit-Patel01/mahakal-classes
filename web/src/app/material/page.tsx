'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/authContext';
import { Lock, LogIn, ArrowRight, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export default function MaterialGatePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect authenticated users directly to their respective material repository
        if (user.role === 'ADMIN') {
          router.replace('/admin/materials');
        } else if (user.role === 'TEACHER') {
          router.replace('/teacher/materials');
        } else {
          router.replace('/student/material');
        }
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center relative overflow-hidden">
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

          {/* Lock Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Private Study Repository</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Login Required for HE Material
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Handwritten notes, assignments, PYQ papers, and formula handbooks are private resources exclusively reserved for enrolled students and faculty.
          </p>

          <div className="space-y-3">
            <Link
              href="/login?redirect=/student/material"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login as Student / Teacher</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/courses"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 px-6 rounded-2xl transition flex items-center justify-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Explore Courses & Enroll</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-400">
            Protected under Mahakal Classes Academic Content Policy
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
