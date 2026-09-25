'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Search, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStudents = () => {
    setLoading(true);
    api.get(`/admin/students${search ? `?search=${encodeURIComponent(search)}` : ''}`).then((res) => {
      if (res.success && res.data) {
        setStudents(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStudents();
  }, [search]);

  const toggleStatus = async (id: string) => {
    const res = await api.patch(`/admin/users/${id}/status`);
    if (res.success) {
      loadStudents();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Student Administration
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Enrolled Students Directory</h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, email, mobile..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Loading student records from MongoDB...
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No students found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Enrollment #</th>
                  <th className="pb-3 font-semibold">Contact & Mobile</th>
                  <th className="pb-3 font-semibold">Target Batch</th>
                  <th className="pb-3 font-semibold">Tests Taken</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-navy-950">
                      <div>{st.name}</div>
                      <div className="text-[11px] font-normal text-slate-400">{st.email}</div>
                    </td>
                    <td className="py-3 font-mono font-semibold text-amber-600">
                      {st.studentProfile?.enrollmentNumber || 'N/A'}
                    </td>
                    <td className="py-3 text-slate-600">{st.mobile}</td>
                    <td className="py-3 font-semibold text-slate-800">
                      {st.studentProfile?.course?.title || 'General'}
                    </td>
                    <td className="py-3 font-bold text-navy-950">
                      {st._count?.testAttempts || 0}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                          st.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {st.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => toggleStatus(st.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                          st.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {st.isActive ? 'Deactivate' : 'Activate'}
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
