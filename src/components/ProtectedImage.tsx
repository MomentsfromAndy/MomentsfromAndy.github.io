
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const ProtectedImage: React.FC<ProtectedImageProps> = ({
  src,
  alt,
  className = '',
  onClick,
  style,
  ...props
}) => {
  const { user, profile } = useAuth();

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

  const protectedStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitUserDrag: 'none',
    KhtmlUserDrag: 'none',
    MozUserDrag: 'none',
    OUserDrag: 'none',
    userDrag: 'none',
    ...style
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`select-none ${className}`}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onClick={onClick}
      style={protectedStyle}
      {...props}
    />
  );
};

export default ProtectedImage;
