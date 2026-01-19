"use client";

import {
  Building2,
  DollarSign,
  FolderOpen,
  Home,
  LayoutDashboard,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export function OwnerDashboardSidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Home, label: "My Units", href: "/units" },
    // Snagging reports are accessed via Unit Profile widget
    // Owners view snaggings for each unit on the unit detail page
    // Access: /units/[unitId] → UnitSnaggingWidget
    //
    // Handovers are also accessed via Unit Profile
    // Access: /units/[unitId] → UnitHandoverWidget
    { icon: Mail, label: "My Requests", href: "/requests" },
        { icon: DollarSign, label: "Service Charges", href: "/service-charge" },
    { icon: FolderOpen, label: "Documents", href: "/documents" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          <span className="font-semibold">Esnaad</span>
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
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
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
    </div>
  );
}
