
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
  const [images, setImages] = useState<ImageData[]>([
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center",
      title: "Mountain Vista",
      category: "Landscape",
      camera_model: "Canon EOS R5",
      aperture: "8.0",
      focal_length: "24",
      iso: "100",
      location: "Swiss Alps",
      view_count: 245
    },
    {
      id: "2", 
      url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop&crop=center",
      title: "Ocean Waves",
      category: "Seascape",
      camera_model: "Sony A7R IV",
      aperture: "11.0",
      focal_length: "70",
      iso: "200",
      location: "Big Sur, California",
      view_count: 189
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=800&h=600&fit=crop&crop=center",
      title: "Alpine Glory",
      category: "Landscape",
      camera_model: "Nikon D850",
      aperture: "5.6",
      focal_length: "85",
      iso: "64",
      location: "Dolomites, Italy",
      view_count: 312
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop&crop=center",
      title: "River Canyon",
      category: "Nature",
      camera_model: "Fujifilm X-T4",
      aperture: "4.0",
      focal_length: "35",
      iso: "160",
      location: "Antelope Canyon, Arizona",
      view_count: 156
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop&crop=center",
      title: "Rocky Peaks",
      category: "Landscape",
      camera_model: "Canon EOS 5D Mark IV",
      aperture: "16.0",
      focal_length: "16",
      iso: "100",
      location: "Patagonia, Chile",
      view_count: 278
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&h=600&fit=crop&crop=center",
      title: "Forest Light",
      category: "Nature",
      camera_model: "Sony A7 III",
      aperture: "2.8",
      focal_length: "50",
      iso: "400",
      location: "Olympic National Park",
      view_count: 203
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["All", ...Array.from(new Set(images.map(img => img.category)))];

  const filteredImages = selectedCategory === "All" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const newImage: ImageData = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              url: e.target?.result as string,
              title: file.name.split('.')[0],
              category: "Uploaded",
              view_count: 0
            };
            setImages(prev => [newImage, ...prev]);
          };
          reader.readAsDataURL(file);
          
          toast({
            title: "Image uploaded successfully",
            description: `${file.name} has been added to your gallery.`,
          });
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
        <Button onClick={triggerFileUpload} size="lg" className="mb-6">
          <Upload className="w-5 h-5 mr-2" />
          Upload New Images
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

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => handleImageClick(image)}
          />
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No images found</h3>
          <p className="text-muted-foreground">Try selecting a different category or upload some images.</p>
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
