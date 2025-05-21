
// src/components/turf/turf-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { UploadCloud, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, ChangeEvent, useEffect } from "react";

const turfFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  location: z.string().min(5, "Location is required."),
  pricePerHour: z.coerce.number().min(0, "Price must be a positive number."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000, "Description too long."),
  amenities: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one amenity.",
  }),
  images: z.array(z.string().url("Invalid URL format or mock URL expected.")).min(1, "At least one image is required."),
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

export function TurfForm({ initialData, onSubmitForm }: TurfFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for actual File objects, to be uploaded
  const [imageFilesToUpload, setImageFilesToUpload] = useState<File[]>([]);
  // State for all image previews (blob URLs for new files, existing URLs for old ones)
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
  
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Renamed to avoid conflict
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const form = useForm<TurfFormValues>({
    resolver: zodResolver(turfFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      location: initialData?.location || "",
      pricePerHour: initialData?.pricePerHour || 0,
      description: initialData?.description || "",
      amenities: initialData?.amenities || [],
      images: initialData?.images || [], // This will store the final URLs for the form
      isVisible: initialData?.isVisible === undefined ? true : initialData.isVisible,
    },
  });
  
  // Sync form's images field if initialData.images changes (e.g. after edit load)
  useEffect(() => {
    if (initialData?.images) {
      form.setValue("images", initialData.images);
      setImagePreviews(initialData.images);
    }
  }, [initialData?.images, form]);


  const handleImageFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      if (imagePreviews.length + filesArray.length > 5) {
        toast({ title: "Image Limit", description: "You can upload a maximum of 5 images.", variant: "destructive" });
        return;
      }

      setIsUploadingImages(true);
      
      const newLocalPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newLocalPreviews]);
      
      // Store files for "upload" simulation
      setImageFilesToUpload(prev => [...prev, ...filesArray]);

      // Simulate upload and get URLs
      const uploadedUrlsPromises = filesArray.map(async (file) => {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); // Simulate upload delay
        return `https://placehold.co/600x400.png?text=${encodeURIComponent(file.name.substring(0,10))}`; // Mock URL
      });
      
      const newUploadedUrls = await Promise.all(uploadedUrlsPromises);
      
      const currentImageUrls = form.getValues("images");
      form.setValue("images", [...currentImageUrls, ...newUploadedUrls], { shouldValidate: true });
      
      // Clear the file input so the same file can be selected again if removed and re-added
      event.target.value = ""; 
      setIsUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    // Remove from previews
    const removedPreview = imagePreviews[indexToRemove];
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));

    // Remove from form's 'images' (URLs)
    // If the removed preview was a blob URL, it means it was from imageFilesToUpload
    // and its corresponding mock URL needs to be removed. Otherwise, it's an existing URL.
    
    const currentUrls = form.getValues("images");
    let urlToRemove = "";

    if (removedPreview.startsWith('blob:')) {
        // This is complex: we need to find which URL in `form.getValues("images")` corresponds to this blob.
        // For this mock, we assume a simple mapping or might need a more robust way to track.
        // A simpler mock: if it's a blob, we might need to find its "uploaded" URL.
        // This part of the mock is imperfect without a real upload mapping.
        // Let's assume for now it's an already "uploaded" URL if not a blob.
        // One way: try to find a URL in currentUrls that was recently added if imageFilesToUpload had items.

        // For simplicity, if we remove a preview, we also remove its corresponding URL from the form.
        // This requires knowing which URL corresponds to which preview.
        // The easiest way is if form.setValue("images", imagePreviews.filter(...)) but previews can be blob or existing.
        // So, we try to remove the URL at the same index. This assumes `images` and `previews` are somewhat synced
        // with new URLs appended.
         if (indexToRemove < currentUrls.length) { // defensive check
            const updatedUrls = currentUrls.filter((_, i) => i !== indexToRemove);
            form.setValue("images", updatedUrls, { shouldValidate: true });
        }

    } else { // It's an existing URL (e.g. from initialData or already "uploaded")
        urlToRemove = removedPreview;
        const updatedUrls = currentUrls.filter(url => url !== urlToRemove);
        form.setValue("images", updatedUrls, { shouldValidate: true });
    }
    
    // Also try to remove from imageFilesToUpload if it was a new file
    // This requires tracking which preview corresponds to which file more accurately.
    // For now, this part of the mock for `imageFilesToUpload` might not be perfectly synced with preview removal.
  };


  async function onSubmit(data: TurfFormValues) {
    if (isUploadingImages) {
        toast({ title: "Please Wait", description: "Images are still uploading.", variant: "default"});
        return;
    }
    setIsSubmittingForm(true);
    try {
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
            <CardDescription>{initialData?.id ? "Update the details of your turf." : "Fill in the details to list your turf on TurfLink."}</CardDescription>
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
                name="pricePerHour"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price Per Hour (₹)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="E.g., 1000" {...field} disabled={isSubmittingForm || isUploadingImages}/>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  render={({ field }) => ( // field here is for the array of URLs
                    <FormItem>
                      <FormLabel>Turf Images</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            type="file"
                            id="file-upload"
                            multiple
                            accept="image/*"
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
                                 <span className="font-medium text-muted-foreground">Uploading...</span>
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
                      <FormDescription>Upload 1-5 images of your turf. First image is primary.</FormDescription>
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                          {imagePreviews.map((previewUrl, index) => (
                            <div key={previewUrl || index} className="relative group">
                              <Image
                                src={previewUrl}
                                alt={`Preview ${index + 1}`}
                                width={150}
                                height={100}
                                className="rounded-md object-cover w-full h-24"
                                data-ai-hint="turf facility"
                                unoptimized={previewUrl.startsWith('blob:')} // Important for blob URLs
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

                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmittingForm || isUploadingImages}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmittingForm || isUploadingImages || form.getValues("images").length === 0}>
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
