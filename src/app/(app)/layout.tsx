"use client";

import { Header } from "@/components/layout/header";
import { navItems } from "@/components/layout/sidebar-nav-items";
import { Logo } from "@/components/logo";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  // Redirect if not authenticated or wrong role for path
  useEffect(() => {
    if (!loading && !user) {
      // Temporary disable redirect for development if needed.
      // router.push('/login'); 
    } else if (user) {
      if (pathname.startsWith('/owner') && user.role !== 'owner') {
        // router.push('/player/dashboard');
      } else if (pathname.startsWith('/player') && user.role !== 'player') {
        // router.push('/owner/dashboard');
      }
    }
  }, [user, loading, pathname]);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Logo /> <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  // This is a fallback for development when auth is not fully set up.
  // In a production app, you'd likely redirect to /login if no user.
  const currentRole = user?.role || 'player'; // Default to player if no user for nav item filtering

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentRole) || item.roles.includes('all')
  );

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r" collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <Logo className="text-lg" />
            <SidebarTrigger className="hidden group-data-[collapsible=icon]:block" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/' && item.href.split('/').length > 2)}
                    className={cn(
                      "w-full justify-start",
                      (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/' && item.href.split('/').length > 2)) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    tooltip={item.title}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        {user && (
          <SidebarFooter className="p-4">
            <Button variant="ghost" onClick={logout} className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
              <LogOut className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
