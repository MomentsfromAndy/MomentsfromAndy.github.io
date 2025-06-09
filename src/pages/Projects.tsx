import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Camera, Image as ImageIcon } from "lucide-react";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  images: string[];
  year: string;
  featured: boolean;
}

const Projects = () => {
  const projects: Project[] = [
    {
      id: "1",
      title: "Urban Landscapes",
      subtitle: "City life through architectural perspectives",
      description: "A comprehensive exploration of urban environments, capturing the intersection between human-made structures and natural light.",
      category: "Architecture",
      images: [
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop&crop=center"
      ],
      year: "2024",
      featured: true
    },
    {
      id: "2", 
      title: "Natural Wonders",
      subtitle: "Capturing the raw beauty of untouched landscapes",
      description: "A journey through some of the world's most breathtaking natural locations, from mountain peaks to serene valleys.",
      category: "Landscape",
      images: [
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop&crop=center"
      ],
      year: "2024",
      featured: true
    },
    {
      id: "3",
      title: "Portrait Series",
      subtitle: "Human stories told through intimate portraiture",
      description: "An ongoing series exploring human emotion and character through carefully crafted portrait photography.",
      category: "Portrait",
      images: [
        "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&crop=center"
      ],
      year: "2023",
      featured: false
    },
    {
      id: "4",
      title: "Digital Abstracts",
      subtitle: "Where technology meets artistic vision",
      description: "Experimental work exploring the visual possibilities of digital photography and post-processing techniques.",
      category: "Abstract",
      images: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center"
      ],
      year: "2023",
      featured: false
    },
    {
      id: "5",
      title: "Forest Chronicles",
      subtitle: "The hidden world within ancient woodlands",
      description: "An intimate look at forest ecosystems, capturing the interplay of light, shadow, and natural textures.",
      category: "Nature",
      images: [
        "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&crop=center"
      ],
      year: "2023",
      featured: true
    }
  ];

  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 text-sm">Portfolio</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Featured Projects
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A curated collection of photographic projects spanning multiple disciplines and creative explorations
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-12">
            <Camera className="w-8 h-8 mr-3 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">Featured Work</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {featuredProjects.map((project, index) => (
              <Card key={project.id} className={`group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 ${index === 0 ? 'lg:col-span-2' : ''}`}>
                <CardContent className="p-0">
                  <div className={`grid ${index === 0 ? 'md:grid-cols-2' : 'grid-cols-1'} gap-0`}>
                    <div className={`aspect-[4/3] ${index === 0 ? 'md:aspect-[3/2]' : ''} overflow-hidden`}>
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className={`p-8 ${index === 0 ? 'flex flex-col justify-center' : ''}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="secondary">{project.category}</Badge>
                        <span className="text-sm text-muted-foreground">{project.year}</span>
                      </div>
                      <h3 className={`font-bold mb-2 ${index === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{project.title}</h3>
                      <p className={`text-primary font-medium mb-4 ${index === 0 ? 'text-lg' : ''}`}>{project.subtitle}</p>
                      <p className="text-muted-foreground leading-relaxed mb-6">{project.description}</p>
                      <Button variant="outline">View Project</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Projects */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-12">
            <ImageIcon className="w-8 h-8 mr-3 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">Additional Projects</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherProjects.map((project) => (
              <Card key={project.id} className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline">{project.category}</Badge>
                      <span className="text-sm text-muted-foreground">{project.year}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-primary font-medium text-sm mb-3">{project.subtitle}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{project.description}</p>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Own Project</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Ready to bring your creative vision to life? Let's collaborate on something extraordinary.
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
