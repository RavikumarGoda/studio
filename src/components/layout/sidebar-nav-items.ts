// src/components/layout/sidebar-nav-items.ts
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Search, ListChecks, ShieldCheck, Settings, BarChart3, CalendarDays, PlusCircle } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  roles: Array<'player' | 'owner' | 'all'>; // 'all' for items visible to everyone
}

export const navItems: NavItem[] = [
  // Player Specific
  // {
  //   title: 'Dashboard',
  //   href: '/player/dashboard',
  //   icon: LayoutDashboard,
  //   roles: ['player'],
  // },
  {
    title: 'Find Turfs',
    href: '/player/turfs',
    icon: Search,
    roles: ['player'],
  },
  {
    title: 'My Bookings',
    href: '/player/bookings',
    icon: ListChecks,
    roles: ['player'],
  },

  // Owner Specific
  {
    title: 'Dashboard',
    href: '/owner/dashboard',
    icon: LayoutDashboard,
    roles: ['owner'],
  },
  {
    title: 'My Turfs',
    href: '/owner/turfs',
    icon: ShieldCheck, // Or a turf icon
    roles: ['owner'],
  },
  // {
  //   title: 'Add New Turf',
  //   href: '/owner/turfs/new',
  //   icon: PlusCircle,
  //   roles: ['owner'],
  // },
  {
    title: 'Bookings',
    href: '/owner/bookings',
    icon: CalendarDays,
    roles: ['owner'],
  },
  {
    title: 'Analytics',
    href: '/owner/analytics',
    icon: BarChart3,
    roles: ['owner'],
  },
  
  // Example of a common item
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  //   roles: ['all'],
  // },
];
