
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Image as ImageIcon, LogIn } from "lucide-react";
import Navigation from "@/components/Navigation";
import ImageGallery from "@/components/ImageGallery";
import HeroSlideshow from "@/components/HeroSlideshow";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, profile } = useAuth();

  const canUpload = user && (profile?.role === 'admin' || profile?.role === 'super_admin');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="mb-8">
                <Camera className="w-16 h-16 mx-auto lg:mx-0 mb-6 text-primary opacity-80" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-left">
                Visual
                <span className="block text-primary">Storytelling</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                Capturing moments that matter through the lens of creativity and passion
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-start">
                <Link to="/projects">
                  <Button size="lg" className="text-lg px-8 py-6">
                    View Portfolio
                  </Button>
                </Link>
                {canUpload ? (
                  <Link to="/upload">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Images
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      <LogIn className="w-5 h-5 mr-2" />
                      {user ? 'Access Restricted' : 'Sign In to Upload'}
                    </Button>
                  </Link>
                )}
              </div>
              {user && (
                <div className="text-left">
                  <Badge variant="outline" className="text-sm">
                    Welcome back, {profile?.full_name || 'User'}!
                  </Badge>
                </div>
              )}
            </div>

            {/* Slideshow */}
            <div className="order-first lg:order-last">
              <HeroSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-sm">Featured Work</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Latest Captures</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A curated selection of recent photography work across various styles and subjects
            </p>
          </div>
          
          <ImageGallery />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">About the Work</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Every photograph tells a story. Through careful composition, lighting, and timing, 
            I strive to capture the essence of each moment and transform it into something timeless. 
            This portfolio showcases a journey through various photographic disciplines, from portraiture 
            to landscape, street photography to conceptual work.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Portrait Photography</h3>
                <p className="text-muted-foreground">Capturing the human spirit and emotion in every frame</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Landscape & Nature</h3>
                <p className="text-muted-foreground">Exploring the beauty and majesty of the natural world</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Commercial Work</h3>
                <p className="text-muted-foreground">Professional photography for brands and businesses</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
