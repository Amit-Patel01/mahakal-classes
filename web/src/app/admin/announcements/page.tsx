'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bell, Send, Check } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [msg, setMsg] = useState('');

  const loadAnnouncements = () => {
    api.get('/announcements').then((res) => {
      if (res.success && res.data) {
        setAnnouncements(res.data);
      }
    });
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const res = await api.post('/announcements', {
      title,
      content,
      targetRole: targetRole || null,
      isPinned,
    });

    if (res.success) {
      setMsg('Notice broadcasted to all students and faculty portals successfully!');
      setTitle('');
      setContent('');
      loadAnnouncements();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Communications
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Platform Broadcasts & Notices</h1>
      </div>

      {/* CREATE ANNOUNCEMENT FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-navy-950 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <span>Broadcast New Notice</span>
        </h3>

        {msg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Headline</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Special Physics Doubt Clinic this Sunday"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">All Enrolled Students & Faculty</option>
                <option value="STUDENT">Students Only</option>
                <option value="TEACHER">Faculty Members Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Message</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full announcement body..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pin"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded"
            />
            <label htmlFor="pin" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Pin this notice to top of student dashboard
            </label>
          </div>

          <button
            type="submit"
            className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Publish Broadcast</span>
          </button>
        </form>
      </div>

      {/* ANNOUNCEMENTS LIST */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-base mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <span>Active Broadcast History ({announcements.length})</span>
        </h3>

        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {a.isPinned && (
                    <span className="bg-amber-400 text-navy-950 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                      PINNED
                    </span>
                  )}
                  <h4 className="text-xs font-bold text-navy-950">{a.title}</h4>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
