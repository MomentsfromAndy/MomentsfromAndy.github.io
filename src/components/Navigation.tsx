
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, User, LogOut, Settings, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Navigation = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Fetch site name from admin settings
  const { data: siteName = 'Andy Shoots' } = useQuery({
    queryKey: ['admin-setting', 'site_name'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_setting', {
        key: 'site_name'
      });
      if (error) throw error;
      return data || 'Andy Shoots';
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500 text-white';
      case 'admin': return 'bg-blue-500 text-white';
      case 'user': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Camera className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">{siteName}</span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/projects" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/projects') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Projects
            </Link>
            <Link 
              to="/gallery" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/gallery') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Gallery
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/about') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/contact') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{profile?.full_name || 'User'}</span>
                      <Badge className={`ml-2 text-xs ${getRoleBadgeColor(profile?.role || 'visitor')}`}>
                        {profile?.role?.replace('_', ' ').toUpperCase() || 'VISITOR'}
                      </Badge>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-64 p-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">{profile?.email}</div>
                          <div className="text-xs text-muted-foreground">
                            Role: {profile?.role?.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                            <>
                              <NavigationMenuLink asChild>
                                <Link to="/admin.andy" className="flex items-center space-x-2 w-full p-2 text-sm hover:bg-accent rounded">
                                  <Settings className="w-4 h-4" />
                                  <span>Admin Panel</span>
                                </Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild>
                                <Link to="/upload" className="flex items-center space-x-2 w-full p-2 text-sm hover:bg-accent rounded">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload Images</span>
                                </Link>
                              </NavigationMenuLink>
                            </>
                          )}
                          <button
                            onClick={signOut}
                            className="flex items-center space-x-2 w-full p-2 text-sm hover:bg-accent rounded text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
