'use client';

import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import {
  Video,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { formatVideoEmbedUrl } from '@/lib/videoUtils';

export default function StudentLecturesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [lectures, setLectures] = useState<any[]>([]);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    api.get('/courses').then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setCourses(res.data);
        const firstCourse = res.data[0];
        setSelectedCourseId(firstCourse?.id || firstCourse?._id?.toString() || '');
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    setLoading(true);

    api.get(`/lectures/course/${selectedCourseId}`).then((res) => {
      if (res.success && res.data) {
        setLectures(res.data);
        if (res.data.length > 0) {
          setActiveLecture(res.data[0]);
        }
      }
      setLoading(false);
    });
  }, [selectedCourseId]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeLecture) return;
    const currentTime = Math.floor(videoRef.current.currentTime);

    // Auto-save progress every 15 seconds
    if (currentTime % 15 === 0 && currentTime > 0) {
      api.post(`/lectures/${activeLecture.id}/progress`, {
        watchedSeconds: currentTime,
        isCompleted: videoRef.current.ended || currentTime > 0.9 * videoRef.current.duration,
      });
    }
  };

  const handleEnded = () => {
    if (!activeLecture) return;
    api.post(`/lectures/${activeLecture.id}/progress`, {
      watchedSeconds: Math.floor(videoRef.current?.duration || 0),
      isCompleted: true,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Video Archive
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950">Recorded Masterclasses</h1>
        </div>

        {/* Course Batch Selector */}
        {courses.length > 0 && (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-navy-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading video archives from MongoDB GridFS...
        </div>
      ) : !activeLecture ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No recorded lectures uploaded for this course yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative flex items-center justify-center border border-slate-800">
              {activeLecture.videoFileId ? (
                <video
                  ref={videoRef}
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  className="w-full h-full"
                >
                  <source
                    src={api.getFileStreamUrl(activeLecture.videoFileId)}
                    type="video/mp4"
                  />
                  Your browser does not support HTML5 video streaming.
                </video>
              ) : activeLecture.videoUrl ? (
                (() => {
                  const { embedUrl, detectedName } = formatVideoEmbedUrl(activeLecture.videoUrl);
                  return (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={activeLecture.title || detectedName}
                    />
                  );
                })()
              ) : (
                <div className="text-white text-center p-6">
                  <Video className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Video currently being processed by GridFS</p>
                </div>
              )}
            </div>

            {/* Title & Chapter Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">
                {activeLecture.subject?.name}
              </span>
              <h2 className="text-xl font-extrabold text-navy-950 mt-2">{activeLecture.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {activeLecture.description || 'Comprehensive conceptual derivation and practice problems.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                <span>Faculty: <b>{activeLecture.teacher?.name}</b></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeLecture.durationMinutes} Minutes</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Chapter Lecture Playlist */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col h-[550px] overflow-hidden">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 font-extrabold text-sm text-navy-950">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Chapter Masterclasses ({lectures.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {lectures.map((lec, idx) => {
                const isSelected = activeLecture.id === lec.id;
                const isCompleted = lec.progress?.isCompleted;

                return (
                  <div
                    key={lec.id}
                    onClick={() => setActiveLecture(lec)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-amber-500 text-navy-950'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-navy-950 truncate">{lec.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                        <span>{lec.durationMinutes}m duration</span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
