
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { Settings, Save, Users, Image as ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface AdminSetting {
  setting_key: string;
  setting_value: string;
}

const AdminPanel = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Check if user has super admin access
  if (!user || profile?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  // Fetch admin settings
  const { data: adminSettings = [] } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('setting_key');
      if (error) throw error;
      return data as AdminSetting[];
    },
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .neq('role', 'visitor');
      if (error) throw error;
      
      const roleCounts = data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return roleCounts;
    },
  });

  // Fetch image stats
  const { data: imageStats } = useQuery({
    queryKey: ['image-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')
        .select('id');
      if (error) throw error;
      return { total: data.length };
    },
  });

  // Update settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ setting_key: key, setting_value: value });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({
        title: "Settings updated",
        description: "Your changes have been saved successfully.",
      });
    },
  });

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = (key: string) => {
    const value = settings[key];
    if (value !== undefined) {
      updateSettingMutation.mutate({ key, value });
    }
  };

  const getSettingValue = (key: string) => {
    if (settings[key] !== undefined) return settings[key];
    return adminSettings.find(s => s.setting_key === key)?.setting_value || '';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Settings className="w-12 h-12 mr-4 text-primary" />
            <div>
              <Badge variant="outline" className="mb-2 text-sm">Super Admin</Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Admin Panel
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Manage site settings and monitor system status
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(userStats || {}).reduce((a, b) => a + b, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Admins: {userStats?.admin || 0}, Users: {userStats?.user || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{imageStats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <div className="h-2 w-2 bg-green-500 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Settings Management */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Site Settings</h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="site_name">Site Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="site_name"
                        value={getSettingValue('site_name')}
                        onChange={(e) => handleSettingChange('site_name', e.target.value)}
                        placeholder="Enter site name"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveSetting('site_name')}
                        disabled={updateSettingMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="images_per_folder">Images Per Folder</Label>
                    <div className="flex gap-2">
                      <Input
                        id="images_per_folder"
                        type="number"
                        min="1"
                        max="20"
                        value={getSettingValue('images_per_folder')}
                        onChange={(e) => handleSettingChange('images_per_folder', e.target.value)}
                        placeholder="4"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveSetting('images_per_folder')}
                        disabled={updateSettingMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
