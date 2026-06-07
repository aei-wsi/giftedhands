import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Gifted Hands Experience System',
  description: 'Internal operational dashboard for sensory-supportive grooming experiences',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <footer className="bg-white border-t border-slate-200 px-8 py-3">
              <p className="text-xs text-slate-400 text-center">
                Gifted Hands Experience System is an experience-supportive workflow tool. It is not a clinical diagnostic, therapy, or treatment platform.
              </p>
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
