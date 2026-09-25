'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Phone, Clock, Send, Check, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white py-12 sm:py-16 border-b border-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200/80 px-4 py-1.5 rounded-full mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Student Help Desk & Admissions
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Get in Touch with Us
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mt-3 leading-relaxed">
            Have questions regarding admissions, batch schedules, or scholarship examinations? We are
            here to guide your path.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Campus Information</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Visit our center or speak directly with our counseling team.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Main Coaching Campus
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Samrat Nagar, Bhuravav, Godhra, Gujarat
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Helpline & Admissions
                  </h4>
                  <a
                    href="tel:+918511896896"
                    className="text-sm sm:text-base font-bold text-blue-600 hover:text-blue-700 block mt-1 transition"
                  >
                    +91 8511896896
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Request a Call Back</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Our academic counselors will guide you through batch admissions.
            </p>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center">
                <Check className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-emerald-950">Thank You!</h4>
                <p className="text-xs sm:text-sm text-emerald-700 mt-1">
                  Your inquiry has been received. Our counselor will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Goal
                    </label>
                    <select className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition">
                      <option>IIT-JEE Target 2026</option>
                      <option>NEET UG 2026</option>
                      <option>Class 12th Board Target</option>
                      <option>Class 11th Foundation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Query / Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your preparation goals or any queries..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-3.5 rounded-full transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
