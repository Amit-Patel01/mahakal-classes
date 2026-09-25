'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BookOpen, Layers, Video, FileText, CheckSquare, ArrowRight } from 'lucide-react';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then((res) => {
      if (res.success && res.data) {
        setCourses(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Enrolled Programs
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">My Academic Courses</h1>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No active course enrollments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <div
              key={c.id || c._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-amber-400 text-navy-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                    {c.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">
                    Active
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-navy-950 mb-2 leading-snug">{c.title}</h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed line-clamp-3">
                  {c.description}
                </p>

                {/* Subject list */}
                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Specialized Subjects Included:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {c.subjects?.map((s: any) => (
                      <span
                        key={s.id || s._id}
                        className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-xl font-medium"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-purple-500" />
                    <span>{c._count?.lectures || 0} Lectures</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{c._count?.tests || 0} Tests</span>
                  </span>
                </div>

                <Link
                  href="/student/lectures"
                  className="bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1"
                >
                  <span>Open Classroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
