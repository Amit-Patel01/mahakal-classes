'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  BookOpen, Plus, Trash2, Check, AlertCircle,
  Layers, ChevronRight, Loader2, RefreshCw,
} from 'lucide-react';

export default function AdminCoursesPage() {
  // ── COURSES ──────────────────────────────────────────
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    duration: '1 Year',
    price: '',
  });
  const [creating, setCreating] = useState(false);
  const [courseMsg, setCourseMsg] = useState('');
  const [courseErr, setCourseErr] = useState('');

  // ── SUBJECTS ──────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [subjectMsg, setSubjectMsg] = useState('');
  const [subjectErr, setSubjectErr] = useState('');

  // ── CHAPTERS ──────────────────────────────────────────
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [chapterMsg, setChapterMsg] = useState('');
  const [chapterErr, setChapterErr] = useState('');

  const getId = (obj: any) => obj?.id || obj?._id?.toString() || '';

  // ── HELPERS ───────────────────────────────────────────
  const flash = (
    set: React.Dispatch<React.SetStateAction<string>>,
    clr: React.Dispatch<React.SetStateAction<string>>,
    text: string,
    isErr = false
  ) => {
    if (isErr) { clr(text); set(''); }
    else { set(text); clr(''); setTimeout(() => set(''), 4000); }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
    const res = await api.get('/courses');
    setLoadingCourses(false);
    if (res.success && res.data) {
      setCourses(res.data);
      if (res.data.length > 0 && !selectedCourseId) {
        const firstId = getId(res.data[0]);
        setSelectedCourseId(firstId);
        const firstSub = res.data[0].subjects?.[0];
        if (firstSub) setSelectedSubjectId(getId(firstSub));
      }
    }
  };

  useEffect(() => { loadCourses(); }, []); // eslint-disable-line

  // ── CREATE COURSE ─────────────────────────────────────
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCourseErr('');
    const res = await api.post('/courses', {
      ...formData,
      price: parseFloat(formData.price) || 0,
    });
    setCreating(false);
    if (res.success) {
      flash(setCourseMsg, setCourseErr, 'Course batch launched successfully! ✅');
      setFormData({ title: '', code: '', description: '', duration: '1 Year', price: '' });
      await loadCourses();
    } else {
      flash(setCourseMsg, setCourseErr, res.message || res.error?.message || 'Course creation failed. Please try again.', true);
    }
  };

  // ── DELETE COURSE ─────────────────────────────────────
  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Delete course "${title}"? This cannot be undone.`)) return;
    const res = await api.delete(`/courses/${id}`);
    if (res.success) await loadCourses();
    else alert(res.message || 'Delete failed');
  };

  // ── CREATE SUBJECT ────────────────────────────────────
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      flash(setSubjectMsg, setSubjectErr, 'Please select a course first.', true);
      return;
    }
    setCreatingSubject(true);
    setSubjectErr('');
    const res = await api.post('/courses/subjects', {
      courseId: selectedCourseId,
      name: subjectName,
      code: subjectCode,
    });
    setCreatingSubject(false);
    if (res.success) {
      flash(setSubjectMsg, setSubjectErr, 'Subject created successfully! ✅');
      setSubjectName('');
      setSubjectCode('');
      await loadCourses();
    } else {
      flash(setSubjectMsg, setSubjectErr, res.message || 'Subject creation failed.', true);
    }
  };

  // ── CREATE CHAPTER ────────────────────────────────────
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      flash(setChapterMsg, setChapterErr, 'Please select a subject first.', true);
      return;
    }
    setCreatingChapter(true);
    setChapterErr('');
    const res = await api.post('/courses/chapters', {
      subjectId: selectedSubjectId,
      title: chapterTitle,
    });
    setCreatingChapter(false);
    if (res.success) {
      flash(setChapterMsg, setChapterErr, 'Chapter added successfully! ✅');
      setChapterTitle('');
      await loadCourses();
    } else {
      flash(setChapterMsg, setChapterErr, res.message || 'Chapter creation failed.', true);
    }
  };

  const currentCourse = courses.find((c) => getId(c) === selectedCourseId);
  const currentSubject = currentCourse?.subjects?.find((s: any) => getId(s) === selectedSubjectId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Curriculum Center
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950 mt-1">
            Courses &amp; Batches Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage course batches, subjects, and chapters.
          </p>
        </div>
        <button
          onClick={loadCourses}
          disabled={loadingCourses}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingCourses ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ══ LAUNCH NEW COURSE ══════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-navy-950 mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-amber-500" />
          <span>Launch New Course Batch</span>
        </h3>

        {/* Success / Error */}
        {courseMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{courseMsg}</span>
          </div>
        )}
        {courseErr && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{courseErr}</span>
          </div>
        )}

        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Olympiad & KVPY Pinnacle Batch 2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Batch Code * <span className="text-slate-400 lowercase font-normal">(unique)</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. OLY-2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Description *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief overview of this course batch — target exam, syllabus coverage, etc."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 1 Year / 2 Years / 6 Months"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Course Fee (INR)
              </label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 15000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 bg-navy-950 hover:bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
          >
            {creating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Publishing...</span></>
            ) : (
              <><Plus className="w-4 h-4" /><span>Publish Course Batch</span></>
            )}
          </button>
        </form>
      </div>

      {/* ══ ADD SUBJECT & CHAPTER ══════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Subject */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-navy-950 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Add Subject to Course
          </h3>

          {subjectMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />{subjectMsg}
            </div>
          )}
          {subjectErr && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />{subjectErr}
            </div>
          )}

          <form onSubmit={handleCreateSubject} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Select Course *</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  const found = courses.find((c) => getId(c) === e.target.value);
                  const firstSub = found?.subjects?.[0];
                  setSelectedSubjectId(firstSub ? getId(firstSub) : '');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {courses.length === 0 && <option value="">— No courses yet —</option>}
                {courses.map((c) => (
                  <option key={getId(c)} value={getId(c)}>{c.title} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Subject Name *</label>
              <input
                type="text" required value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Inorganic Chemistry"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Subject Code *</label>
              <input
                type="text" required value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                placeholder="e.g. INORG-CHEM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <button
              type="submit" disabled={creatingSubject || !selectedCourseId}
              className="w-full flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-navy-950 font-bold text-xs py-2.5 rounded-xl transition"
            >
              {creatingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {creatingSubject ? 'Adding...' : 'Add Subject'}
            </button>
          </form>
        </div>

        {/* Add Chapter */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-navy-950 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            Add Chapter to Subject
          </h3>

          {chapterMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />{chapterMsg}
            </div>
          )}
          {chapterErr && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />{chapterErr}
            </div>
          )}

          <form onSubmit={handleCreateChapter} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  const found = courses.find((c) => getId(c) === e.target.value);
                  const firstSub = found?.subjects?.[0];
                  setSelectedSubjectId(firstSub ? getId(firstSub) : '');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {courses.map((c) => (
                  <option key={getId(c)} value={getId(c)}>{c.title} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Select Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {!currentCourse?.subjects?.length
                  ? <option value="">— Add a subject first —</option>
                  : currentCourse.subjects.map((s: any) => (
                    <option key={getId(s)} value={getId(s)}>{s.name}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Chapter Title *</label>
              <input
                type="text" required value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="e.g. Chapter 01: Atomic Structure"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <button
              type="submit" disabled={creatingChapter || !selectedSubjectId}
              className="w-full flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 rounded-xl transition"
            >
              {creatingChapter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {creatingChapter ? 'Adding...' : 'Add Chapter'}
            </button>
          </form>
        </div>
      </div>

      {/* ══ COURSES TABLE ══════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-base mb-5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <span>All Course Batches</span>
          <span className="ml-2 text-xs font-normal text-slate-400">({courses.length} total)</span>
        </h3>

        {loadingCourses ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No course batches yet. Launch your first batch above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Title &amp; Code</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Fee</th>
                  <th className="pb-3 font-semibold">Subjects</th>
                  <th className="pb-3 font-semibold">Enrolled</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map((c) => (
                  <tr key={getId(c)} className="hover:bg-slate-50/60 transition">
                    <td className="py-3">
                      <p className="font-bold text-navy-950">{c.title}</p>
                      <span className="text-[10px] text-amber-600 font-mono font-bold uppercase tracking-wider">
                        {c.code}
                      </span>
                      {/* Subjects expand */}
                      {c.subjects?.length > 0 && (
                        <div className="mt-1.5 pl-2 border-l-2 border-amber-100 space-y-0.5">
                          {c.subjects.slice(0, 3).map((sub: any) => (
                            <div key={getId(sub)} className="flex items-center gap-1 text-[10px] text-slate-500">
                              <ChevronRight className="w-2.5 h-2.5 text-amber-400" />
                              {sub.name}
                              {sub.chapters?.length > 0 && (
                                <span className="text-slate-300">· {sub.chapters.length} ch</span>
                              )}
                            </div>
                          ))}
                          {c.subjects.length > 3 && (
                            <p className="text-[10px] text-slate-300 pl-3">+{c.subjects.length - 3} more subjects</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">{c.duration}</td>
                    <td className="py-3 font-black text-navy-950">
                      {c.price === 0 ? <span className="text-emerald-600">Free</span> : `₹${c.price.toLocaleString()}`}
                    </td>
                    <td className="py-3 text-slate-600">{c.subjects?.length || 0}</td>
                    <td className="py-3 text-slate-600">{c._count?.enrollments || 0}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteCourse(getId(c), c.title)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Course Batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
