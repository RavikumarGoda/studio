// src/app/(app)/owner/turfs/new/page.tsx
"use client";

import { TurfForm } from '@/components/turf/turf-form';
import { useAuth } from '@/hooks/use-auth'; // Mock auth
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewTurfPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    if (!user || user.role !== 'owner') {
      toast({ title: "Error", description: "You are not authorized to add turfs.", variant: "destructive" });
      return;
    }
    
    // Mock API call
    console.log("Adding new turf:", { ...data, ownerId: user.uid });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    toast({
      title: "Turf Added Successfully!",
      description: `${data.name} has been listed on TurfLink.`,
    });
    router.push('/owner/turfs');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <TurfForm onSubmitForm={handleSubmit} />
    </div>
  );
}
