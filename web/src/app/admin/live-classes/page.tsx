'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Radio, Plus, Video, Calendar, User, BookOpen, Clock, Play, CheckCircle2, X } from 'lucide-react';

export default function AdminLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    subjectId: '',
    scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    meetingUrl: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/live-classes').then((res) => {
        if (res.success && res.data) setLiveClasses(res.data);
      }),
      api.get('/courses').then((res) => {
        if (res.success && res.data) {
          setCourses(res.data);
          if (res.data.length > 0 && !formData.courseId) {
            setFormData((prev) => ({
              ...prev,
              courseId: res.data[0].id || res.data[0]._id,
              subjectId: res.data[0].subjects?.[0]?.id || '',
            }));
          }
        }
      }),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await api.post('/live-classes', formData);
    setSubmitting(false);

    if (res.success) {
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        courseId: courses[0]?.id || courses[0]?._id || '',
        subjectId: courses[0]?.subjects?.[0]?.id || '',
        scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        meetingUrl: '',
      });
      loadData();
    } else {
      setError(res.message || 'Failed to schedule live class');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await api.patch(`/live-classes/${id}/status`, { status });
    if (res.success) {
      loadData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Live Stream Operations
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Live Classes & Webinars</h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Live Class</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading live broadcast schedule...</div>
        ) : liveClasses.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Radio className="w-10 h-10 mx-auto mb-2 opacity-50 text-red-500" />
            <p className="font-semibold text-slate-600 text-sm">No live classes scheduled</p>
            <p className="text-xs text-slate-400 mt-1">Click "Schedule Live Class" to create a new session.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveClasses.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-2xl p-5 hover:border-red-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        item.status === 'LIVE'
                          ? 'bg-red-600 text-white animate-pulse'
                          : item.status === 'UPCOMING'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status === 'LIVE' ? '🔴 Live Now' : item.status}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.scheduledAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">{item.title}</h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{item.description}</p>
                  )}

                  <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.course?.title || 'General Batch'}</span>
                    </div>
                    {item.teacher && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Faculty: {item.teacher.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2 mt-2">
                  {item.status === 'UPCOMING' && (
                    <button
                      onClick={() => updateStatus(item.id, 'LIVE')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Go Live</span>
                    </button>
                  )}

                  {item.status === 'LIVE' && (
                    <button
                      onClick={() => updateStatus(item.id, 'COMPLETED')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>End Stream</span>
                    </button>
                  )}

                  {item.meetingUrl && (
                    <a
                      href={item.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
                    >
                      Join Link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schedule Live Class</h3>
                <p className="text-xs text-slate-500">Create live broadcast session for students</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Masterclass on Thermodynamics & Carnot Engine"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Target Batch *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => {
                    const c = courses.find((x) => (x.id || x._id) === e.target.value);
                    setFormData({
                      ...formData,
                      courseId: e.target.value,
                      subjectId: c?.subjects?.[0]?.id || '',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {courses.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.title || c.name} ({c.code || 'BATCH'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stream / Meeting URL</label>
                  <input
                    type="url"
                    value={formData.meetingUrl}
                    onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                    placeholder="https://zoom.us/j/... or YouTube"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key concepts, syllabus topics and prerequisites..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-xs"
                >
                  {submitting ? 'Scheduling...' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
