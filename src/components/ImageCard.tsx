
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, ThumbsUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ImageCardProps {
  image: {
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
  };
  onClick: () => void;
}

interface ReactionCounts {
  like_count: number;
  love_count: number;
  wow_count: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('guestSessionId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guestSessionId', id);
    }
    return id;
  });
  const [userReactions, setUserReactions] = useState<string[]>([]);

  // Fetch reaction counts
  const { data: reactionCounts = { like_count: 0, love_count: 0, wow_count: 0 } } = useQuery({
    queryKey: ['reaction-counts', image.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_image_reaction_counts', {
        image_id: image.id,
      });
      if (error) throw error;
      return data[0] as ReactionCounts;
    },
  });

  // Fetch user's existing reactions
  useEffect(() => {
    const fetchUserReactions = async () => {
      const { data, error } = await supabase
        .from('image_reactions')
        .select('reaction_type')
        .eq('image_id', image.id)
        .or(user ? `user_id.eq.${user.id}` : `session_id.eq.${sessionId}`);
      
      if (!error && data) {
        setUserReactions(data.map(r => r.reaction_type));
      }
    };

    fetchUserReactions();
  }, [image.id, user, sessionId]);

  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async ({ reactionType, isRemoving }: { reactionType: string; isRemoving: boolean }) => {
      if (isRemoving) {
        const { error } = await supabase
          .from('image_reactions')
          .delete()
          .eq('image_id', image.id)
          .eq('reaction_type', reactionType)
          .eq(user ? 'user_id' : 'session_id', user ? user.id : sessionId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('image_reactions')
          .insert({
            image_id: image.id,
            reaction_type: reactionType,
            user_id: user?.id || null,
            session_id: user ? null : sessionId,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, { reactionType, isRemoving }) => {
      setUserReactions(prev => 
        isRemoving 
          ? prev.filter(r => r !== reactionType)
          : [...prev, reactionType]
      );
      queryClient.invalidateQueries({ queryKey: ['reaction-counts', image.id] });
      toast({
        title: isRemoving ? 'Reaction removed' : 'Thanks for your reaction!',
        description: isRemoving ? 'Your reaction has been removed.' : 'Your reaction has been recorded.',
      });
    },
  });

  const handleReactionToggle = (e: React.MouseEvent, reactionType: string) => {
    e.stopPropagation();
    const isRemoving = userReactions.includes(reactionType);
    toggleReactionMutation.mutate({ reactionType, isRemoving });
  };

  return (
    <Card className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
      <CardContent className="p-0 relative">
        <div className="aspect-[4/3] overflow-hidden" onClick={onClick}>
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none"
            draggable={false}
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold truncate">{image.title}</h3>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              {image.category}
            </Badge>
          </div>

          {/* Image metadata */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
            {image.camera_model && (
              <div>
                <span className="font-medium">Camera:</span> {image.camera_model}
              </div>
            )}
            {image.aperture && (
              <div>
                <span className="font-medium">Aperture:</span> f/{image.aperture}
              </div>
            )}
            {image.focal_length && (
              <div>
                <span className="font-medium">Focal:</span> {image.focal_length}mm
              </div>
            )}
            {image.iso && (
              <div>
                <span className="font-medium">ISO:</span> {image.iso}
              </div>
            )}
            {image.location && (
              <div className="col-span-2">
                <span className="font-medium">Location:</span> {image.location}
              </div>
            )}
          </div>

          {/* Engagement section */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{image.view_count || 0}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => handleReactionToggle(e, 'like')}
                className={`flex items-center space-x-1 transition-colors ${
                  userReactions.includes('like') 
                    ? 'text-blue-500' 
                    : 'text-muted-foreground hover:text-blue-500'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">{reactionCounts.like_count}</span>
              </button>
              
              <button
                onClick={(e) => handleReactionToggle(e, 'love')}
                className={`flex items-center space-x-1 transition-colors ${
                  userReactions.includes('love') 
                    ? 'text-red-500' 
                    : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm">{reactionCounts.love_count}</span>
              </button>
              
              <button
                onClick={(e) => handleReactionToggle(e, 'wow')}
                className={`flex items-center space-x-1 transition-colors ${
                  userReactions.includes('wow') 
                    ? 'text-yellow-500' 
                    : 'text-muted-foreground hover:text-yellow-500'
                }`}
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm">{reactionCounts.wow_count}</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
