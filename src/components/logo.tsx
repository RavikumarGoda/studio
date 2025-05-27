// src/components/logo.tsx
import { Zap } from 'lucide-react'; // Changed from Leaf to Zap
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 text-primary ${className}`}>
      <Zap className="h-8 w-8" /> {/* Changed from Leaf to Zap */}
      <span className="text-2xl font-bold">TOD</span>
    </Link>
  );
}
