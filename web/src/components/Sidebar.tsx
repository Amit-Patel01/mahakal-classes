'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Radio,
  FileText,
  CheckSquare,
  BarChart3,
  User,
  Users,
  Award,
  Image as ImageIcon,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const role = user.role;

  const studentLinks: NavLink[] = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/student/courses', icon: BookOpen },
    { name: 'Live Classes', href: '/student/live', icon: Radio, highlight: true },
    { name: 'Recorded Lectures', href: '/student/lectures', icon: Video },
    { name: 'HE Material', href: '/student/material', icon: FileText },
    { name: 'Online Tests', href: '/student/tests', icon: CheckSquare },
    { name: 'Performance & Results', href: '/student/analytics', icon: BarChart3 },
    { name: 'My Profile', href: '/student/profile', icon: User },
  ];

  const teacherLinks: NavLink[] = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Courses & Chapters', href: '/teacher/courses', icon: BookOpen },
    { name: 'Live Sessions', href: '/teacher/live', icon: Radio, highlight: true },
    { name: 'Recorded Lectures', href: '/teacher/lectures', icon: Video },
    { name: 'Upload HE Material', href: '/teacher/materials', icon: FileText },
    { name: 'Create Tests', href: '/teacher/tests', icon: CheckSquare },
    { name: 'Student Results', href: '/teacher/results', icon: BarChart3 },
  ];

  const adminLinks: NavLink[] = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Teachers', href: '/admin/teachers', icon: Award },
    { name: 'Courses & Subjects', href: '/admin/courses', icon: BookOpen },
    { name: 'Video Lectures', href: '/teacher/lectures', icon: Video },
    { name: 'Live Classes', href: '/admin/live-classes', icon: Radio },
    { name: 'HE Material', href: '/admin/materials', icon: FileText },
    { name: 'Online Tests', href: '/admin/tests', icon: CheckSquare },
    { name: 'Photo Gallery', href: '/admin/gallery', icon: ImageIcon },
    { name: 'Announcements', href: '/admin/announcements', icon: Bell },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const links =
    role === 'ADMIN' ? adminLinks : role === 'TEACHER' ? teacherLinks : studentLinks;

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col border-r border-navy-800 shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-navy-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Mahakal Classes"
            width={36}
            height={36}
            className="rounded-xl object-cover"
          />
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block leading-tight">
              MAHAKAL
            </span>
            <span className="text-[10px] font-semibold text-amber-400 tracking-wider uppercase block">
              Classes LMS
            </span>
          </div>
        </Link>
      </div>

      {/* User Quick Info */}
      <div className="px-4 py-3.5 bg-navy-900/60 border-b border-navy-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-600/30 border border-brand-500/50 flex items-center justify-center text-amber-400 font-bold text-sm">
          {user.name.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-white truncate">{user.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-amber-500 text-navy-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-navy-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? 'text-navy-950'
                    : link.highlight
                    ? 'text-red-400 animate-pulse'
                    : 'text-slate-400 group-hover:text-amber-400'
                }`}
              />
              <span className="flex-1 truncate">{link.name}</span>
              {link.highlight && !isActive && (
                <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/40">
                  LIVE
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-3 border-t border-navy-800 bg-navy-950">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-navy-800 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
