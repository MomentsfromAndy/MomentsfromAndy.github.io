
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Heart, Award } from 'lucide-react';

const About = () => {
  const { data: aboutSections = [] } = useQuery({
    queryKey: ['about-us'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_us')
        .select('*')
        .order('section_order');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 mr-4 text-primary" />
            <Badge variant="outline" className="text-sm">About Us</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the passion and vision behind our photography journey
          </p>
        </div>
      </section>

      {/* About Sections */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-12">
            {aboutSections.map((section, index) => (
              <Card key={section.id} className="border-none shadow-lg">
                <CardContent className="p-8">
                  <div className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                    <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                      <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                      <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                    <div className={`aspect-[4/3] rounded-lg overflow-hidden ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                      {section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={section.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Camera className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our work and define our approach to photography
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg text-center">
              <CardContent className="p-8">
                <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Creativity</h3>
                <p className="text-muted-foreground">
                  We believe in pushing boundaries and exploring new perspectives to create unique visual stories.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg text-center">
              <CardContent className="p-8">
                <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Passion</h3>
                <p className="text-muted-foreground">
                  Every shot is taken with genuine love for the craft and dedication to capturing perfect moments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg text-center">
              <CardContent className="p-8">
                <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for the highest quality in every aspect of our work, from composition to final delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
