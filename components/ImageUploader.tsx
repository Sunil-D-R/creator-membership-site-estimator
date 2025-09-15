import React, { useRef, useState } from 'react';
import { UploadIcon, CloseIcon } from './icons';

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  imagePreviewUrls: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange, onImageRemove, imagePreviewUrls }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onImagesChange(Array.from(files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        onImagesChange(imageFiles);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const dropzoneStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    padding: 'var(--spacing-sm)',
    border: `2px dashed ${isDragOver ? 'var(--color-accent-primary)' : 'var(--color-border-divider)'}`,
    borderRadius: 'var(--border-radius-lg)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: 'var(--color-primary-bg)',
    minHeight: '200px',
    transition: 'border-color var(--transition-speed-fast) var(--transition-ease)',
    cursor: imagePreviewUrls.length === 0 ? 'pointer' : 'default',
  };

  return (
    <div
      style={dropzoneStyle}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={imagePreviewUrls.length === 0 ? handleClick : undefined}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg, image/webp"
        multiple
      />
      {imagePreviewUrls.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', padding: 'var(--spacing-sm)', justifyContent: 'center' }}>
          {imagePreviewUrls.map((url, index) => (
            <div key={index} style={{ position: 'relative', width: '96px', height: '96px' }}>
              <img src={url} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--border-radius-md)' }} />
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  onImageRemove(index);
                }}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: 'var(--color-danger)',
                  color: 'white',
                  borderRadius: 'var(--border-radius-circle)',
                  padding: '4px',
                  lineHeight: '1',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label={`Remove image ${index + 1}`}
              >
                <CloseIcon style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          ))}
           <button
            onClick={handleClick}
            style={{
              width: '96px',
              height: '96px',
              backgroundColor: 'var(--color-secondary-bg)',
              border: '2px dashed var(--color-border-divider)',
              borderRadius: 'var(--border-radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-speed-fast)'
            }}
            aria-label="Add more images"
          >
             <UploadIcon style={{ height: '32px', width: '32px', marginBottom: '4px' }} />
             <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-semibold)' }}>Add more</span>
           </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
          <UploadIcon style={{ height: '48px', width: '48px', marginBottom: 'var(--spacing-xs)' }} />
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>Click, drag, or paste images to upload</span>
          <span style={{ fontSize: '14px' }}>You can add multiple images</span>
          <span style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-text-muted)' }}>PNG, JPG, WEBP</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;