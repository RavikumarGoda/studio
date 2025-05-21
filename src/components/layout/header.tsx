// src/components/layout/header.tsx
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-4">
           <SidebarTrigger className="md:hidden" /> {/* Visible on mobile to toggle sidebar */}
           <Logo />
        </div>
       
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
