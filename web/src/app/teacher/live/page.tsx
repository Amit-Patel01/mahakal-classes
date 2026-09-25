'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Radio, Plus, Clock, Check, AlertCircle, ExternalLink } from 'lucide-react';

export default function TeacherLivePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    courseId: '',
    subjectId: '',
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '08:00 PM',
    endTime: '09:30 PM',
    streamUrl: '',
    streamPlatform: 'YouTube Live',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = () => {
    api.get('/courses').then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setCourses(res.data);
        if (!formData.courseId) {
          const firstCourse = res.data[0];
          const firstCourseId = firstCourse?.id || firstCourse?._id?.toString() || '';
          const firstSub = firstCourse?.subjects?.[0];
          const firstSubId = firstSub?.id || firstSub?._id?.toString() || '';
          setFormData((prev) => ({
            ...prev,
            courseId: firstCourseId,
            subjectId: firstSubId,
          }));
        }
      }
    });

    api.get('/live-classes').then((res) => {
      if (res.success && res.data) {
        setLiveClasses(res.data);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const res = await api.post('/live-classes', formData);
    setSubmitting(false);

    if (res.success) {
      setMessage('Live lecture scheduled successfully and student notifications broadcasted!');
      setFormData((prev) => ({ ...prev, title: '', streamUrl: '' }));
      loadData();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await api.patch(`/live-classes/${id}/status`, { status: newStatus });
    if (res.success) {
      loadData();
    }
  };

  const selectedCourse = courses.find((c) => c.id === formData.courseId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
          Broadcast Scheduling
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Live Classroom Masterclasses</h1>
      </div>

      {/* SCHEDULE FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-navy-950 mb-4 flex items-center gap-2">
          <Radio className="w-5 h-5 text-red-500" />
          <span>Schedule New Live Masterclass</span>
        </h3>

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => {
                  const cId = e.target.value;
                  const found = courses.find((c) => c.id === cId);
                  setFormData((prev) => ({
                    ...prev,
                    courseId: cId,
                    subjectId: found?.subjects?.[0]?.id || '',
                  }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Subject</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                {selectedCourse?.subjects?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lecture Topic / Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Solving 20 Tough Rotational Motion Problems Live"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
              </input>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="08:00 PM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Time</label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="09:30 PM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stream / Meeting URL</label>
              <input
                type="url"
                required
                value={formData.streamUrl}
                onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                placeholder="https://youtube.com/live/... or Zoom link"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Platform</label>
              <select
                value={formData.streamPlatform}
                onChange={(e) => setFormData({ ...formData, streamPlatform: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="YouTube Live">YouTube Live</option>
                <option value="Zoom Meeting">Zoom Meeting</option>
                <option value="Google Meet">Google Meet</option>
                <option value="RTMP Custom">RTMP Custom Stream</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            <Radio className="w-4 h-4" />
            <span>{submitting ? 'Scheduling...' : 'Schedule Live Class'}</span>
          </button>
        </form>
      </div>

      {/* SCHEDULED CLASSES LIST WITH STATUS SWITCH */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-base mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>Broadcast Classes Monitor ({liveClasses.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Course</th>
                <th className="pb-3 font-semibold">Schedule</th>
                <th className="pb-3 font-semibold">Status Control</th>
                <th className="pb-3 font-semibold text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liveClasses.map((lc) => (
                <tr key={lc.id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-navy-950 max-w-xs truncate">{lc.title}</td>
                  <td className="py-3 text-slate-600">{lc.course?.title}</td>
                  <td className="py-3 text-slate-500">
                    {new Date(lc.scheduledDate).toLocaleDateString()} • {lc.startTime}
                  </td>
                  <td className="py-3">
                    <select
                      value={lc.status}
                      onChange={(e) => handleStatusChange(lc.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                        lc.status === 'LIVE'
                          ? 'bg-red-500 text-white border-red-600 animate-pulse'
                          : lc.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="LIVE">LIVE NOW (Broadcast)</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <a
                      href={lc.streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg inline-flex items-center gap-1"
                    >
                      <span>Join</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
