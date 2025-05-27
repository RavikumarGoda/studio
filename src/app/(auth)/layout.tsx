
// src/app/(auth)/layout.tsx
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4",
      "bg-gradient-to-br from-background via-slate-900 to-purple-950", // Stormy gradient for .dark
      "dark:bg-gradient-to-br dark:from-background dark:via-blue-950 dark:to-purple-950" // Specific for .dark
      // If you have a .thunder-mode, you can add specific styles for it too:
      // "thunder-mode:bg-gradient-to-br thunder-mode:from-black thunder-mode:via-indigo-950 thunder-mode:to-violet-950"
      // This requires html tag to have .dark.thunder-mode or just .thunder-mode if it overrides .dark
    )}>
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

    