'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { User, Mail, Phone, MapPin, Target, ShieldCheck, Check } from 'lucide-react';

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [academicGoal, setAcademicGoal] = useState(user?.studentProfile?.academicGoal || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const res = await api.put('/auth/profile', { name, mobile, academicGoal });
    setSaving(false);

    if (res.success && res.data) {
      updateUser({ name, mobile });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Student Information
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">My Academic Profile</h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy-950 font-black text-2xl shadow-md">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-950">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
              Enrollment: {user?.studentProfile?.enrollmentNumber}
            </span>
          </div>
        </div>

        {saved && (
          <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email (Read-only)
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Mobile
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Academic Goal
            </label>
            <input
              type="text"
              value={academicGoal}
              onChange={(e) => setAcademicGoal(e.target.value)}
              placeholder="e.g. Under AIR 500 in JEE Advanced"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md disabled:opacity-50 mt-2"
          >
            {saving ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
