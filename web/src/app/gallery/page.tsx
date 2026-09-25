'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaModal from '@/components/MediaModal';
import { api } from '@/lib/api';
import { Image as ImageIcon, Calendar, ZoomIn, Sparkles } from 'lucide-react';

const GALLERY_CATEGORIES = [
  { label: 'All Photos', value: '' },
  { label: 'Achievers & Toppers', value: 'ACHIEVEMENTS' },
  { label: 'Smart Classrooms', value: 'CLASSROOM' },
  { label: 'Seminars & Workshops', value: 'SEMINARS' },
  { label: 'Campus Events', value: 'EVENTS' },
  { label: 'Faculty Members', value: 'FACULTY' },
];

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState<{
    isOpen: boolean;
    title: string;
    fileId: string;
  }>({
    isOpen: false,
    title: '',
    fileId: '',
  });

  useEffect(() => {
    setLoading(true);
    const params = category ? `?category=${category}` : '';
    api.get(`/gallery${params}`).then((res) => {
      if (res.success && res.data) {
        setItems(res.data);
      }
      setLoading(false);
    });
  }, [category]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white py-12 sm:py-16 border-b border-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200/80 px-4 py-1.5 rounded-full mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Life at Mahakal Classes
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Campus & Achievers Gallery
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mt-3 leading-relaxed">
            Moments of academic triumph, active classroom interactions, student awards, and inspiring
            workshops.
          </p>
        </div>
      </section>

      {/* Category Pills */}
      <section className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-[61px] z-20 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none flex items-center gap-2">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <main className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No photos found in this category</p>
            <p className="text-xs text-slate-400 mt-1">Select another filter to view photos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id || item._id}
                onClick={() =>
                  setActiveImage({
                    isOpen: true,
                    title: item.title,
                    fileId: item.imageFileId,
                  })
                }
                className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={api.getFileStreamUrl(item.imageFileId)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {item.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {item.eventDate && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <MediaModal
        isOpen={activeImage.isOpen}
        onClose={() => setActiveImage({ isOpen: false, title: '', fileId: '' })}
        title={activeImage.title}
        type="image"
        fileId={activeImage.fileId}
      />

      <Footer />
    </div>
  );
}
