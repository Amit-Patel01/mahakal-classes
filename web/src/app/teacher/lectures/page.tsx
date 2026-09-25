'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Video, Plus, Check, AlertCircle, BookOpen,
  Layers, ExternalLink, Clock, Play, Loader2,
} from 'lucide-react';
import { formatVideoEmbedUrl } from '@/lib/videoUtils';

export default function TeacherLecturesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [lectures, setLectures] = useState<any[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [orderIndex, setOrderIndex] = useState('');
  const [chapterId, setChapterId] = useState('');

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [creating, setCreating] = useState(false);
  const [fetchingLectures, setFetchingLectures] = useState(false);

  const getId = (obj: any) => obj?.id || obj?._id?.toString() || '';

  // Load all courses with subjects/chapters
  const loadCourses = async () => {
    const res = await api.get('/courses');
    if (res.success && Array.isArray(res.data)) {
      const list = res.data;
      setCourses(list);
      if (list.length > 0 && !selectedCourseId) {
        const firstId = getId(list[0]);
        setSelectedCourseId(firstId);
        const firstSub = list[0].subjects?.[0];
        if (firstSub) setSelectedSubjectId(getId(firstSub));
      }
    }
  };

  // Load lectures for selected course
  const loadLectures = async (courseId: string) => {
    if (!courseId) return;
    setFetchingLectures(true);
    const res = await api.get(`/lectures/course/${courseId}`);
    setFetchingLectures(false);
    if (res.success && Array.isArray(res.data)) {
      setLectures(res.data);
    } else {
      setLectures([]);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (selectedCourseId) loadLectures(selectedCourseId);
  }, [selectedCourseId]); // eslint-disable-line

  const currentCourse = courses.find((c) => getId(c) === selectedCourseId);
  const currentSubject = currentCourse?.subjects?.find((s: any) => getId(s) === selectedSubjectId);

  const showMsg = (text: string) => {
    setMsg(text); setErr('');
    setTimeout(() => setMsg(''), 4000);
  };
  const showErr = (text: string) => { setErr(text); setMsg(''); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedSubjectId || !title) {
      showErr('Course, Subject aur Title required hain');
      return;
    }
    setCreating(true);
    setErr('');

    const res = await api.post('/lectures', {
      courseId: selectedCourseId,
      subjectId: selectedSubjectId,
      chapterId: chapterId || undefined,
      title,
      description,
      videoUrl: videoUrl || undefined,
      durationMinutes: durationMinutes || '0',
      orderIndex: orderIndex || '0',
    });

    setCreating(false);

    if (res.success) {
      showMsg('Lecture successfully create ho gaya! ✅');
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setDurationMinutes('');
      setOrderIndex('');
      setChapterId('');
      await loadLectures(selectedCourseId);
    } else {
      showErr(res.message || res.error || 'Lecture create nahi hua, dobara try karein');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Video Lectures
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Manage Recorded Lectures</h1>
        <p className="text-xs text-slate-500 mt-1">
          Course select karein, subject chunein, aur naya lecture add karein
        </p>
      </div>

      {/* Messages */}
      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}
      {err && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {/* Batch / Subject Selector Row */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Select Course / Batch
          </label>
          {courses.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Koi course nahi mila</p>
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const found = courses.find((c) => getId(c) === e.target.value);
                const firstSub = found?.subjects?.[0];
                setSelectedSubjectId(firstSub ? getId(firstSub) : '');
                setChapterId('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              {courses.map((c) => (
                <option key={getId(c)} value={getId(c)}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Select Subject
          </label>
          {!currentCourse?.subjects?.length ? (
            <p className="text-xs text-slate-400 italic">Pehle subject banayein (Courses page se)</p>
          ) : (
            <select
              value={selectedSubjectId}
              onChange={(e) => { setSelectedSubjectId(e.target.value); setChapterId(''); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              {currentCourse.subjects.map((s: any) => (
                <option key={getId(s)} value={getId(s)}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Create Lecture Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-extrabold text-navy-950 mb-5 flex items-center gap-2">
          <Video className="w-4 h-4 text-blue-500" />
          <span>Add New Lecture</span>
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Lecture Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chemical Bonding — Introduction"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Is lecture ke baare mein short description..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
          </div>

          {/* Video URL */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Video URL (YouTube or Google Drive)
              </label>
              {videoUrl.trim() && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ✅ {formatVideoEmbedUrl(videoUrl).detectedName} Detected
                </span>
              )}
            </div>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube link (https://youtu.be/... or watch?v=...) OR Google Drive share link (https://drive.google.com/file/d/...)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Supports: YouTube (Standard, Shorts, youtu.be) and Google Drive video links.
            </p>
          </div>

          {/* Chapter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Chapter (Optional)
            </label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="">— No specific chapter —</option>
              {currentSubject?.chapters?.map((ch: any) => (
                <option key={getId(ch)} value={getId(ch)}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Order Index */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Order / Sequence
            </label>
            <input
              type="number"
              min="0"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              placeholder="e.g. 1"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={creating || !selectedCourseId || !selectedSubjectId}
              className="w-full bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating...</span></>
              ) : (
                <><Plus className="w-4 h-4" /><span>Create Lecture</span></>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lectures List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-extrabold text-navy-950 mb-4 flex items-center gap-2">
          <Play className="w-4 h-4 text-purple-500" />
          <span>
            Lectures in {currentCourse?.title || 'Selected Course'}
          </span>
          {!fetchingLectures && (
            <span className="ml-auto text-xs font-normal text-slate-400">
              {lectures.length} lecture(s)
            </span>
          )}
        </h3>

        {fetchingLectures ? (
          <div className="flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading lectures...</span>
          </div>
        ) : lectures.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <Video className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Abhi tak koi lecture nahi hai.</p>
            <p className="mt-1">Upar form se pehla lecture add karein.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lectures.map((lec, idx) => (
              <div
                key={getId(lec) || idx}
                className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                  {lec.orderIndex ?? idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-navy-950 truncate">{lec.title}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {lec.subject?.name && (
                      <span className="text-[10px] text-slate-500">
                        📚 {lec.subject.name}
                      </span>
                    )}
                    {lec.chapter?.title && (
                      <span className="text-[10px] text-slate-500">
                        📄 {lec.chapter.title}
                      </span>
                    )}
                    {lec.durationMinutes > 0 && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {lec.durationMinutes} min
                      </span>
                    )}
                  </div>
                  {lec.description && (
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{lec.description}</p>
                  )}
                </div>
                {lec.videoUrl && (
                  <a
                    href={lec.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                    title="Video open karein"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
