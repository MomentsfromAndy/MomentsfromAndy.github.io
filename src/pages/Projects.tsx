import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Camera, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  year: string;
  featured: boolean;
}

const Projects = () => {
  // Fetch projects from database
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  // Fetch sample images for each project
  const { data: projectImages = {} } = useQuery({
    queryKey: ['project-images-sample'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')
        .select('id, url, project_id')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Group images by project_id and take first 2 images per project
      const imagesByProject: Record<string, string[]> = {};
      data.forEach(img => {
        if (!imagesByProject[img.project_id]) {
          imagesByProject[img.project_id] = [];
        }
        if (imagesByProject[img.project_id].length < 2) {
          imagesByProject[img.project_id].push(img.url);
        }
      });
      return imagesByProject;
    },
    enabled: projects.length > 0,
  });

  const featuredProjects = projects.filter((project) => project.featured);
  const otherProjects = projects.filter((project) => !project.featured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mx-auto mb-6"></div>
              <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            </div>
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
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 text-sm">
            Portfolio
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Featured Projects
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A curated collection of photographic projects spanning multiple
            disciplines and creative explorations
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-12">
              <Camera className="w-8 h-8 mr-3 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">Featured Work</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {featuredProjects.map((project, index) => (
                <Card
                  key={project.id}
                  className={`group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 ${
                    index === 0 ? "lg:col-span-2" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    <div
                      className={`grid ${
                        index === 0 ? "md:grid-cols-2" : "grid-cols-1"
                      } gap-0`}
                    >
                      <div
                        className={`aspect-[4/3] ${
                          index === 0 ? "md:aspect-[3/2]" : ""
                        } overflow-hidden`}
                      >
                        {projectImages[project.id]?.[0] ? (
                          <img
                            src={projectImages[project.id][0]}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Camera className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`p-8 ${
                          index === 0 ? "flex flex-col justify-center" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="secondary">{project.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {project.year}
                          </span>
                        </div>
                        <h3
                          className={`font-bold mb-2 ${
                            index === 0 ? "text-3xl md:text-4xl" : "text-2xl"
                          }`}
                        >
                          {project.title}
                        </h3>
                        <p
                          className={`text-primary font-medium mb-4 ${
                            index === 0 ? "text-lg" : ""
                          }`}
                        >
                          {project.subtitle}
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {project.description}
                        </p>
                        <Link to={`/projects/${project.id}`}>
                          <Button variant="outline">View Project</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <section className="py-16 px-4 bg-secondary/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-12">
              <ImageIcon className="w-8 h-8 mr-3 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Additional Projects
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] overflow-hidden">
                      {projectImages[project.id]?.[0] ? (
                        <img
                          src={projectImages[project.id][0]}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Camera className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline">{project.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {project.year}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-primary font-medium text-sm mb-3">
                        {project.subtitle}
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {project.description}
                      </p>
                      <Link to={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Camera className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              No Projects Yet
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Projects will appear here once they are created by administrators.
            </p>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your Own Project
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Ready to bring your creative vision to life? Let's collaborate on
            something extraordinary.
          </p>
          <Button size="lg" className="text-lg px-8 py-6">
            Get In Touch
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Projects;
