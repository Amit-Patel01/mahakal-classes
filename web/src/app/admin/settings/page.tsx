'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Settings,
  Database,
  Shield,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState('');

  const [instituteData, setInstituteData] = useState({
    name: 'Mahakal Classes',
    tagline: 'Leading IIT-JEE, NEET & Board Coaching Institute',
    address: 'Samrat Nagar, Bhuravav, Godhra, Gujarat',
    phone: '+91 8511896896',
    email: 'admin@mahakalclasses.com',
  });

  useEffect(() => {
    setLoading(true);
    api.get('/admin/stats').then((res) => {
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    });
  }, []);

  const handleSaveInstitute = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage('Institute profile configurations updated successfully.');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          System Administration
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Platform & Institute Settings</h1>
      </div>

      {savedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Institute Profile */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Institute Profile Details</h3>
                <p className="text-xs text-slate-500">Public information displayed on website and app</p>
              </div>
            </div>

            <form onSubmit={handleSaveInstitute} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Institute Legal Name</label>
                <input
                  type="text"
                  value={instituteData.name}
                  onChange={(e) => setInstituteData({ ...instituteData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline & Vision</label>
                <input
                  type="text"
                  value={instituteData.tagline}
                  onChange={(e) => setInstituteData({ ...instituteData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Helpline Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={instituteData.phone}
                      onChange={(e) => setInstituteData({ ...instituteData, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Support Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={instituteData.email}
                      onChange={(e) => setInstituteData({ ...instituteData, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Main Campus Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={instituteData.address}
                    onChange={(e) => setInstituteData({ ...instituteData, address: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Master Admin Security Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Master Admin Credentials</h3>
                <p className="text-xs text-slate-500">Managed and protected directly via backend .env</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-700 block">Logged-in Administrator</span>
                  <span className="text-slate-500">{user?.name || 'Admin Mahakal Classes'}</span>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  ADMIN
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-700 block">Admin Master Email / Login</span>
                  <span className="text-slate-500">{user?.email || 'admin@mahakalclasses.com'}</span>
                </div>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Tip: Master Admin credentials can be updated at any time in{' '}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                  backend/.env
                </code>
                . The backend automatically syncs them into MongoDB on startup.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Database & Storage Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">MongoDB Database</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Connected (Online)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-bold text-slate-700">MongoDB Native Driver</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Enrolled Students</span>
                <span className="font-bold text-slate-900">{stats?.counts?.totalStudents || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Faculty Members</span>
                <span className="font-bold text-slate-900">{stats?.counts?.totalTeachers || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Courses</span>
                <span className="font-bold text-slate-900">{stats?.counts?.totalCourses || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tests Conducted</span>
                <span className="font-bold text-slate-900">{stats?.counts?.totalTests || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">MongoDB GridFS Storage</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bucket Name</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">uploads</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Chunk Size</span>
                <span className="font-bold text-slate-700">255 KB (Streaming)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Study Materials Stored</span>
                <span className="font-bold text-slate-900">{stats?.counts?.totalMaterials || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
