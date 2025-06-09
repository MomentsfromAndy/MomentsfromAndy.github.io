
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageData {
  id: string;
  url: string;
  title: string;
  category: string;
}

const ImageGallery = () => {
  const [images, setImages] = useState<ImageData[]>([
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center",
      title: "Mountain Vista",
      category: "Landscape"
    },
    {
      id: "2", 
      url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop&crop=center",
      title: "Ocean Waves",
      category: "Seascape"
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=800&h=600&fit=crop&crop=center",
      title: "Alpine Glory",
      category: "Landscape"
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop&crop=center",
      title: "River Canyon",
      category: "Nature"
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop&crop=center",
      title: "Rocky Peaks",
      category: "Landscape"
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&h=600&fit=crop&crop=center",
      title: "Forest Light",
      category: "Nature"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
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
              category: "Uploaded"
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
          <Card key={image.id} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-0 relative">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  {image.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No images found</h3>
          <p className="text-muted-foreground">Try selecting a different category or upload some images.</p>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
