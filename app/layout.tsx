'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { OwnerDashboardSidebar } from "@/components/OwnerDashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userRole, setUserRole } = useAuth();

  // Check if we're on an auth page (login/register)
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  return (
    <div>
        {isAuthPage ? (
          // Auth pages: no sidebar/header
          children
        ) : (
          // Dashboard pages: show sidebar and header based on role
          <div className="flex h-screen bg-background">
            {/* Sidebar - changes based on user role */}
            {userRole === 'admin' ? <DashboardSidebar /> : <OwnerDashboardSidebar />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <DashboardHeader />

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>

              {/* Role Switcher (Demo Only) */}
              <div className="fixed bottom-4 right-4 z-50">
                <button
                  onClick={() => setUserRole(userRole === 'admin' ? 'owner' : 'admin')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-lg hover:bg-primary/90 transition-colors"
                >
                  Switch to {userRole === 'admin' ? 'Owner' : 'Admin'} View
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
