'use client';

import { Building2, LayoutDashboard, Home, Users, Settings, FileText, BarChart3, Briefcase, AlertTriangle, Activity, X, FolderOpen, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Briefcase, label: 'Projects', href: '/projects' },
    { icon: Home, label: 'Units', href: '/units' },
    { icon: FileText, label: 'Handovers', href: '/handovers' },
    // Admin-only: Snagging inspection reports
    // Owners access snaggings via Unit Profile widget instead
    { icon: AlertTriangle, label: 'Snaggings', href: '/admin/snaggings' },
    // Admin-only: Visitor request management
    { icon: Mail, label: 'Requests', href: '/admin/requests' },
    { icon: FolderOpen, label: 'Documents', href: '/documents' },
    // Admin-only: User management
    { icon: Users, label: 'Users', href: '/users' },
    // Admin-only: Audit trail
    { icon: Activity, label: 'Audit Logs', href: '/audit-logs' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 md:w-72 lg:w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Logo - Responsive padding */}
      <div className="p-4 md:p-5 lg:p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-7 w-7 md:h-8 md:w-8" />
          <span className="font-semibold text-base md:text-lg">Esnaad</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate">John Doe</p>
            <p className="text-muted-foreground text-sm truncate">john@propertyos.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
