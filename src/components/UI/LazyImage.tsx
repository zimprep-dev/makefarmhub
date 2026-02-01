import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  placeholder?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  aspectRatio,
  objectFit = 'cover',
  className = '',
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!imageRef) return;

    // Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observerRef.current.observe(imageRef);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [imageRef, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={`lazy-image-error ${className}`}
        style={{ aspectRatio }}
      >
        <ImageOff size={32} />
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <div 
      className={`lazy-image-wrapper ${className}`}
      style={{ aspectRatio }}
    >
      <img
        ref={setImageRef}
        src={imageSrc}
        alt={alt}
        className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
        style={{ objectFit }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
      {!isLoaded && !hasError && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-shimmer" />
        </div>
      )}
    </div>
  );
}

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  onImageClick?: (index: number) => void;
}

export function ImageGallery({ images, alt = 'Gallery image', onImageClick }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    onImageClick?.(index);
  };

  if (images.length === 0) {
    return (
      <div className="image-gallery-empty">
        <ImageOff size={48} />
        <p>No images available</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <div className="image-gallery-main">
        <LazyImage
          src={images[selectedIndex]}
          alt={`${alt} ${selectedIndex + 1}`}
          aspectRatio="16/9"
          objectFit="cover"
        />
      </div>
      {images.length > 1 && (
        <div className="image-gallery-thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              className={`image-gallery-thumbnail ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
            >
              <LazyImage
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                aspectRatio="1/1"
                objectFit="cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Avatar({ 
  src, 
  alt, 
  size = 'md',
  fallback 
}: { 
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}) {
  const [hasError, setHasError] = useState(false);

  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 64,
    xl: 96
  };

  const avatarSize = sizeMap[size];

  if (!src || hasError) {
    return (
      <div 
        className={`avatar avatar-${size} avatar-fallback`}
        style={{ width: avatarSize, height: avatarSize }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`avatar avatar-${size}`} style={{ width: avatarSize, height: avatarSize }}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}
