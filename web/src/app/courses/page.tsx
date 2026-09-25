'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { BookOpen, Search, ArrowRight, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/courses${search ? `?search=${encodeURIComponent(search)}` : ''}`).then((res) => {
      if (res.success && res.data) {
        setCourses(res.data);
      }
      setLoading(false);
    });
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      {/* Modern Light Hero Banner */}
      <section className="bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white py-12 sm:py-16 border-b border-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200/80 px-4 py-1.5 rounded-full mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Academic Programs & Batches
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Target Batches & Comprehensive Courses
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mt-3 leading-relaxed">
            Engineered by India's top educators with comprehensive syllabus coverage, live lectures,
            and rigorous test series.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto mt-6 sm:mt-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course (e.g. JEE, NEET, Physics)..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm transition"
            />
          </div>
        </div>
      </section>

      {/* Course List */}
      <main className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 h-72 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No courses match your query</p>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword or clear filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course) => (
              <div
                key={course.id || course._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {course.code || 'BATCH'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {course.subject || 'All Subjects'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {course.name || course.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {course.description || 'Structured academic preparation with live lectures, chapter notes and CBT tests.'}
                  </p>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {course.fee ? (
                        <>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Tuition Fee
                          </span>
                          <span className="text-lg font-black text-slate-900">
                            ₹{Number(course.fee).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Free Enrolment
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/courses/${course.id || course._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
