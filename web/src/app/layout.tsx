import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';

export const metadata: Metadata = {
  title: 'Mahakal Classes | Leading IIT-JEE, NEET & Board Coaching Institute',
  description:
    'Integrated Learning Management System with Live Classes, Recorded Video Lectures, HE Study Material, and National Online Test Series.',
  keywords: 'Mahakal Classes, IIT-JEE, NEET, Board Exam, Online Test, Study Material, Live Classes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-slate-50/50 text-slate-900 min-h-screen flex flex-col relative selection:bg-blue-100 selection:text-blue-900">
        {/* COLORFUL AMBIENT GLOW SYSTEM */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Top Left: Cyan / Sky Blue Glow Orb */}
          <div className="absolute -top-32 -left-32 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] bg-gradient-to-br from-cyan-400/30 via-sky-400/25 to-blue-500/15 rounded-full blur-[130px] animate-glow-1" />

          {/* Top Right: Purple / Indigo Glow Orb */}
          <div className="absolute -top-20 -right-20 w-[550px] sm:w-[650px] h-[550px] sm:h-[650px] bg-gradient-to-bl from-purple-500/25 via-indigo-500/20 to-pink-500/15 rounded-full blur-[140px] animate-glow-2" />

          {/* Center Left: Warm Rose / Amber Glow Orb */}
          <div className="absolute top-1/3 -left-40 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-gradient-to-r from-amber-400/20 via-rose-400/20 to-transparent rounded-full blur-[140px] animate-glow-3" />

          {/* Center Right: Violet / Fuchsia Glow Orb */}
          <div className="absolute top-1/2 -right-40 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-gradient-to-l from-fuchsia-500/20 via-violet-500/20 to-blue-500/15 rounded-full blur-[145px] animate-glow-1" />

          {/* Bottom Center: Teal / Emerald / Blue Glow Orb */}
          <div className="absolute -bottom-40 left-1/4 w-[600px] sm:w-[750px] h-[600px] sm:h-[750px] bg-gradient-to-tr from-teal-400/20 via-emerald-400/15 to-blue-500/15 rounded-full blur-[150px] animate-glow-2" />
        </div>

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
