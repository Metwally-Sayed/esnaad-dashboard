'use client';

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { OwnerDashboardSidebar } from "@/components/OwnerDashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SWRProvider } from "@/components/providers/swr-provider";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
  const { user, isAdmin, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes on mobile/tablet
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Check if we're on an auth page (login/register/forgot-password)
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/forgot-password') ||
                     pathname.startsWith('/reset-password');

  // During SSR or initial mount, show minimal layout to avoid hydration mismatch
  if (!mounted) {
    if (isAuthPage) {
      return children;
    }
    // Return a minimal structure that matches what will be rendered
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication (only on client after mount)
  if (!isAuthPage && loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        {isAuthPage ? (
          // Auth pages: no sidebar/header
          children
        ) : (
          // Dashboard pages: show sidebar and header based on role
          <div className="flex h-screen bg-background">
            {/* Mobile/Tablet Menu Button */}
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-4 left-4 z-50 lg:hidden"
              size="icon"
              variant="outline"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile/Tablet Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar - Responsive: hidden on mobile, overlay on tablet, static on desktop */}
            <div className={`
              fixed lg:static
              top-0 left-0 h-full z-40
              transform transition-transform duration-200 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              {isAdmin ? <DashboardSidebar /> : <OwnerDashboardSidebar />}
            </div>

            {/* Main Content - Adjust padding for mobile menu button */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header - Add padding on mobile for menu button */}
              <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
              <DashboardHeader />

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
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
        <ErrorBoundary>
          <SWRProvider>
            <AuthProvider>
              <LayoutContent>{children}</LayoutContent>
            </AuthProvider>
          </SWRProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
