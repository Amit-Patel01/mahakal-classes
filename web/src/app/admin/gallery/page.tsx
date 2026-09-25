'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Image as ImageIcon, Upload, Trash2, Check, AlertCircle } from 'lucide-react';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ACHIEVEMENTS');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadGallery = () => {
    api.get('/gallery').then((res) => {
      if (res.success && res.data) {
        setItems(res.data);
      }
    });
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an image file to upload.');
      return;
    }

    setUploading(true);
    setMsg('');

    const data = new FormData();
    data.append('image', file);
    data.append('title', title);
    data.append('category', category);
    data.append('description', description);

    const res = await api.post('/gallery', data);
    setUploading(false);

    if (res.success) {
      setMsg('Photo uploaded to MongoDB GridFS and added to public gallery!');
      setTitle('');
      setDescription('');
      setFile(null);
      loadGallery();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo from GridFS?')) return;
    const res = await api.delete(`/gallery/${id}`);
    if (res.success) {
      loadGallery();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Media Assets & GridFS
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Photo Gallery Manager</h1>
      </div>

      {/* UPLOAD FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-navy-950 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-amber-500" />
          <span>Upload Image to MongoDB GridFS</span>
        </h3>

        {msg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Photo Caption / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Felicitating 2025 All-India JEE Top 10 Rankers"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="ACHIEVEMENTS">Achievements & Toppers</option>
                <option value="CLASSROOM">Smart Classroom</option>
                <option value="SEMINARS">Seminars & Workshops</option>
                <option value="EVENTS">Campus Events</option>
                <option value="FACULTY">Faculty</option>
                <option value="STUDENTS">Students</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event highlights..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Image File</label>
            <input
              type="file"
              required
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-950 file:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {uploading ? 'Uploading to GridFS...' : 'Upload to Gallery'}
          </button>
        </form>
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="aspect-video bg-navy-900 relative">
              <img
                src={api.getFileStreamUrl(item.imageFileId)}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop';
                }}
              />
              <span className="absolute top-2 left-2 bg-navy-950/80 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded">
                {item.category}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-navy-950">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.description}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
