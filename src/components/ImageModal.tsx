import React, { useEffect, useState } from 'react';
import { X, Eye, Heart, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ImageModalProps {
  imageId: string;
  imageUrl: string;
  imageTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ImageDetails {
  id: string;
  title: string;
  camera_model: string;
  aperture: string;
  focal_length: string;
  iso: string;
  location: string;
  view_count: number;
}

interface ReactionCounts {
  like_count: number;
  love_count: number;
  wow_count: number;
}

const ImageModal: React.FC<ImageModalProps> = ({
  imageId,
  imageUrl,
  imageTitle,
  isOpen,
  onClose,
}) => {
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

  // Fetch image details
  const { data: imageDetails } = useQuery({
    queryKey: ['image-details', imageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .single();
      if (error) throw error;
      return data as ImageDetails;
    },
    enabled: isOpen,
  });

  // Fetch reaction counts
  const { data: reactionCounts = { like_count: 0, love_count: 0, wow_count: 0 } } = useQuery({
    queryKey: ['reaction-counts', imageId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_image_reaction_counts', {
        image_id: imageId,
      });
      if (error) throw error;
      return data[0] as ReactionCounts;
    },
    enabled: isOpen,
  });

  // Fetch user's existing reactions
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchUserReactions = async () => {
      const { data, error } = await supabase
        .from('image_reactions')
        .select('reaction_type')
        .eq('image_id', imageId)
        .or(user ? `user_id.eq.${user.id}` : `session_id.eq.${sessionId}`);
      
      if (!error && data) {
        setUserReactions(data.map(r => r.reaction_type));
      }
    };

    fetchUserReactions();
  }, [imageId, user, sessionId, isOpen]);

  // Increment view count when modal opens
  useEffect(() => {
    if (isOpen) {
      supabase.rpc('increment_image_view_count', { image_id: imageId });
    }
  }, [isOpen, imageId]);

  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async ({ reactionType, isRemoving }: { reactionType: string; isRemoving: boolean }) => {
      if (isRemoving) {
        const { error } = await supabase
          .from('image_reactions')
          .delete()
          .eq('image_id', imageId)
          .eq('reaction_type', reactionType)
          .eq(user ? 'user_id' : 'session_id', user ? user.id : sessionId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('image_reactions')
          .insert({
            image_id: imageId,
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
      queryClient.invalidateQueries({ queryKey: ['reaction-counts', imageId] });
      toast({
        title: isRemoving ? 'Reaction removed' : 'Thanks for your reaction!',
        description: isRemoving ? 'Your reaction has been removed.' : 'Your reaction has been recorded.',
      });
    },
  });

  const handleReactionToggle = (reactionType: string) => {
    const isRemoving = userReactions.includes(reactionType);
    toggleReactionMutation.mutate({ reactionType, isRemoving });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Image container */}
          <div className="relative max-w-full max-h-full animate-scale-in">
            <img
              src={imageUrl}
              alt={imageTitle}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              style={{ userSelect: 'none' }}
              draggable={false}
            />
            
            {/* Image info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h2 className="text-2xl font-bold text-white mb-4">{imageTitle}</h2>
              
              {/* Image metadata */}
              {imageDetails && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {imageDetails.camera_model && (
                    <div className="text-white/80">
                      <div className="text-xs uppercase tracking-wide">Camera</div>
                      <div className="text-sm font-medium">{imageDetails.camera_model}</div>
                    </div>
                  )}
                  {imageDetails.aperture && (
                    <div className="text-white/80">
                      <div className="text-xs uppercase tracking-wide">Aperture</div>
                      <div className="text-sm font-medium">f/{imageDetails.aperture}</div>
                    </div>
                  )}
                  {imageDetails.focal_length && (
                    <div className="text-white/80">
                      <div className="text-xs uppercase tracking-wide">Focal Length</div>
                      <div className="text-sm font-medium">{imageDetails.focal_length}mm</div>
                    </div>
                  )}
                  {imageDetails.iso && (
                    <div className="text-white/80">
                      <div className="text-xs uppercase tracking-wide">ISO</div>
                      <div className="text-sm font-medium">{imageDetails.iso}</div>
                    </div>
                  )}
                  {imageDetails.location && (
                    <div className="text-white/80">
                      <div className="text-xs uppercase tracking-wide">Location</div>
                      <div className="text-sm font-medium">{imageDetails.location}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Engagement section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4 text-white/60" />
                  <span className="text-white/60 text-sm">{imageDetails?.view_count || 0} views</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleReactionToggle('like')}
                    className={`flex items-center space-x-1 transition-colors ${
                      userReactions.includes('like') 
                        ? 'text-blue-400' 
                        : 'text-white/60 hover:text-blue-400'
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span className="text-sm">{reactionCounts.like_count}</span>
                  </button>
                  
                  <button
                    onClick={() => handleReactionToggle('love')}
                    className={`flex items-center space-x-1 transition-colors ${
                      userReactions.includes('love') 
                        ? 'text-red-400' 
                        : 'text-white/60 hover:text-red-400'
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{reactionCounts.love_count}</span>
                  </button>
                  
                  <button
                    onClick={() => handleReactionToggle('wow')}
                    className={`flex items-center space-x-1 transition-colors ${
                      userReactions.includes('wow') 
                        ? 'text-yellow-400' 
                        : 'text-white/60 hover:text-yellow-400'
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{reactionCounts.wow_count}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
