// File: src/components/ui/PhotoUpload.tsx
// Component: PhotoUpload
// Type: Client Component (uses useState, file handling)
// Dependencies: lucide-react, next/image

"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import Image from 'next/image'; // Import next/image
import { Camera, Upload, X, Eye, Trash2, Image as ImageIcon } from 'lucide-react'; // Removed Plus

interface UploadedPhoto {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
}

interface PhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosSelected: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
  maxSizePerPhoto?: number; // in MB
  acceptedTypes?: string[];
  title?: string;
  description?: string;
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  isOpen,
  onClose,
  onPhotosSelected,
  maxPhotos = 5,
  maxSizePerPhoto = 10, // Default 10MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  title = "Upload Photos",
  description = "Add photos to support your task or show proof of completion",
  className = ""
}) => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<UploadedPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null); // For focusing and potential focus trap

  const titleId = useId();
  const descriptionId = useId();
  const previewTitleId = useId();

  const handleFiles = useCallback((files: FileList) => {
    const newPhotos: UploadedPhoto[] = [];
    const currentErrors: string[] = []; // Renamed to avoid conflict if you have a state named 'errors'

    Array.from(files).forEach((file) => {
      if (photos.length + newPhotos.length >= maxPhotos) {
        if (!currentErrors.includes(`Maximum ${maxPhotos} photos allowed.`)) { // Avoid duplicate max photo error
            currentErrors.push(`Maximum ${maxPhotos} photos allowed.`);
        }
        return; // Stop processing more files if max is reached
      }
      if (!acceptedTypes.includes(file.type)) {
        currentErrors.push(`${file.name}: Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}.`);
        return;
      }
      if (file.size > maxSizePerPhoto * 1024 * 1024) {
        currentErrors.push(`${file.name}: File too large (max ${maxSizePerPhoto}MB).`);
        return;
      }
      const photoId = Date.now() + Math.random().toString(36).substring(2, 9);
      const url = URL.createObjectURL(file);
      newPhotos.push({ id: photoId, file, url, name: file.name, size: file.size });
    });

    if (currentErrors.length > 0) {
      alert(currentErrors.join('\n')); // Consider a more accessible error display method
    }
    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos].slice(0, maxPhotos)); // Ensure not to exceed maxPhotos
    }
  }, [acceptedTypes, maxPhotos, maxSizePerPhoto, photos.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragEvent = useCallback((e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      if (e.target) e.target.value = ''; // Reset file input
    }
  }, [handleFiles]);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.url);
      }
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const cleanupAndClose = useCallback(() => {
    photos.forEach(photo => URL.revokeObjectURL(photo.url));
    setPhotos([]);
    setPreviewPhoto(null); // Ensure preview is also closed
    onClose();
  }, [photos, onClose]);

  const handleConfirm = useCallback(() => {
    onPhotosSelected(photos);
    // Do not revoke URLs here as parent component will use them.
    // Parent should handle cleanup if needed, or pass photos back for cleanup on unmount.
    onClose(); 
  }, [onPhotosSelected, photos, onClose]);

  // Handle Escape key for closing modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (previewPhoto) {
          setPreviewPhoto(null);
        } else if (isOpen) {
          cleanupAndClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalContentRef.current?.focus(); // Focus the modal content area when it opens
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, previewPhoto, cleanupAndClose]);


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out"
        onClick={cleanupAndClose}
        aria-hidden="true"
      />
      
      <div 
        ref={modalContentRef}
        className={`fixed inset-x-4 top-10 max-w-2xl mx-auto bg-white rounded-lg shadow-xl z-50 max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1} // Make the modal focusable
      >
        <header className="p-4 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 id={titleId} className="font-semibold text-gray-900 flex items-center gap-2">
              <Camera size={20} className="text-indigo-600" aria-hidden="true" />
              {title}
            </h3>
            <p id={descriptionId} className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <button
            onClick={cleanupAndClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close photo uploader"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-4 flex-grow overflow-y-auto">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' 
                : 'border-gray-300 hover:border-gray-400'
            } ${photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : 'cursor-copy'}`}
            onDrop={handleDrop}
            onDragOver={(e) => handleDragEvent(e, true)}
            onDragLeave={(e) => handleDragEvent(e, false)}
            onDragEnter={(e) => handleDragEvent(e, true)} // Added for better drag feedback
            aria-dropeffect="copy"
            aria-disabled={photos.length >= maxPhotos}
          >
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" aria-hidden="true" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {photos.length >= maxPhotos ? `Maximum ${maxPhotos} photos reached` : 'Upload Photos'}
            </h4>
            <p className="text-gray-600 mb-4">
              Drag and drop your photos here, or click to browse
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= maxPhotos}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <Upload size={16} aria-hidden="true" />
                Choose Files
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()} // Simplified: Real camera access needs more specific implementation
                disabled={photos.length >= maxPhotos}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <Camera size={16} aria-hidden="true" />
                Take Photo
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} up to {maxSizePerPhoto}MB each. Max {maxPhotos} photos.
            </p>
          </div>
          <input
            ref={fileInputRef} type="file" multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput} className="hidden"
            aria-hidden="true" // Hidden input, actions are via buttons
          />
        </div>

        {photos.length > 0 && (
          <div className="px-4 pb-4 flex-shrink-0">
            <h4 className="font-medium text-gray-900 mb-3">
              Selected Photos ({photos.length}/{maxPhotos})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1"> {/* Added padding for scrollbar */}
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative"> {/* Added relative for Image */}
                    <Image
                      src={photo.url}
                      alt={photo.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 p-1">
                      <button
                        type="button" onClick={() => setPreviewPhoto(photo)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={`Preview photo ${photo.name}`}
                      >
                        <Eye size={18} className="text-gray-700" aria-hidden="true"/>
                      </button>
                      <button
                        type="button" onClick={() => removePhoto(photo.id)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Remove photo ${photo.name}`}
                      >
                        <Trash2 size={18} className="text-red-600" aria-hidden="true"/>
                      </button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                    <p className="text-white text-xs truncate" title={photo.name}>{photo.name}</p>
                    <p className="text-gray-200 text-xs">{formatFileSize(photo.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="p-4 border-t bg-white flex gap-3 flex-shrink-0">
          <button
            type="button" onClick={cleanupAndClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button" onClick={handleConfirm}
            disabled={photos.length === 0}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
          </button>
        </footer>
      </div>

      {previewPhoto && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-[60] transition-opacity duration-300 ease-in-out" // Increased z-index
            onClick={() => setPreviewPhoto(null)}
            aria-hidden="true"
          />
          <div 
            className="fixed inset-4 z-[70] flex items-center justify-center p-4" // Increased z-index
            role="dialog" 
            aria-modal="true" 
            aria-labelledby={previewTitleId}
          >
            <div className="relative w-full max-w-3xl max-h-[calc(100vh-2rem)] bg-white rounded-lg shadow-xl flex flex-col">
              <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
                <h4 id={previewTitleId} className="font-medium text-gray-900 truncate" title={previewPhoto.name}>{previewPhoto.name}</h4>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </header>
              <div className="p-4 flex-grow overflow-auto flex items-center justify-center">
                {/* Container for Next/Image to control its responsive behavior and max height */}
                <div className="relative w-full h-full max-w-full max-h-full">
                   <Image
                      src={previewPhoto.url}
                      alt={`Preview of ${previewPhoto.name}`}
                      layout="intrinsic" // Allows image to scale down while maintaining aspect ratio
                      width={1200}  // A large representative width, image will scale down
                      height={900} // A large representative height (e.g., 4:3), image will scale down
                      objectFit="contain" // Ensures the whole image is visible
                      className="rounded" // Applied to the wrapper Next/Image creates
                   />
                </div>
              </div>
              <footer className="p-3 text-center text-sm text-gray-600 border-t flex-shrink-0">
                {formatFileSize(previewPhoto.size)}
              </footer>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PhotoUpload;