
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import ImageGallery from "@/components/ImageGallery";
import { Camera } from "lucide-react";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Camera className="w-12 h-12 mr-4 text-primary" />
            <Badge variant="outline" className="text-sm">Image Gallery</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Visual Collection
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Browse through a diverse collection of photographs. Upload your own images to expand the gallery and organize them by category.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <ImageGallery />
        </div>
      </section>
    </div>
  );
};

export default Gallery;
