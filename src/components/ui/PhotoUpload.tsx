// File: src/components/ui/PhotoUpload.tsx
// Purpose: Photo picker with drag‑drop, camera capture & preview.
// NOTE: Now supports optional/required mode and lets the user skip the step
//       when photos are not mandatory.

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
  /** Controls the modal's visibility */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Called when the user confirms (receives even an empty array on skip) */
  onPhotosSelected: (photos: UploadedPhoto[]) => void;

  /* ---------------------------- Optional props --------------------------- */
  maxPhotos?: number;          // default 5
  maxSizePerPhoto?: number;    // MB – default 10
  acceptedTypes?: string[];    // default jpeg|jpg|png|webp
  title?: string;
  description?: string;
  className?: string;
  /** If true at least one photo is required before continuing (default false) */
  required?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  /* required props */
  isOpen,
  onClose,
  onPhotosSelected,

  /* optional props with defaults */
  maxPhotos = 5,
  maxSizePerPhoto = 10,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  title = "Upload Photos",
  description = "Add photos to support your task or show proof of completion",
  className = "",
  required = false,
}) => {
  /* -------------------------------------------------------------------- */
  /*  State & refs                                                        */
  /* -------------------------------------------------------------------- */
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<UploadedPhoto | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);   // gallery / files
  const cameraInputRef = useRef<HTMLInputElement>(null); // live capture
  const modalContentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const titleId = useId();
  const descriptionId = useId();
  const previewTitleId = useId();

  /* -------------------------------------------------------------------- */
  /*  Camera Detection & Enumeration                                      */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    const detectCameras = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        
        // Set default camera
        if (cameras.length > 0 && !selectedCameraId) {
          setSelectedCameraId(cameras[0].deviceId);
        }
      } catch (err) {
        console.error("Failed to enumerate devices:", err);
      }
    };

    detectCameras();
  }, [selectedCameraId]);

  /* -------------------------------------------------------------------- */
  /*  Camera Functions                                                    */
  /* -------------------------------------------------------------------- */
  const startCamera = useCallback(async () => {
    setIsLoadingCamera(true);
    setCameraError(null);
    
    try {
      /* -------------------------------------------------------------- */
      /* 1️⃣  Early‑out if permission is already denied                  */
      /* -------------------------------------------------------------- */
      const permState: PermissionState | "prompt" = await (async () => {
        if (!('permissions' in navigator)) return "prompt";
        try {
          const status = await navigator.permissions.query({ name: "camera" as PermissionName });
          return status.state; // "granted" | "denied" | "prompt"
        } catch {
          return "prompt";
        }
      })();

      if (permState === "denied") {
        setCameraError(
          "Your browser has blocked camera access for this site. Enable it in the site settings or choose Upload instead."
        );
        setIsLoadingCamera(false);
        return;
      }

      // Check if we're on a device that supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported");
      }

      /* -------------------------------------------------------------- */
      /* 2️⃣  Trigger permission prompt (only when no cameras cached)    */
      /* -------------------------------------------------------------- */
      if (availableCameras.length === 0) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
          testStream.getTracks().forEach(track => track.stop());
        } catch (permissionError) {
          // Rethrow so we fall into the outer catch and show banner
          throw permissionError;
        }
      }

      let constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: facingMode,
        }
      };

      // If we have a specific camera selected, use it
      if (selectedCameraId && selectedCameraId !== 'default') {
        constraints = {
          audio: false,
          video: {
            deviceId: { exact: selectedCameraId }
          }
        };
      }

      let mediaStream: MediaStream;
      
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to basic video constraints
        console.warn("Failed with specific constraints, trying basic video", err);
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: false, 
          video: true 
        });
      }
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
        videoRef.current.play().catch(e => {
          console.error("Video play failed:", e);
        });
      }
      setShowCamera(true);
      setIsLoadingCamera(false);
    } catch (err: unknown) {
      /* -------------------------------------------------------------- */
      /* 3️⃣  Handle any error and show friendly message                 */
      /* -------------------------------------------------------------- */
      const error = err as Error;
      
      if (process.env.NODE_ENV === "development") {
        console.error("Camera access error:", err);
      } else {
        // Use debug so Next.js overlay stays hidden in production
        console.debug("Camera access error:", err);
      }
      setIsLoadingCamera(false);
      
      let errorMessage = "Unable to access camera. ";
      
      if (error.name === 'NotAllowedError' || error.message?.includes('permission')) {
        errorMessage += "Please allow camera access and try again.";
      } else if (error.name === 'NotFoundError' || error.message?.includes('not found')) {
        errorMessage += "No camera found. Please use file upload instead.";
      } else if (error.name === 'NotReadableError') {
        errorMessage += "Camera is being used by another application.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += "Camera settings not supported. Trying default camera...";
        // Try once more with no constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          setShowCamera(true);
          setIsLoadingCamera(false);
          return;
        } catch {
          errorMessage = "Unable to access any camera. Please use file upload.";
        }
      } else {
        errorMessage += "Please use file upload instead.";
      }
      
      setCameraError(errorMessage);
      
      // Automatically fallback to file input after showing error
      setTimeout(() => {
        setCameraError(null);
        cameraInputRef.current?.click();
      }, 3000);
    }
  }, [facingMode, selectedCameraId, availableCameras.length]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraError(null);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const newPhoto: UploadedPhoto = {
              id,
              file,
              url: URL.createObjectURL(file),
              name: file.name,
              size: file.size,
            };
            
            setPhotos(prev => [...prev, newPhoto].slice(0, maxPhotos));
            stopCamera();
          }
        }, "image/jpeg", 0.9);
      }
    }
  }, [maxPhotos, stopCamera]);

  const switchCamera = useCallback(() => {
    if (availableCameras.length > 1) {
      const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setSelectedCameraId(availableCameras[nextIndex].deviceId);
      
      // Restart camera with new device
      if (stream) {
        stopCamera();
        setTimeout(() => {
          startCamera();
        }, 100);
      }
    } else {
      // Fallback to switching facing mode
      setFacingMode(prev => prev === "user" ? "environment" : "user");
      if (stream) {
        stopCamera();
        setTimeout(() => {
          startCamera();
        }, 100);
      }
    }
  }, [availableCameras, selectedCameraId, stream, stopCamera, startCamera]);

  /* -------------------------------------------------------------------- */
  /*  File Handling Functions                                             */
  /* -------------------------------------------------------------------- */
  const handleFiles = useCallback(
    (files: FileList) => {
      const newPhotos: UploadedPhoto[] = [];
      const errs: string[] = [];

      Array.from(files).forEach((file) => {
        if (photos.length + newPhotos.length >= maxPhotos) {
          if (!errs.includes(`Maximum ${maxPhotos} photos allowed.`))
            errs.push(`Maximum ${maxPhotos} photos allowed.`);
          return;
        }
        if (!acceptedTypes.includes(file.type)) {
          errs.push(
            `${file.name}: Invalid type. Accept ${acceptedTypes
              .map((t) => t.split("/")[1].toUpperCase())
              .join(", ")}`
          );
          return;
        }
        if (file.size > maxSizePerPhoto * 1024 * 1024) {
          errs.push(`${file.name}: too large (max ${maxSizePerPhoto} MB).`);
          return;
        }
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        newPhotos.push({
          id,
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      });

      if (errs.length) alert(errs.join("\n"));
      if (newPhotos.length)
        setPhotos((p) => [...p, ...newPhotos].slice(0, maxPhotos));
    },
    [acceptedTypes, maxPhotos, maxSizePerPhoto, photos.length]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragEvent = useCallback(
    (e: React.DragEvent, active: boolean) => {
      e.preventDefault();
      setDragActive(active);
    },
    []
  );

  const removePhoto = useCallback((id: string) => {
    setPhotos((p) => {
      const doomed = p.find((ph) => ph.id === id);
      if (doomed) URL.revokeObjectURL(doomed.url);
      return p.filter((ph) => ph.id !== id);
    });
  }, []);

  const cleanupAndClose = useCallback(() => {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setPreviewPhoto(null);
    stopCamera();
    onClose();
  }, [photos, onClose, stopCamera]);

  const handleConfirm = useCallback(() => {
    onPhotosSelected(photos);
    
    // Clean up and close
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setPreviewPhoto(null);
    stopCamera();
    onClose();
  }, [onPhotosSelected, photos, onClose, stopCamera]);

  /* Escape key to close */
  useEffect(() => {
    const h = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
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
      document.addEventListener("keydown", h);
      modalContentRef.current?.focus();
    }
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, previewPhoto, showCamera, cleanupAndClose, stopCamera]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const formatSize = (b: number) => {
    if (!b) return "0 Bytes";
    const k = 1024,
      i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(2)} ${["Bytes", "KB", "MB"][i]}`;
  };

  /* -------------------------------------------------------------------- */
  /*  Early-exit when closed                                              */
  /* -------------------------------------------------------------------- */
  if (!isOpen) return null;

  /* -------------------------------------------------------------------- */
  /*  Derived values                                                      */
  /* -------------------------------------------------------------------- */
  const hasPhotos = photos.length > 0;
  const shouldDisableButton = required && !hasPhotos;
  
  let buttonText = "";
  let buttonColor = "";
  
  if (!hasPhotos) {
    if (required) {
      buttonText = "Please add at least one photo";
      buttonColor = "bg-gray-400 cursor-not-allowed";
    } else {
      buttonText = "Continue without photos";
      buttonColor = "bg-indigo-600 hover:bg-indigo-700";
    }
  } else {
    buttonText = `Continue with ${photos.length} photo${photos.length === 1 ? "" : "s"}`;
    buttonColor = "bg-indigo-600 hover:bg-indigo-700";
  }

  /* -------------------------------------------------------------------- */
  /*  UI                                                                  */
  /* -------------------------------------------------------------------- */
  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={cleanupAndClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div
        ref={modalContentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={`fixed inset-x-4 top-10 z-50 mx-auto max-w-2xl flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-lg bg-white shadow-xl ${className}`}
      >
        {/* header */}
        <header className="flex items-center justify-between border-b bg-gray-50 p-4">
          <div>
            <h3
              id={titleId}
              className="flex items-center gap-2 font-semibold text-gray-900"
            >
              <Camera size={20} className="text-indigo-600" />
              {title}
              {!required && (
                <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Optional
                </span>
              )}
              {required && (
                <span className="ml-2 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                  Required
                </span>
              )}
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
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X size={20} />
          </button>
        </header>

        {/* Camera error alert */}
        {cameraError && (
          <div className="mx-4 mt-4 rounded-lg bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Camera Error</h3>
                <p className="mt-1 text-sm text-red-700">{cameraError}</p>
              </div>
            </div>
          </div>
        )}

        {/* drop zone */}
        <div className="flex-grow overflow-y-auto p-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => handleDragEvent(e, true)}
            onDragLeave={(e) => handleDragEvent(e, false)}
            onDragEnter={(e) => handleDragEvent(e, true)}
            aria-dropeffect="copy"
            aria-disabled={photos.length >= maxPhotos}
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
                : "border-gray-300 hover:border-gray-400"
            } ${
              photos.length >= maxPhotos
                ? "cursor-not-allowed opacity-50"
                : "cursor-copy"
            }`}
          >
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
            <h4 className="mb-2 text-lg font-medium text-gray-900">
              {photos.length >= maxPhotos
                ? `Maximum ${maxPhotos} photos reached`
                : "Upload Photos"}
            </h4>
            <p className="mb-4 text-gray-600">
              {required 
                ? "At least one photo is required to continue" 
                : "Drag & drop files here or use the buttons below (completely optional)"
              }
            </p>

            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= maxPhotos}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <Upload size={16} />
                Choose Files
              </button>

              <button
                type="button"
                onClick={startCamera}
                disabled={photos.length >= maxPhotos || isLoadingCamera}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <Camera size={16} />
                {isLoadingCamera ? "Opening Camera..." : "Take Photo"}
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              {acceptedTypes
                .map((t) => t.split("/")[1].toUpperCase())
                .join(", ")} {" "}
              up to {maxSizePerPhoto} MB. Max {maxPhotos}.
            </p>
          </div>

          {/* hidden inputs */}
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

        {/* thumbnails */}
        {photos.length > 0 && (
          <div className="flex-shrink-0 px-4 pb-4">
            <h4 className="mb-3 font-medium text-gray-900">
              Selected Photos ({photos.length}/{maxPhotos})
            </h4>
            <div className="grid max-h-60 grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((ph) => (
                <div key={ph.id} className="group relative">
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                    <Image
                      src={ph.url}
                      alt={ph.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* hover mask */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-opacity group-hover:bg-black/30">
                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setPreviewPhoto(ph)}
                        aria-label={`Preview ${ph.name}`}
                        className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <Eye size={18} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => removePhoto(ph.id)}
                        aria-label={`Remove ${ph.name}`}
                        className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* caption */}
                  <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="truncate text-xs text-white" title={ph.name}>
                      {ph.name}
                    </p>
                    <p className="text-xs text-gray-200">
                      {formatSize(ph.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* footer */}
        <footer className="flex flex-shrink-0 gap-3 border-t bg-white p-4">
          <button
            onClick={cleanupAndClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={shouldDisableButton}
            className={`flex-1 rounded-lg px-4 py-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              shouldDisableButton
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : buttonColor
            }`}
          >
            {buttonText}
          </button>
        </footer>
      </div>

      {/* Camera modal */}
      {showCamera && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/75"
            onClick={stopCamera}
          />
          <div className="fixed inset-4 z-[70] flex items-center justify-center p-4">
            <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-black shadow-xl">
              <header className="flex flex-shrink-0 items-center justify-between bg-gray-900 p-4">
                <h4 className="font-medium text-white">Take Photo</h4>
                <div className="flex items-center gap-2">
                  {availableCameras.length > 1 && (
                    <button
                      onClick={switchCamera}
                      className="rounded-full p-2 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Switch camera"
                    >
                      <SwitchCamera size={20} />
                    </button>
                  )}
                  <button
                    onClick={stopCamera}
                    className="rounded-full p-2 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Close camera"
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
                
                {/* Loading indicator */}
                {isLoadingCamera && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="rounded-lg bg-white p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                        <span className="text-gray-700">Loading camera...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <footer className="flex-shrink-0 bg-gray-900 p-4">
                <button
                  onClick={capturePhoto}
                  disabled={isLoadingCamera}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white disabled:opacity-50"
                  aria-label="Capture photo"
                >
                  <div className="h-14 w-14 rounded-full bg-red-500" />
                </button>
              </footer>
            </div>
          </div>
        </>
      )}

      {/* image preview modal */}
      {previewPhoto && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/75"
            onClick={() => setPreviewPhoto(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={previewTitleId}
            className="fixed inset-4 z-[70] flex items-center justify-center p-4"
          >
            <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
              <header className="flex flex-shrink-0 items-center justify-between border-b p-4">
                <h4
                  id={previewTitleId}
                  className="truncate font-medium text-gray-900"
                  title={previewPhoto.name}
                >
                  {previewPhoto.name}
                </h4>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </header>
              <div className="flex flex-grow items-center justify-center bg-gray-50 p-4">
                <div className="relative max-h-full max-w-full">
                  <Image
                    src={previewPhoto.url}
                    alt={previewPhoto.name}
                    width={800}
                    height={600}
                    className="max-h-[calc(100vh-12rem)] max-w-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
              <footer className="flex flex-shrink-0 items-center justify-between border-t p-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{previewPhoto.name}</p>
                  <p>{formatSize(previewPhoto.size)}</p>
                </div>
                <button
                  onClick={() => removePhoto(previewPhoto.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trash2 size={16} />
                  Remove Photo
                </button>
              </footer>
            </div>
          </div>
        </>
      )}
    </>
  );
};