
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";

interface ImageData {
  id: string;
  url: string;
  title: string;
  category: string;
  camera_model?: string;
  aperture?: string;
  focal_length?: string;
  iso?: string;
  location?: string;
  view_count?: number;
}

const ImageGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch images from database
  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(img => ({
        id: img.id,
        url: img.url,
        title: img.title || 'Untitled',
        category: img.folder || 'General',
        camera_model: img.camera_model,
        aperture: img.aperture,
        focal_length: img.focal_length,
        iso: img.iso,
        location: img.location,
        view_count: img.view_count || 0
      })) as ImageData[];
    },
  });

  // Get unique categories from database images
  const categories = ["All", ...Array.from(new Set(images.map(img => img.category)))];

  const filteredImages = selectedCategory === "All" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  // Upload mutation to save images to database
  const uploadMutation = useMutation({
    mutationFn: async (imageData: { url: string; title: string; category: string }) => {
      const { data, error } = await supabase
        .from('images')
        .insert({
          url: imageData.url,
          title: imageData.title,
          folder: imageData.category,
          view_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been added to the gallery.",
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            const title = file.name.split('.')[0];
            
            uploadMutation.mutate({
              url: imageUrl,
              title: title,
              category: "Uploaded"
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Error loading images</h3>
        <p className="text-muted-foreground">There was an error loading the gallery. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button 
          onClick={triggerFileUpload} 
          size="lg" 
          className="mb-6"
          disabled={uploadMutation.isPending}
        >
          <Upload className="w-5 h-5 mr-2" />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload New Images'}
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading images...</p>
        </div>
      )}

      {/* Image Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onClick={() => handleImageClick(image)}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No images found</h3>
          <p className="text-muted-foreground">
            {selectedCategory === "All" 
              ? "Upload some images to get started." 
              : "Try selecting a different category or upload some images."
            }
          </p>
        </div>
      )}

      {/* Full-screen Image Modal */}
      {selectedImage && (
        <ImageModal
          imageId={selectedImage.id}
          imageUrl={selectedImage.url}
          imageTitle={selectedImage.title}
          isOpen={!!selectedImage}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ImageGallery;
