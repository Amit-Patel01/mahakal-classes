'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  Home,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Info,
  Phone,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If inside any authenticated dashboard, the dashboard layout handles the top header & sidebar
  const isDashboard =
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/admin');

  if (isDashboard) {
    return null;
  }

  const materialHref = user
    ? user.role === 'ADMIN'
      ? '/admin/materials'
      : user.role === 'TEACHER'
      ? '/teacher/materials'
      : '/student/material'
    : '/material';

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'HE Material', href: materialHref, icon: FileText },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { name: 'About Us', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Mahakal Classes"
              width={42}
              height={42}
              className="rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
                MAHAKAL
              </span>
            </div>
            <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase block mt-0.5">
              Classes
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={
                  user.role === 'ADMIN'
                    ? '/admin/dashboard'
                    : user.role === 'TEACHER'
                    ? '/teacher/dashboard'
                    : '/student/dashboard'
                }
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-95"
              >
                <UserIcon className="w-4 h-4" />
                <span>Dashboard ({user.role})</span>
              </Link>
              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-slate-700 hover:text-blue-600 text-sm font-semibold px-4 py-2 rounded-full hover:bg-slate-100 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-1 shadow-xl animate-fadeInUp">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={
                    user.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : user.role === 'TEACHER'
                      ? '/teacher/dashboard'
                      : '/student/dashboard'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Go to Dashboard ({user.role})</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-center py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition"
                >
                  Enroll Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
