'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileText, Upload, Trash2, Download, Check, AlertCircle, Eye } from 'lucide-react';
import MediaModal from '@/components/MediaModal';

export default function TeacherMaterialsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    courseId: '',
    subjectId: '',
    title: '',
    description: '',
    category: 'NOTES',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [activePdf, setActivePdf] = useState<{ isOpen: boolean; title: string; fileId: string }>({
    isOpen: false,
    title: '',
    fileId: '',
  });

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

    api.get('/materials').then((res) => {
      if (res.success && res.data) {
        setMaterials(res.data);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCourseChange = (cId: string) => {
    const found = courses.find((c) => (c.id || c._id?.toString()) === cId);
    const firstSub = found?.subjects?.[0];
    setFormData((prev) => ({
      ...prev,
      courseId: cId,
      subjectId: firstSub?.id || firstSub?._id?.toString() || '',
    }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a PDF or document file to upload into GridFS.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const data = new FormData();
    data.append('file', file);
    data.append('courseId', formData.courseId);
    data.append('subjectId', formData.subjectId);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);

    const res = await api.post('/materials/upload', data);
    setUploading(false);

    if (res.success) {
      setSuccessMsg('Material successfully chunked and stored in MongoDB GridFS!');
      setFormData((prev) => ({ ...prev, title: '', description: '' }));
      setFile(null);
      loadData();
    } else {
      setErrorMsg(res.message || 'Upload failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study material and remove its GridFS chunks?')) return;
    const res = await api.delete(`/materials/${id}`);
    if (res.success) {
      loadData();
    }
  };

  const selectedCourse = courses.find((c) => c.id === formData.courseId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          MongoDB GridFS Document Manager
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Upload HE Study Material</h1>
      </div>

      {/* UPLOAD FORM CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-navy-950 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-amber-500" />
          <span>Upload New File to MongoDB GridFS</span>
        </h3>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="NOTES">Handwritten Notes</option>
                <option value="PREVIOUS_YEAR">Previous Year Paper (PYQ)</option>
                <option value="ASSIGNMENT">Weekly Assignment</option>
                <option value="SYLLABUS">Syllabus & Blueprint</option>
                <option value="IMPORTANT_QUESTION">Important Questions</option>
                <option value="STUDY_MATERIAL">Study Handbook</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Chapter 01: Kinematics Comprehensive Derivation Notes"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brief Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key concepts, formula highlights, problem set details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select PDF / Document</label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-950 file:text-white hover:file:bg-navy-900"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Streaming to GridFS...' : 'Upload & Save to GridFS'}</span>
          </button>
        </form>
      </div>

      {/* UPLOADED MATERIALS TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-base mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Uploaded Repository Items ({materials.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Course & Subject</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">GridFS File</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-navy-950 max-w-xs truncate">{m.title}</td>
                  <td className="py-3 text-slate-600">
                    <span className="font-semibold block">{m.course?.title}</span>
                    <span className="text-[11px] text-slate-400">{m.subject?.name}</span>
                  </td>
                  <td className="py-3">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {m.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{m.fileName}</td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() =>
                          setActivePdf({
                            isOpen: true,
                            title: m.title,
                            fileId: m.fileId,
                          })
                        }
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={api.getFileDownloadUrl(m.fileId)}
                        download
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MediaModal
        isOpen={activePdf.isOpen}
        onClose={() => setActivePdf({ isOpen: false, title: '', fileId: '' })}
        title={activePdf.title}
        type="pdf"
        fileId={activePdf.fileId}
      />
    </div>
  );
}
