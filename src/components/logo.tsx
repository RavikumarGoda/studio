// src/components/logo.tsx
import { Leaf } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 text-primary ${className}`}>
      <Leaf className="h-8 w-8" />
      <span className="text-2xl font-bold">TurfLink</span>
    </Link>
  );
}
