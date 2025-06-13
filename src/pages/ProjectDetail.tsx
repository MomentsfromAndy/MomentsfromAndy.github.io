
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import ImageCard from "@/components/ImageCard";
import ImageModal from "@/components/ImageModal";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  year: string;
}

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
  folder: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data as Project;
    },
    enabled: !!projectId,
  });

  // Fetch images for this project
  const { data: images = [] } = useQuery({
    queryKey: ['project-images', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Transform database data to match ImageData interface
      return data.map(img => ({
        id: img.id,
        url: img.url,
        title: img.title || 'Untitled',
        category: project?.category || 'General', // Use project category
        camera_model: img.camera_model,
        aperture: img.aperture,
        focal_length: img.focal_length,
        iso: img.iso,
        location: img.location,
        view_count: img.view_count,
        folder: img.folder || 'General'
      })) as ImageData[];
    },
    enabled: !!projectId && !!project,
  });

  // Fetch admin settings for images per folder
  const { data: imagesPerFolder = 4 } = useQuery({
    queryKey: ['admin-setting', 'images_per_folder'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_setting', {
        key: 'images_per_folder'
      });
      if (error) throw error;
      return parseInt(data) || 4;
    },
  });

  // Group images by folder
  const imagesByFolder = images.reduce((acc, image) => {
    const folder = image.folder || 'General';
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(image);
    return acc;
  }, {} as Record<string, ImageData[]>);

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold">Project not found</h1>
            <Link to="/projects">
              <Button className="mt-4">Back to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/projects" className="inline-flex items-center mb-6 text-primary hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
          
          <div className="mb-6">
            <Badge variant="outline" className="mb-4 text-sm">
              {project.category}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xl text-primary font-medium mb-4">
              {project.subtitle}
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {project.description}
            </p>
            <div className="mt-4">
              <Badge variant="secondary">{project.year}</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Images by Folder */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {Object.entries(imagesByFolder).map(([folderName, folderImages]) => (
            <div key={folderName} className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <FolderOpen className="w-6 h-6 mr-3 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold">{folderName}</h2>
                  <Badge variant="outline" className="ml-3">
                    {folderImages.length} images
                  </Badge>
                </div>
                {folderImages.length > imagesPerFolder && (
                  <Button variant="outline" size="sm">
                    View More ({folderImages.length - imagesPerFolder} more)
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {folderImages.slice(0, imagesPerFolder).map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>
            </div>
          ))}

          {Object.keys(imagesByFolder).length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground">This project doesn't have any images yet.</p>
            </div>
          )}
        </div>
      </section>

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

export default ProjectDetail;
