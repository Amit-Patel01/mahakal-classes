'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Plus, Check, Layers, AlertCircle, ChevronRight } from 'lucide-react';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const getId = (obj: any) => obj?.id || obj?._id?.toString() || '';

  const loadCourses = async () => {
    const res = await api.get('/courses');
    if (res.success && res.data) {
      const list = res.data;
      setCourses(list);
      if (list.length > 0 && !selectedCourseId) {
        const firstId = getId(list[0]);
        setSelectedCourseId(firstId);
        const firstSub = list[0].subjects?.[0];
        setSelectedSubjectId(firstSub ? getId(firstSub) : '');
      }
    }
  };

  useEffect(() => {
    loadCourses();
  }, []); // eslint-disable-line

  const showMsg = (text: string) => {
    setMsg(text);
    setErr('');
    setTimeout(() => setMsg(''), 4000);
  };

  const showErr = (text: string) => {
    setErr(text);
    setMsg('');
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      showErr('Pehle ek course/batch select karein');
      return;
    }
    setLoading(true);
    setErr('');
    const res = await api.post('/courses/subjects', {
      courseId: selectedCourseId,
      name: subjectName,
      code: subjectCode,
    });
    setLoading(false);
    if (res.success) {
      showMsg('Subject successfully create ho gaya! ✅');
      setSubjectName('');
      setSubjectCode('');
      await loadCourses();
    } else {
      showErr(res.message || res.error || 'Subject create nahi hua, dobara try karein');
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      showErr('Pehle ek subject select karein');
      return;
    }
    setLoading(true);
    setErr('');
    const res = await api.post('/courses/chapters', {
      subjectId: selectedSubjectId,
      title: chapterTitle,
    });
    setLoading(false);
    if (res.success) {
      showMsg('Chapter successfully add ho gaya! ✅');
      setChapterTitle('');
      await loadCourses();
    } else {
      showErr(res.message || res.error || 'Chapter add nahi hua, dobara try karein');
    }
  };

  const currentCourse = courses.find((c) => getId(c) === selectedCourseId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Curriculum Structuring
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Courses, Subjects &amp; Chapters</h1>
      </div>

      {/* Success Message */}
      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Error Message */}
      {err && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {/* Select Active Course */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-navy-950 text-sm">Select Active Batch to Manage</h3>
          <p className="text-xs text-slate-500">Add subjects and organize chapters</p>
        </div>
        {courses.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Koi course nahi mila. Admin se course banwayein.</p>
        ) : (
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              const found = courses.find((c) => getId(c) === e.target.value);
              const firstSub = found?.subjects?.[0];
              setSelectedSubjectId(firstSub ? getId(firstSub) : '');
              setErr('');
            }}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-950"
          >
            {courses.map((c) => (
              <option key={getId(c)} value={getId(c)}>
                {c.title} ({c.code})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ADD SUBJECT */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-navy-950 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Add New Subject {currentCourse ? `to ${currentCourse.code}` : ''}</span>
          </h3>

          <form onSubmit={handleCreateSubject} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Inorganic Chemistry"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="e.g. INORG-CHEM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedCourseId}
              className="w-full bg-navy-950 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-navy-900 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Subject'}</span>
            </button>
          </form>
        </div>

        {/* ADD CHAPTER */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-navy-950 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Add Chapter / Topic to Subject</span>
          </h3>

          <form onSubmit={handleCreateChapter} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Select Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {!currentCourse?.subjects?.length && (
                  <option value="">— Pehle ek subject banayein —</option>
                )}
                {currentCourse?.subjects?.map((s: any) => (
                  <option key={getId(s)} value={getId(s)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Chapter Title *
              </label>
              <input
                type="text"
                required
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="e.g. Chapter 03: Chemical Bonding &amp; Molecular Structure"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSubjectId}
              className="w-full bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Adding...' : 'Add Chapter'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* SUBJECTS LIST */}
      {currentCourse?.subjects?.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-navy-950 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Subjects in {currentCourse.title}</span>
            <span className="ml-auto text-xs font-normal text-slate-400">{currentCourse.subjects.length} subject(s)</span>
          </h3>
          <div className="space-y-2">
            {currentCourse.subjects.map((sub: any) => (
              <div key={getId(sub)} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy-950">{sub.name}</p>
                    <p className="text-[10px] text-slate-400">{sub.code}</p>
                  </div>
                  <span className="text-xs text-slate-400">{sub.chapters?.length || 0} chapters</span>
                </div>
                {sub.chapters?.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-amber-200 space-y-1">
                    {sub.chapters.map((ch: any) => (
                      <div key={getId(ch)} className="flex items-center gap-1 text-[11px] text-slate-600">
                        <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        {ch.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
