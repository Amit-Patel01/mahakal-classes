'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Radio, Calendar, Clock, User, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [activeClass, setActiveClass] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'System', text: 'Welcome to the live interactive classroom. Ask your doubts in real-time.', time: '08:00' },
    { sender: 'Prof. Alok Verma', text: 'Good evening students! Today we solve advanced rotational mechanics problems.', time: '08:02' },
  ]);
  const [inputDoubt, setInputDoubt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/live-classes').then((res) => {
      if (res.success && res.data) {
        setLiveClasses(res.data);
        const currentLive = res.data.find((c: any) => c.status === 'LIVE');
        setActiveClass(currentLive || res.data[0] || null);
      }
      setLoading(false);
    });
  }, []);

  const handleSendDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDoubt.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'You',
        text: inputDoubt,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputDoubt('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>Broadcast Center</span>
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Live Interactive Classrooms</h1>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Connecting to live broadcast stream...
        </div>
      ) : !activeClass ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No live lectures currently scheduled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Stream Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative flex items-center justify-center border border-slate-800">
              {activeClass.streamUrl && activeClass.streamUrl.includes('youtube') ? (
                <iframe
                  src={
                    activeClass.streamUrl.includes('embed')
                      ? activeClass.streamUrl
                      : `https://www.youtube.com/embed/${activeClass.streamUrl.split('v=')[1]?.split('&')[0] || ''}?autoplay=1`
                  }
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8 text-white">
                  <Radio className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
                  <h3 className="text-lg font-bold">{activeClass.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 mb-4">
                    Platform: {activeClass.streamPlatform}
                  </p>
                  <a
                    href={activeClass.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition"
                  >
                    Open Stream in New Window
                  </a>
                </div>
              )}
            </div>

            {/* Lecture Meta */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                      activeClass.status === 'LIVE'
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {activeClass.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {activeClass.subject?.name}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">{activeClass.title}</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Faculty: <b>{activeClass.teacher?.name}</b> • {activeClass.startTime} - {activeClass.endTime}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enrolled Student Access</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Doubts Chat Box */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[550px] overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 font-bold text-xs text-navy-950">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Live Doubts & Interactive Chat</span>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-extrabold text-navy-950">{msg.sender}</span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="p-2.5 rounded-xl bg-slate-50 text-slate-700 leading-relaxed border border-slate-100">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendDoubt} className="p-3 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={inputDoubt}
                onChange={(e) => setInputDoubt(e.target.value)}
                placeholder="Ask faculty a live doubt..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="bg-navy-950 hover:bg-navy-900 text-white p-2.5 rounded-xl transition"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Schedule Calendar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-navy-950 text-base mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Upcoming Live Masterclasses Schedule</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveClasses.map((lc) => (
            <div
              key={lc.id}
              onClick={() => setActiveClass(lc)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                activeClass?.id === lc.id
                  ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {new Date(lc.scheduledDate).toLocaleDateString()}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    lc.status === 'LIVE' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {lc.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-navy-950 line-clamp-2">{lc.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{lc.startTime} - {lc.endTime}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
