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
import { useState, ChangeEvent } from "react";

const turfFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  location: z.string().min(5, "Location is required."),
  pricePerHour: z.coerce.number().min(0, "Price must be a positive number."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000, "Description too long."),
  amenities: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one amenity.",
  }),
  images: z.array(z.string().url("Invalid URL format")).min(1, "At least one image is required."), // For URLs after upload
  isVisible: z.boolean().default(true),
});

type TurfFormValues = z.infer<typeof turfFormSchema>;

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
  initialData?: Partial<Turf>; // For editing
  onSubmitForm: (data: TurfFormValues) => Promise<void>; // Make it async
}

export function TurfForm({ initialData, onSubmitForm }: TurfFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TurfFormValues>({
    resolver: zodResolver(turfFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      location: initialData?.location || "",
      pricePerHour: initialData?.pricePerHour || 0,
      description: initialData?.description || "",
      amenities: initialData?.amenities || [],
      images: initialData?.images || [], // Store URLs here
      isVisible: initialData?.isVisible === undefined ? true : initialData.isVisible,
    },
  });

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Simulate upload and get URLs
      // In a real app, upload files to Firebase Storage here and get downloadURLs
      const uploadedUrls = await Promise.all(filesArray.map(async (file) => {
        // Mock upload delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // This is a mock URL. Replace with actual Firebase Storage URL.
        return `https://placehold.co/600x400.png?text=${encodeURIComponent(file.name)}`;
      }));
      
      const currentImageUrls = form.getValues("images");
      form.setValue("images", [...currentImageUrls, ...uploadedUrls], { shouldValidate: true });
    }
  };

  const removeImage = (index: number, isPreviewUrl: boolean) => {
    // if isPreviewUrl is true, it's an object URL from a new file. Otherwise, it's an existing URL.
    if (isPreviewUrl) {
        setImageFiles(prev => prev.filter((_, i) => i !== index - (imagePreviews.length - imageFiles.length))); // Adjust index if existing images present
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
         // Also remove corresponding mock URL if it was added (this part is tricky with mixed state)
        // For simplicity, we assume URLs are added only after "upload".
        // This mock needs to be improved for robust URL handling during removal.
        // The current form.setValue("images", ...) might oversimplify this part.
    } else { // It's an existing URL from initialData or already "uploaded"
        const urls = form.getValues("images");
        form.setValue("images", urls.filter((_, i) => i !== index), { shouldValidate: true });
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  async function onSubmit(data: TurfFormValues) {
    setIsSubmitting(true);
    try {
      // The image URLs should already be in data.images from handleImageUpload
      await onSubmitForm(data);
      // Toast and redirect will be handled by the page calling this form.
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save turf details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-xl">
        <CardHeader>
            <CardTitle className="text-2xl">{initialData ? "Edit Turf" : "Add New Turf"}</CardTitle>
            <CardDescription>{initialData ? "Update the details of your turf." : "Fill in the details to list your turf on TurfLink."}</CardDescription>
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
                        <Input placeholder="E.g., Champions Arena" {...field} />
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
                        <Input placeholder="E.g., 123 Main St, Anytown" {...field} />
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
                        <Input type="number" placeholder="E.g., 1000" {...field} />
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
                        <Textarea rows={5} placeholder="Detailed description of your turf, facilities, rules, etc." {...field} />
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
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                           <Label 
                            htmlFor="file-upload"
                            className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none"
                          >
                            <span className="flex items-center space-x-2">
                              <UploadCloud className="w-6 h-6 text-muted-foreground" />
                              <span className="font-medium text-muted-foreground">
                                Click to upload or drag and drop
                              </span>
                            </span>
                          </Label>
                        </div>
                      </FormControl>
                      <FormDescription>Upload at least one image of your turf. Max 5 images.</FormDescription>
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                width={150}
                                height={100}
                                className="rounded-md object-cover w-full h-24"
                                data-ai-hint="turf facility"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100"
                                onClick={() => removeImage(index, preview.startsWith('blob:'))}
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
                            />
                        </FormControl>
                    </FormItem>
                )}
                />

                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Save Changes" : "Add Turf"}
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
