
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SlideshowImage {
  id: string;
  title: string;
  url: string;
  storage_path: string;
  project_id: string;
  project_title: string;
}

const HeroSlideshow = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  const { data: images = [] } = useQuery({
    queryKey: ['featured-slideshow-images'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_featured_slideshow_images');
      if (error) throw error;
      return data as SlideshowImage[];
    },
  });

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    // Auto-advance slides every 5 seconds
    const interval = setInterval(() => {
      if (api) {
        api.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  const handleImageClick = (projectId: string) => {
    if (projectId) {
      navigate(`/projects#${projectId}`);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Prevent right-click context menu for non-super admins
    if (!user || profile?.role !== 'super_admin') {
      e.preventDefault();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Prevent drag for non-super admins
    if (!user || profile?.role !== 'super_admin') {
      e.preventDefault();
    }
  };

  if (images.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg aspect-[16/9] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">No featured images available</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.id}>
              <Card className="border-none shadow-2xl overflow-hidden">
                <CardContent className="p-0 relative">
                  <div 
                    className="aspect-[16/9] overflow-hidden cursor-pointer group"
                    onClick={() => handleImageClick(image.project_id)}
                  >
                    <img
                      src={image.url}
                      alt={image.title || 'Portfolio image'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none"
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                      draggable={false}
                      style={{
                        userSelect: 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {image.title && (
                        <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
                      )}
                      {image.project_title && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {image.project_title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
      
      {/* Slide indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === current - 1 ? 'bg-primary' : 'bg-primary/30'
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlideshow;
