
// src/components/turf/turf-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Turf } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, XCircle, Loader2, Phone } from "lucide-react";
import NextImage from "next/image"; // Renamed to avoid conflict if any
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const turfFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  location: z.string().min(5, "Location is required."),
  ownerPhoneNumber: z.string()
    .optional()
    .refine(val => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
        message: "Invalid phone number format.",
    })
    .or(z.literal('')), 
  pricePerHour: z.coerce.number().min(0, "Price must be a positive number."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000, "Description too long."),
  amenities: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one amenity.",
  }),
  images: z.array(z.string().url("Invalid URL format or mock URL expected.")).min(1, "At least one image is required.").max(5, "Maximum of 5 images allowed."),
  isVisible: z.boolean().default(true),
});

export type TurfFormValues = z.infer<typeof turfFormSchema>;

const allAmenitiesList = [
  { id: "parking", label: "Parking" },
  { id: "restroom", label: "Restroom" },
  { id: "floodlights", label: "Floodlights" },
  { id: "wifi", label: "WiFi" },
  { id: "cafe", label: "Cafe" },
  { id: "showers", label: "Showers" },
  { id: "firstaid", label: "First Aid" },
  { id: "water", label: "Drinking Water" },
];


interface TurfFormProps {
  initialData?: Partial<Turf>; 
  onSubmitForm: (data: TurfFormValues) => Promise<void>;
}

function TurfFormComponent({ initialData, onSubmitForm }: TurfFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [imageFilesToUpload, setImageFilesToUpload] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Holds blob: URLs for new, http(s) for existing
  
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false); // For visual feedback during mock "upload"

  const form = useForm<TurfFormValues>({
    resolver: zodResolver(turfFormSchema),
    // Default values are set in useEffect based on initialData
  });
  
  const blobUrlManager = useRef({
    urls: new Set<string>(),
    add: (url: string) => {
      if (url.startsWith('blob:')) blobUrlManager.current.urls.add(url);
    },
    remove: (url: string) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        blobUrlManager.current.urls.delete(url);
      }
    },
    revokeAll: () => {
      blobUrlManager.current.urls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      blobUrlManager.current.urls.clear();
    }
  });

  useEffect(() => {
    blobUrlManager.current.revokeAll(); // Clean up any blobs from previous state/renders

    const defaultFormValues = {
      name: initialData?.name || "",
      location: initialData?.location || "",
      ownerPhoneNumber: initialData?.ownerPhoneNumber || "",
      pricePerHour: initialData?.pricePerHour || 0,
      description: initialData?.description || "",
      amenities: initialData?.amenities || [],
      images: initialData?.images || [], // These are existing HTTP or placeholder URLs for form data
      isVisible: initialData?.isVisible === undefined ? true : initialData.isVisible,
    };
    
    form.reset(defaultFormValues); 
    
    setImagePreviews(initialData?.images || []); // Initialize visual previews with existing http(s) URLs
    setImageFilesToUpload([]); // Clear any file objects from previous state

    return () => {
      blobUrlManager.current.revokeAll(); // Cleanup on unmount
    };
  }, [initialData]); // Rerun only when initialData prop reference changes


  const handleImageFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const currentTotalImages = imagePreviews.length + filesArray.length;

      if (currentTotalImages > 5) {
        toast({ title: "Image Limit", description: "You can upload a maximum of 5 images.", variant: "destructive" });
        event.target.value = ""; 
        return;
      }

      setIsUploadingImages(true);
      
      const newLocalBlobPreviews: string[] = [];
      const newFilesToUploadAddition: File[] = [];

      for (const file of filesArray) {
        const blobUrl = URL.createObjectURL(file);
        blobUrlManager.current.add(blobUrl);
        newLocalBlobPreviews.push(blobUrl);
        newFilesToUploadAddition.push(file);
      }
      
      // Update visual previews with new blob URLs
      setImagePreviews(prev => [...prev, ...newLocalBlobPreviews]);
      // Store the actual File objects
      setImageFilesToUpload(prev => [...prev, ...newFilesToUploadAddition]);

      // Simulate upload and get placeholder URLs for form data
      const uploadedPlaceholderUrlsPromises = filesArray.map(async () => {
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100)); // Shorter delay
        return `https://placehold.co/600x400.png`; 
      });
      
      const newPlaceholderUrls = await Promise.all(uploadedPlaceholderUrlsPromises);
      
      // Update react-hook-form's "images" field with placeholder URLs for newly added images
      const currentFormImageUrls = form.getValues("images") || [];
      form.setValue("images", [...currentFormImageUrls, ...newPlaceholderUrls], { shouldValidate: true, shouldDirty: true });
      
      event.target.value = ""; 
      setIsUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const removedPreviewUrl = imagePreviews[indexToRemove];
  
    // Create new arrays by filtering
    const newImagePreviews = imagePreviews.filter((_, i) => i !== indexToRemove);
    const newFormImageUrls = (form.getValues("images") || []).filter((_, i) => i !== indexToRemove);
  
    let newImageFilesToUpload = [...imageFilesToUpload];
  
    if (removedPreviewUrl.startsWith('blob:')) {
      blobUrlManager.current.remove(removedPreviewUrl);
      // Find the corresponding File object to remove from imageFilesToUpload
      // This relies on the order of blob URLs in imagePreviews matching the order of Files in imageFilesToUpload
      let blobIndex = -1;
      let count = 0;
      for(let i = 0; i <= indexToRemove; i++) {
        if(imagePreviews[i].startsWith('blob:')) {
          if(i === indexToRemove) blobIndex = count;
          count++;
        }
      }
      if (blobIndex !== -1) {
        newImageFilesToUpload = imageFilesToUpload.filter((_, i) => i !== blobIndex);
      }
    }
  
    setImagePreviews(newImagePreviews);
    form.setValue("images", newFormImageUrls, { shouldValidate: true, shouldDirty: true });
    setImageFilesToUpload(newImageFilesToUpload);
  };


  async function onSubmit(data: TurfFormValues) {
    if (isUploadingImages) {
        toast({ title: "Please Wait", description: "Images are still processing.", variant: "default"});
        return;
    }
    setIsSubmittingForm(true);
    try {
      // Ensure form.images has the correct length corresponding to imagePreviews
      // This should already be handled by add/remove logic, but as a safeguard:
      if (data.images.length !== imagePreviews.length) {
         // This case indicates a mismatch, potentially use imagePreviews to derive final URLs if needed
         // For now, we assume the add/remove logic keeps them in sync conceptually
         console.warn("Mismatch between form image data and preview count. Submitting with form data.");
      }
      await onSubmitForm(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save turf details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingForm(false);
    }
  }

  return (
    <Card className="shadow-xl">
        <CardHeader>
            <CardTitle className="text-2xl">{initialData?.id ? "Edit Turf" : "Add New Turf"}</CardTitle>
            <CardDescription>{initialData?.id ? "Update the details of your turf." : "Fill in the details to list your turf on TOD (TurfOnDemand)."}</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Turf Name</FormLabel>
                    <FormControl>
                        <Input placeholder="E.g., Champions Arena" {...field} disabled={isSubmittingForm || isUploadingImages} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Location / Address</FormLabel>
                    <FormControl>
                        <Input placeholder="E.g., 123 Main St, Anytown" {...field} disabled={isSubmittingForm || isUploadingImages} />
                    </FormControl>
                     <FormDescription>Use Google Maps link or a clear address.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                  control={form.control}
                  name="ownerPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                           <Input 
                             type="tel" 
                             placeholder="E.g., +919876543210" 
                             {...field} 
                             className="pl-10"
                             disabled={isSubmittingForm || isUploadingImages} 
                           />
                        </div>
                      </FormControl>
                      <FormDescription>Contact number for turf inquiries.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                control={form.control}
                name="pricePerHour"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price Per Hour (₹)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="E.g., 1000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} disabled={isSubmittingForm || isUploadingImages}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea rows={5} placeholder="Detailed description of your turf, facilities, rules, etc." {...field} disabled={isSubmittingForm || isUploadingImages}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="amenities"
                render={() => (
                    <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">Amenities</FormLabel>
                        <FormDescription>
                        Select all available amenities at your turf.
                        </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {allAmenitiesList.map((item) => (
                        <FormField
                        key={item.id}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            (field.value || []).filter(
                                            (value) => value !== item.id
                                            )
                                        );
                                    }}
                                    disabled={isSubmittingForm || isUploadingImages}
                                />
                                </FormControl>
                                <FormLabel className="font-normal">
                                {item.label}
                                </FormLabel>
                            </FormItem>
                            );
                        }}
                        />
                    ))}
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => ( 
                    <FormItem>
                      <FormLabel>Turf Images</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            type="file"
                            id="file-upload"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageFilesChange}
                            className="hidden"
                            disabled={isSubmittingForm || isUploadingImages || imagePreviews.length >= 5}
                          />
                           <Label 
                            htmlFor="file-upload"
                            className={cn(
                                "flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none",
                                (isSubmittingForm || isUploadingImages || imagePreviews.length >= 5) && "cursor-not-allowed opacity-50"
                            )}
                          >
                            {isUploadingImages ? (
                                <span className="flex items-center space-x-2">
                                 <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                                 <span className="font-medium text-muted-foreground">Processing...</span>
                                </span>
                            ) : (
                                <span className="flex items-center space-x-2">
                                <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">
                                    {imagePreviews.length >= 5 ? "Maximum 5 images" : "Click to upload (Max 5)"}
                                </span>
                                </span>
                            )}
                          </Label>
                        </div>
                      </FormControl>
                      <FormDescription>Upload 1-5 images of your turf. First image is primary. Accepted: JPG, PNG, WebP.</FormDescription>
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                          {imagePreviews.map((previewUrl, index) => (
                            <div key={`${previewUrl}-${index}`} className="relative group aspect-[3/2]">
                              <NextImage
                                src={previewUrl}
                                alt={`Preview ${index + 1}`}
                                fill
                                className="rounded-md object-cover"
                                data-ai-hint="facility photo"
                                unoptimized={previewUrl.startsWith('blob:')} 
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100 z-10"
                                onClick={() => removeImage(index)}
                                disabled={isSubmittingForm || isUploadingImages}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Public Visibility</FormLabel>
                            <FormDescription>
                            Allow players to see and book this turf.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmittingForm || isUploadingImages}
                            />
                        </FormControl>
                    </FormItem>
                )}
                />

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmittingForm || isUploadingImages} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" 
                        disabled={isSubmittingForm || isUploadingImages || (form.getValues("images")?.length === 0 && imageFilesToUpload.length === 0) && !initialData?.images?.length }
                    >
                        {(isSubmittingForm || isUploadingImages) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData?.id ? "Save Changes" : "Add Turf"}
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}

export const TurfForm = React.memo(TurfFormComponent);

    