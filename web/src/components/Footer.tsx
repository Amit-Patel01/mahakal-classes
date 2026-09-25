import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Award, CheckCircle2, ArrowUpRight, Clock, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/70 backdrop-blur-xl border-t border-slate-200/80 text-slate-600 text-xs mt-auto relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <Image
                src="/logo.png"
                alt="Mahakal Classes"
                width={46}
                height={46}
                className="rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-black text-slate-900 text-xl tracking-tight block leading-none">
                  MAHAKAL
                </span>
                <span className="text-[11px] font-bold text-blue-600 tracking-widest uppercase block mt-0.5">
                  Classes
                </span>
              </div>
            </Link>

            <p className="leading-relaxed text-slate-500 text-xs sm:text-sm">
              Premier coaching institute providing top-tier classroom and digital learning for
              IIT-JEE (Main & Advanced), NEET-UG, and Board Foundations.
            </p>

            <div className="inline-flex items-center gap-2 text-blue-700 font-semibold bg-blue-50 border border-blue-200/70 px-3.5 py-1.5 rounded-full text-xs">
              <Award className="w-4 h-4 text-blue-600" />
              <span>500+ Selections in IITs & AIIMS</span>
            </div>
          </div>

          {/* Academic Batches */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">
              Academic Programs
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: 'IIT-JEE Target Batch', href: '/courses' },
                { name: 'NEET-UG Medical Target', href: '/courses' },
                { name: 'Class 12th Board Target', href: '/courses' },
                { name: 'Class 11th Foundation', href: '/courses' },
                { name: 'HE Study Material & Notes', href: '/student/material' },
                { name: 'Campus & Toppers Gallery', href: '/gallery' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-600 transition flex items-center gap-1 group font-medium"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Educational Modules */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">
              Learning Ecosystem
            </h4>
            <ul className="space-y-2.5">
              {[
                'Live Interactive Classrooms',
                'Recorded Video Lecture Library',
                'National Online CBT Mock Tests',
                'Instant Auto-Evaluation & Rank',
                'Handwritten Chapter Notes & DPPs',
                'Personal Academic Mentorship',
              ].map((module) => (
                <li key={module} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-600">{module}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus Location & Contact */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">
              Campus Location
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Main Campus</span>
                  <span className="text-slate-500 leading-relaxed block mt-0.5">
                    Samrat Nagar, Bhuravav, Godhra, Gujarat
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Helpline / Admissions</span>
                  <a
                    href="tel:+918511896896"
                    className="text-blue-600 hover:text-blue-700 transition font-bold text-sm block mt-0.5"
                  >
                    +91 8511896896
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-2 text-slate-400 pl-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Links & Copyright Bar */}
        <div className="pt-6 pb-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4 text-xs">
          <p>© {new Date().getFullYear()} Mahakal Classes Education Platform. All rights reserved.</p>
          <div className="flex flex-wrap gap-5 font-medium">
            <Link href="/privacy" className="hover:text-slate-800 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-800 transition">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-slate-800 transition">
              Help Desk
            </Link>
          </div>
        </div>

        {/* BIG COLORFUL BRANDING */}
        <div className="relative pt-8 sm:pt-12 pb-4 border-t border-slate-200/80 overflow-hidden select-none">
          {/* Subtle Ambient Colorful Glow Reflection */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40 blur-3xl pointer-events-none">
            <div className="w-4/5 h-20 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-amber-400 rounded-full" />
          </div>

          <h2 className="relative text-4xl sm:text-6xl md:text-8xl lg:text-[115px] xl:text-[145px] font-black tracking-tighter text-center uppercase leading-none bg-gradient-to-r from-blue-600 via-indigo-500 via-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent animate-gradient-x transition-all">
            MAHAKAL CLASSES
          </h2>
        </div>
      </div>
    </footer>
  );
}
