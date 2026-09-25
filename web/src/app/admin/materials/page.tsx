'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import MediaModal from '@/components/MediaModal';
import { FileText, Plus, Search, Download, Eye, Trash2, BookOpen, User, X } from 'lucide-react';

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Handwritten Notes', value: 'NOTES' },
  { label: 'Previous Year Papers', value: 'PREVIOUS_YEAR' },
  { label: 'Assignments', value: 'ASSIGNMENT' },
  { label: 'Syllabus & Blueprint', value: 'SYLLABUS' },
  { label: 'High-Yield Questions', value: 'IMPORTANT_QUESTION' },
  { label: 'Formula Handbooks', value: 'STUDY_MATERIAL' },
];

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Media Modal state for previewing PDFs
  const [activePdf, setActivePdf] = useState<{ isOpen: boolean; title: string; fileId: string }>({
    isOpen: false,
    title: '',
    fileId: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'NOTES',
    courseId: '',
    subjectId: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    Promise.all([
      api.get(`/materials?${params.toString()}`).then((res) => {
        if (res.success && res.data) setMaterials(res.data);
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
  }, [category, search]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF document to upload.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('courseId', formData.courseId);
      if (formData.subjectId) data.append('subjectId', formData.subjectId);

      const res = await api.post('/materials/upload', data);
      setSubmitting(false);

      if (res.success) {
        setModalOpen(false);
        setFile(null);
        setFormData({
          title: '',
          description: '',
          category: 'NOTES',
          courseId: courses[0]?.id || courses[0]?._id || '',
          subjectId: courses[0]?.subjects?.[0]?.id || '',
        });
        loadData();
      } else {
        setError(res.message || 'Failed to upload material');
      }
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || 'Upload error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study material from MongoDB GridFS?')) return;
    const res = await api.delete(`/materials/${id}`);
    if (res.success) {
      loadData();
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Repository Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">HE Study Material & Notes</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, chapters..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              category === cat.value
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading materials from MongoDB GridFS...</div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-600 text-sm">No study materials found</p>
            <p className="text-xs text-slate-400 mt-1">Upload PDF notes or test papers for students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category?.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {formatBytes(item.fileSize)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                  )}

                  <div className="space-y-1 py-2.5 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.course?.title || 'General Batch'}</span>
                    </div>
                    {item.uploadedBy && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Uploaded By: {item.uploadedBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setActivePdf({
                          isOpen: true,
                          title: item.title,
                          fileId: item.fileId,
                        })
                      }
                      className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <a
                      href={api.getFileDownloadUrl(item.fileId)}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload HE Study Material</h3>
                <p className="text-xs text-slate-500">Store directly in MongoDB GridFS with instant streaming</p>
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

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Organic Chemistry Reaction Mechanism Handbook"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="NOTES">Handwritten Notes</option>
                    <option value="PREVIOUS_YEAR">Previous Year Papers</option>
                    <option value="ASSIGNMENT">Graded Assignment</option>
                    <option value="SYLLABUS">Syllabus & Blueprint</option>
                    <option value="IMPORTANT_QUESTION">High-Yield Questions</option>
                    <option value="STUDY_MATERIAL">Formula Handbook</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Batch *</label>
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
                        {c.title || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select PDF File *</label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of chapters and topic highlights..."
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-xs"
                >
                  {submitting ? 'Uploading to GridFS...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
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
