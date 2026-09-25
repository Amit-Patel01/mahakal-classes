'use client';

import React, { useEffect, useState } from 'react';
import MediaModal from '@/components/MediaModal';
import { api } from '@/lib/api';
import { FileText, Search, Download, Eye, BookOpen, Clock } from 'lucide-react';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Notes', value: 'NOTES' },
  { label: 'PYQ Papers', value: 'PREVIOUS_YEAR' },
  { label: 'Assignments', value: 'ASSIGNMENT' },
  { label: 'Syllabus', value: 'SYLLABUS' },
  { label: 'Important Qs', value: 'IMPORTANT_QUESTION' },
  { label: 'Handbooks', value: 'STUDY_MATERIAL' },
];

export default function StudentMaterialPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [activePdf, setActivePdf] = useState<{ isOpen: boolean; title: string; fileId: string }>({
    isOpen: false,
    title: '',
    fileId: '',
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    api.get(`/materials?${params.toString()}`).then((res) => {
      if (res.success && res.data) {
        setMaterials(res.data);
      }
      setLoading(false);
    });
  }, [category, search]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Study Repository
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950">HE Study Material & Notes</h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              category === cat.value
                ? 'bg-amber-400 text-navy-950 shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading HE Material from MongoDB GridFS...
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                  {item.category.replace('_', ' ')}
                </span>
                <h3 className="text-sm font-extrabold text-navy-950 mt-2 mb-1.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description || 'Verified study material.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span className="truncate">{item.course?.title}</span>
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() =>
                    setActivePdf({
                      isOpen: true,
                      title: item.title,
                      fileId: item.fileId,
                    })
                  }
                  className="flex-1 bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>View PDF</span>
                </button>
                <a
                  href={api.getFileDownloadUrl(item.fileId)}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
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
