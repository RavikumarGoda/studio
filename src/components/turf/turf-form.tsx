
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
import { cn } from "@/lib/utils";

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
  
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const form = useForm<TurfFormValues>({
    resolver: zodResolver(turfFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      location: initialData?.location || "",
      pricePerHour: initialData?.pricePerHour || 0,
      description: initialData?.description || "",
      amenities: initialData?.amenities || [],
      images: initialData?.images || [], 
      isVisible: initialData?.isVisible === undefined ? true : initialData.isVisible,
    },
  });
  
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
      
      setImageFilesToUpload(prev => [...prev, ...filesArray]);

      const uploadedUrlsPromises = filesArray.map(async (file) => {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); 
        return `https://placehold.co/600x400.png`; // Generic placeholder URL
      });
      
      const newUploadedUrls = await Promise.all(uploadedUrlsPromises);
      
      const currentImageUrls = form.getValues("images");
      form.setValue("images", [...currentImageUrls, ...newUploadedUrls], { shouldValidate: true });
      
      event.target.value = ""; 
      setIsUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const removedPreview = imagePreviews[indexToRemove];
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));

    const currentUrls = form.getValues("images");
    let updatedUrls;

    if (removedPreview.startsWith('blob:')) {
      // If it's a blob, it means it was a new file. We remove a corresponding
      // generic placeholder URL from the form values. This assumes new placeholders
      // were appended and order is maintained.
      // This simple removal by index from `currentUrls` works if `imagePreviews` and `currentUrls`
      // (for the newly added items) maintain their relative order.
      updatedUrls = currentUrls.filter((_, i) => {
        // This logic is tricky: we need to map the preview index to the URL index.
        // Let's assume that if the removed preview was a blob, it corresponds to one of the
        // *later* entries in `currentUrls` that is a generic placeholder.
        // A more robust mock would track exact mappings, but for now, we remove by index.
        // The original logic of removing by index from `currentUrls` is kept,
        // as it's the simplest for this mock scenario.
        return i !== indexToRemove; // This might not be perfectly accurate if initialData also had generic placeholders.
      });
      // A safer approach for blobs if order is exact:
      // Count how many blob previews are *before* this one. Remove that many non-blob urls from the start of `currentUrls`,
      // then remove the `n-th` generic placeholder. But let's stick to simpler index removal for now.
      const nonBlobPreviewsCount = imagePreviews.filter(p => !p.startsWith('blob:')).length;
      const blobIndexAmongBlobs = imagePreviews.slice(0, indexToRemove).filter(p => p.startsWith('blob:')).length;
      
      if (indexToRemove >= nonBlobPreviewsCount) { // It's a blob URL that was removed
         // Find the corresponding generic URL to remove
         // This assumes generic URLs from blobs are appended after existing URLs.
         const urlIndexToRemoveInForm = nonBlobPreviewsCount + blobIndexAmongBlobs;
         if (urlIndexToRemoveInForm < currentUrls.length) {
            updatedUrls = currentUrls.filter((_, i) => i !== urlIndexToRemoveInForm);
         } else {
            updatedUrls = [...currentUrls]; // Should not happen if logic is correct
         }
      } else { // It's an existing HTTP URL that was removed
         updatedUrls = currentUrls.filter(url => url !== removedPreview);
      }

    } else { 
      // It's an existing HTTP URL (from initialData or previously "uploaded")
      updatedUrls = currentUrls.filter(url => url !== removedPreview);
    }
    form.setValue("images", updatedUrls, { shouldValidate: true });
    
    // Optionally, also remove from imageFilesToUpload if the removedPreview was a blob
    // This requires mapping blob URLs back to files, which is complex if files are not stored with their blob URLs.
    // For this mock, we'll primarily focus on updating `imagePreviews` and `form.getValues("images")`.
    if (removedPreview.startsWith('blob:')) {
        // Find the corresponding file in imageFilesToUpload and remove it.
        // This requires a more robust mapping than is currently implemented.
        // For now, we'll skip precise removal from imageFilesToUpload to avoid complexity,
        // as it's mainly for the "upload" simulation.
    }
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
                  render={({ field }) => ( 
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

