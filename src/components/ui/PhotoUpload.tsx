// components/PhotoUpload.tsx
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  X,
  Eye,
  Trash2,
  Image as ImageIcon,
  SwitchCamera,
  AlertCircle,
} from "lucide-react";

export interface UploadedPhoto {
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
  maxSizePerPhoto?: number;
  acceptedTypes?: string[];
  title?: string;
  description?: string;
  className?: string;
  required?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  isOpen,
  onClose,
  onPhotosSelected,
  maxPhotos = 5,
  maxSizePerPhoto = 10,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  title = "Upload Photos",
  description = "Add photos to support your task or show proof of completion",
  className = "",
  required = false,
}) => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<UploadedPhoto | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const titleId = useId();
  const descriptionId = useId();

  // Feature detection
  const isIOS = typeof window !== "undefined" && 
    /iPad|iPhone|iPod/.test(navigator.userAgent) && 
    !("MSStream" in window);



  // Enumerate available cameras
  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === "videoinput");
      setAvailableCameras(cameras);
      
      // Prefer back camera if available
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes("back") || 
        camera.label.toLowerCase().includes("rear") ||
        camera.label.toLowerCase().includes("environment")
      );
      
      if (backCamera) {
        setSelectedCameraId(backCamera.deviceId);
      } else if (cameras.length > 0) {
        setSelectedCameraId(cameras[0].deviceId);
      }
    } catch (error) {
      console.error("Failed to enumerate cameras:", error);
    }
  }, []);

  // Start camera with improved error handling
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsLoadingCamera(true);

    try {
      // First, enumerate cameras
      await enumerateCameras();

      // Build constraints
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: true
      };

      // Try to use specific camera or facing mode
      if (selectedCameraId) {
        constraints.video = { deviceId: { exact: selectedCameraId } };
      } else if (!isIOS) {
        // Use facingMode for non-iOS devices
        constraints.video = { facingMode: { ideal: "environment" } };
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      
      // Set video source and play
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Important: wait for metadata to be loaded
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error("Failed to play video:", err);
          });
        };
      }

      setShowCamera(true);
      setIsLoadingCamera(false);
    } catch (error) {
      console.error("Camera error:", error);
      setIsLoadingCamera(false);

      let message = "Unable to access camera. ";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          message += "Please allow camera access in your browser settings.";
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          message += "No camera found on this device.";
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
          message += "Camera is already in use by another application.";
        } else if (error.name === "OverconstrainedError") {
          message += "Camera constraints could not be satisfied.";
        } else {
          message += error.message || "Please try again or use file upload.";
        }
      }

      setCameraError(message);
      
      // Fallback to file input after delay
      setTimeout(() => {
        cameraInputRef.current?.click();
      }, 2000);
    }
  }, [selectedCameraId, isIOS, enumerateCameras]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraError(null);
  }, [stream]);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Video stream not ready. Please try again.");
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Failed to capture photo. Please try again.");
          return;
        }

        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newPhoto: UploadedPhoto = {
          id,
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        };

        setPhotos(prev => {
          const updated = [...prev, newPhoto];
          return updated.slice(0, maxPhotos);
        });

        // Close camera after capture
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }, [maxPhotos, stopCamera]);

  // Switch between cameras
  const switchCamera = useCallback(() => {
    if (availableCameras.length < 2) return;
    
    const currentIndex = availableCameras.findIndex(
      cam => cam.deviceId === selectedCameraId
    );
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    
    setSelectedCameraId(nextCamera.deviceId);
    
    // Restart camera with new device
    if (stream) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [availableCameras, selectedCameraId, stream, stopCamera, startCamera]);

  // Handle file uploads
  const handleFiles = useCallback(
    (files: FileList) => {
      const newPhotos: UploadedPhoto[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        // Check count
        if (photos.length + newPhotos.length >= maxPhotos) {
          if (!errors.includes(`Maximum ${maxPhotos} photos allowed.`)) {
            errors.push(`Maximum ${maxPhotos} photos allowed.`);
          }
          return;
        }
        
        // Check type
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid type.`);
          return;
        }
        
        // Check size
        if (file.size > maxSizePerPhoto * 1024 * 1024) {
          errors.push(`${file.name}: Too large (max ${maxSizePerPhoto}MB).`);
          return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newPhotos.push({
          id,
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      });

      if (errors.length > 0) {
        alert(errors.join("\n"));
      }

      if (newPhotos.length > 0) {
        setPhotos(prev => {
          const updated = [...prev, ...newPhotos];
          return updated.slice(0, maxPhotos);
        });
      }
    },
    [acceptedTypes, maxPhotos, maxSizePerPhoto, photos.length]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
      e.target.value = "";
    },
    [handleFiles]
  );

  // Drag and drop handlers
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragEvent = useCallback((e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    setDragActive(active);
  }, []);

  // Remove photo
  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.url);
      }
      return prev.filter(p => p.id !== id);
    });
  }, []);

  // Cleanup and close
  const cleanupAndClose = useCallback(() => {
    photos.forEach(p => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setPreviewPhoto(null);
    stopCamera();
    onClose();
  }, [photos, onClose, stopCamera]);

  // Confirm selection
  const handleConfirm = useCallback(() => {
    onPhotosSelected(photos);
    photos.forEach(p => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setPreviewPhoto(null);
    stopCamera();
    onClose();
  }, [onPhotosSelected, photos, onClose, stopCamera]);

  // Keyboard handling
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCamera) {
          stopCamera();
        } else if (previewPhoto) {
          setPreviewPhoto(null);
        } else {
          cleanupAndClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      modalContentRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, previewPhoto, showCamera, cleanupAndClose, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      photos.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [stream, photos]);

  // Format file size
  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizes = ["Bytes", "KB", "MB", "GB"];
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  // UI state
  const hasPhotos = photos.length > 0;
  const shouldDisableButton = required && !hasPhotos;
  const buttonText = !hasPhotos 
    ? (required ? "Please add at least one photo" : "Continue without photos")
    : `Continue with ${photos.length} photo${photos.length === 1 ? "" : "s"}`;
  const buttonColor = shouldDisableButton 
    ? "bg-gray-400 cursor-not-allowed" 
    : "bg-indigo-600 hover:bg-indigo-700";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={cleanupAndClose}
        aria-hidden="true"
      />

      {/* Main Modal */}
      <div
        ref={modalContentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={`fixed inset-x-4 top-10 z-50 mx-auto max-w-2xl flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-lg bg-white shadow-xl ${className}`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-gray-50 p-4">
          <div>
            <h3 id={titleId} className="flex items-center gap-2 font-semibold text-gray-900">
              <Camera size={20} className="text-indigo-600" />
              {title}
              <span className={`ml-2 rounded px-2 py-1 text-xs font-medium ${
                required 
                  ? "bg-red-100 text-red-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                {required ? "Required" : "Optional"}
              </span>
            </h3>
            <p id={descriptionId} className="mt-1 text-sm text-gray-600">
              {description}
              {!required && (
                <span className="block mt-1 text-green-600 font-medium">
                  You can skip this step if you don&apos;t have photos to add.
                </span>
              )}
            </p>
          </div>
          <button
            onClick={cleanupAndClose}
            aria-label="Close photo uploader"
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </header>

        {/* Camera Error */}
        {cameraError && (
          <div className="mx-4 mt-4 rounded-lg bg-red-50 p-4" role="alert">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Camera Error</h3>
                <p className="mt-1 text-sm text-red-700">{cameraError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div className="flex-grow overflow-y-auto p-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => handleDragEvent(e, true)}
            onDragLeave={(e) => handleDragEvent(e, false)}
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 hover:border-gray-400"
            } ${photos.length >= maxPhotos ? "opacity-50" : ""}`}
          >
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
            <h4 className="mb-2 text-lg font-medium text-gray-900">
              {photos.length >= maxPhotos ? `Maximum ${maxPhotos} photos reached` : "Upload Photos"}
            </h4>
            <p className="mb-4 text-gray-600">
              {required 
                ? "At least one photo is required to continue" 
                : "Drag & drop files here or use the buttons below (optional)"}
            </p>

            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= maxPhotos}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Upload size={16} />
                Choose Files
              </button>

              
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Accepts {acceptedTypes.map(t => t.split("/")[1].toUpperCase()).join(", ")} up to {maxSizePerPhoto}MB each.
            </p>
          </div>

          {/* Hidden Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileInput}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="flex-shrink-0 px-4 pb-4">
            <h4 className="mb-3 font-medium text-gray-900">
              Selected Photos ({photos.length}/{maxPhotos})
            </h4>
            <div className="grid max-h-60 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
              {photos.map(photo => (
                <div key={photo.id} className="group relative">
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                    <Image
                      src={photo.url}
                      alt={photo.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/30">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="truncate text-xs text-white">{photo.name}</p>
                    <p className="text-xs text-gray-200">{formatSize(photo.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="flex flex-shrink-0 gap-3 border-t bg-white p-4">
          <button
            onClick={cleanupAndClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={shouldDisableButton}
            className={`flex-1 rounded-lg px-4 py-2 text-white ${buttonColor}`}
          >
            {buttonText}
          </button>
        </footer>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/75" onClick={stopCamera} />
          
          <div className="fixed inset-4 z-[70] flex items-center justify-center p-4">
            <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-black shadow-xl">
              <header className="flex items-center justify-between bg-gray-900 p-4">
                <h4 className="font-medium text-white">Take Photo</h4>
                <div className="flex items-center gap-2">
                  {availableCameras.length > 1 && (
                    <button
                      onClick={switchCamera}
                      className="rounded-full p-2 text-white hover:bg-gray-800"
                    >
                      <SwitchCamera size={20} />
                    </button>
                  )}
                  <button
                    onClick={stopCamera}
                    className="rounded-full p-2 text-white hover:bg-gray-800"
                  >
                    <X size={20} />
                  </button>
                </div>
              </header>

              <div className="relative flex-grow">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {isLoadingCamera && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              <footer className="flex-shrink-0 bg-gray-900 p-4">
                <button
                  onClick={capturePhoto}
                  disabled={isLoadingCamera}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                  <div className="h-14 w-14 rounded-full bg-red-500" />
                </button>
              </footer>
            </div>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewPhoto && (
        <>
          <div 
            className="fixed inset-0 z-[60] bg-black/75" 
            onClick={() => setPreviewPhoto(null)} 
          />
          
          <div className="fixed inset-4 z-[70] flex items-center justify-center p-4">
            <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
              <header className="flex items-center justify-between border-b p-4">
                <h4 className="truncate font-medium text-gray-900">
                  {previewPhoto.name}
                </h4>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </header>
              
              <div className="flex flex-grow items-center justify-center bg-gray-50 p-4">
                <Image
                  src={previewPhoto.url}
                  alt={previewPhoto.name}
                  width={800}
                  height={600}
                  className="max-h-[calc(100vh-12rem)] max-w-full object-contain"
                />
              </div>
              
              <footer className="flex items-center justify-between border-t p-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{previewPhoto.name}</p>
                  <p>{formatSize(previewPhoto.size)}</p>
                </div>
                <button
                  onClick={() => {
                    removePhoto(previewPhoto.id);
                    setPreviewPhoto(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </footer>
            </div>
          </div>
        </>
      )}
    </>
  );
};