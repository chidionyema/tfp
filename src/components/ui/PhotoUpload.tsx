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
  /** Controls whether the modal is visible */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when user confirms; always returns array (possibly empty) */
  onPhotosSelected: (photos: UploadedPhoto[]) => void;

  /* ------------------- Optional Props (with defaults) ------------------- */
  maxPhotos?: number;          // Maximum number of photos user can select (default: 5)
  maxSizePerPhoto?: number;    // Maximum size per photo in MB (default: 10)
  acceptedTypes?: string[];    // MIME types accepted (default: ["image/jpeg","image/jpg","image/png","image/webp"])
  title?: string;              // Modal title (default: "Upload Photos")
  description?: string;        // Modal description (default: "Add photos...")
  className?: string;          // Additional CSS classes for modal container
  required?: boolean;          // If true, at least one photo is required (default: false)
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
  /* ----------------------------------------------------------------------- */
  /*                             State & Refs                                */
  /* ----------------------------------------------------------------------- */
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<UploadedPhoto | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const titleId = useId();
  const descriptionId = useId();
  const previewTitleId = useId();

  /* ----------------------------------------------------------------------- */
  /*                        Feature Detection Helpers                        */
  /* ----------------------------------------------------------------------- */
  // Detect iOS (iPhone/iPad/iPod) for specialized fallback
  const isIOS: boolean =
  typeof window !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !("MSStream" in window);

  // Check for MediaDevices.getUserMedia support
  const canUseCameraAPI =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function";

  // Check if enumerateDevices is available
  const canEnumerateDevices =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.enumerateDevices === "function";

  /* ----------------------------------------------------------------------- */
  /*                   1️⃣ Unlock Camera & Enumerate Devices                 */
  /*    (Essential on iOS: enumerateDevices returns empty until permission)  */
  /* ----------------------------------------------------------------------- */
  const unlockCameraAndEnumerate = useCallback(async () => {
    // Step 1: Request a temporary basic stream (no constraints) to prompt permission.
    const basicStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    // Immediately stop all tracks to release camera for final usage.
    basicStream.getTracks().forEach((track) => track.stop());

    // Step 2: Enumerate devices now that user has granted permission.
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter((d) => d.kind === "videoinput");
    setAvailableCameras(cams);

    if (cams.length > 0) {
      // Prefer any camera whose label contains "back" or "environment"
      const backCamera = cams.find((c) =>
        /back|rear|environment/i.test(c.label)
      );
      setSelectedCameraId(backCamera ? backCamera.deviceId : cams[0].deviceId);
    }
  }, []);

  /* ----------------------------------------------------------------------- */
  /*                       2️⃣ Start Camera (Primary)                        */
  /*   - Uses two-stage approach: unlock → enumerate → final constraints     */
  /*   - Falls back to basic getUserMedia, then to <input capture> if needed */
  /* ----------------------------------------------------------------------- */
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsLoadingCamera(true);

    try {
      // If iOS or we have not yet enumerated cameras, run the "unlock" flow.
      if (isIOS || !canEnumerateDevices || availableCameras.length === 0) {
        try {
          await unlockCameraAndEnumerate();
        } catch (unlockErr) {
          // If unlocking or enumeration fails, fallback to file input.
          console.warn("unlockCameraAndEnumerate failed:", unlockErr);
          setCameraError("Cannot access camera. Falling back to file upload.");
          setIsLoadingCamera(false);
          // Brief delay for user to read error, then open file picker:
          setTimeout(() => {
            cameraInputRef.current?.click();
          }, 1000);
          return;
        }
      }

      // Build final constraints based on whether we have a deviceId
      let constraints: MediaStreamConstraints;
      if (selectedCameraId) {
        constraints = {
          video: { deviceId: { exact: selectedCameraId } },
          audio: false,
        };
      } else {
        constraints = {
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        };
      }

      // Attempt to open camera with final constraints
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintErr) {
        // If constraint (facingMode/deviceId) fails, fallback to basic video
        console.warn("getUserMedia with constraints failed:", constraintErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      // Set up <video> element source and play
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // On some browsers this play() may return a promise but is allowed after user click
        await videoRef.current.play().catch((e) => {
          console.warn("Video playback prevented:", e);
        });
      }

      setShowCamera(true);
      setIsLoadingCamera(false);
    } catch (err: unknown) {
      console.error("startCamera error:", err);
      setIsLoadingCamera(false);

      // Determine friendly error message, narrowing `err` to Error type if possible
      let message = "Unable to access camera. ";
      let errorName: string | undefined;

      if (err instanceof Error) {
        errorName = err.name;
      }

      if (errorName === "NotAllowedError" || errorName === "SecurityError") {
        message += "Please allow camera access and try again.";
      } else if (errorName === "NotFoundError") {
        message += "No camera found on this device.";
      } else {
        message += "Falling back to file upload.";
      }
      setCameraError(message);

      // After brief delay, trigger fallback to file input
      setTimeout(() => {
        cameraInputRef.current?.click();
      }, 1500);
    }
  }, [
    isIOS,
    availableCameras,
    selectedCameraId,
    unlockCameraAndEnumerate,
    canEnumerateDevices,
  ]);

  /* ----------------------------------------------------------------------- */
  /*                            3️⃣ Stop Camera                               */
  /* ----------------------------------------------------------------------- */
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraError(null);
  }, [stream]);

  /* ----------------------------------------------------------------------- */
  /*                           4️⃣ Capture Photo                              */
  /* ----------------------------------------------------------------------- */
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    const ctx = canvasEl.getContext("2d");
    if (!ctx || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) return;

    // Draw current video frame to canvas
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0);

    // Convert canvas to Blob → File
    canvasEl.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newPhoto: UploadedPhoto = {
          id,
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        };

        setPhotos((prev) => {
          // Enforce maxPhotos limit
          const combined = [...prev, newPhoto];
          return combined.slice(0, maxPhotos);
        });

        // Clean up and close camera once captured
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }, [maxPhotos, stopCamera]);

  /* ----------------------------------------------------------------------- */
  /*                       5️⃣ Switch Between Cameras                         */
  /*       (Cycles through availableCameras; only after enumeration)         */
  /* ----------------------------------------------------------------------- */
  const switchCamera = useCallback(() => {
    if (availableCameras.length < 2) {
      // No multiple cameras detected (or older device). Do nothing or toggle facingMode logic here.
      return;
    }
    const idx = availableCameras.findIndex((c) => c.deviceId === selectedCameraId);
    const nextIdx = (idx + 1) % availableCameras.length;
    setSelectedCameraId(availableCameras[nextIdx].deviceId);

    // Restart camera with new deviceId
    if (stream) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [availableCameras, selectedCameraId, stream, stopCamera, startCamera]);

  /* ----------------------------------------------------------------------- */
  /*                        6️⃣ Handle File Uploads                           */
  /* ----------------------------------------------------------------------- */
  const handleFiles = useCallback(
    (files: FileList) => {
      const newPhotos: UploadedPhoto[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        // 1. Check max count
        if (photos.length + newPhotos.length >= maxPhotos) {
          if (!errors.includes(`Maximum ${maxPhotos} photos allowed.`)) {
            errors.push(`Maximum ${maxPhotos} photos allowed.`);
          }
          return;
        }
        // 2. Check MIME type
        if (!acceptedTypes.includes(file.type)) {
          errors.push(
            `${file.name}: Invalid type. Accept ${acceptedTypes
              .map((t) => t.split("/")[1].toUpperCase())
              .join(", ")}.`
          );
          return;
        }
        // 3. Check file size
        if (file.size > maxSizePerPhoto * 1024 * 1024) {
          errors.push(`${file.name}: too large (max ${maxSizePerPhoto} MB).`);
          return;
        }

        // If valid, create UploadedPhoto
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        newPhotos.push({
          id,
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      });

      // Show any errors in a single alert
      if (errors.length) {
        window.alert(errors.join("\n"));
      }
      // Append new photos (enforcing maxPhotos)
      if (newPhotos.length) {
        setPhotos((prev) => {
          const combined = [...prev, ...newPhotos];
          return combined.slice(0, maxPhotos);
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
      // Reset input so same file can be selected again if needed
      e.target.value = "";
    },
    [handleFiles]
  );

  /* ----------------------------------------------------------------------- */
  /*                     7️⃣ Drag & Drop Handlers                             */
  /* ----------------------------------------------------------------------- */
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
  const handleDragEvent = useCallback(
    (e: React.DragEvent, active: boolean) => {
      e.preventDefault();
      setDragActive(active);
    },
    []
  );

  /* ----------------------------------------------------------------------- */
  /*                         8️⃣ Remove a Photo                                */
  /* ----------------------------------------------------------------------- */
  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const toRemove = prev.find((ph) => ph.id === id);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.url);
      }
      return prev.filter((ph) => ph.id !== id);
    });
  }, []);

  /* ----------------------------------------------------------------------- */
  /*                     9️⃣ Cleanup & Close Modal                             */
  /* ----------------------------------------------------------------------- */
  const cleanupAndClose = useCallback(() => {
    // Revoke all object URLs to free memory
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setPreviewPhoto(null);
    stopCamera();
    onClose();
  }, [photos, onClose, stopCamera]);

  /* ----------------------------------------------------------------------- */
  /*                       🔟 Confirm Selection                                */
  /* ----------------------------------------------------------------------- */
  const handleConfirm = useCallback(() => {
    onPhotosSelected(photos);
    // Cleanup after passing to parent
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setPreviewPhoto(null);
    stopCamera();
    onClose();
  }, [onPhotosSelected, photos, onClose, stopCamera]);

  /* ----------------------------------------------------------------------- */
  /*                  ⏎ Keyboard Handling (Escape to close)                   */
  /* ----------------------------------------------------------------------- */
  useEffect(() => {
    const handleKey = (ev: KeyboardEvent) => {
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
      document.addEventListener("keydown", handleKey);
      modalContentRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, previewPhoto, showCamera, cleanupAndClose, stopCamera]);

  /* ----------------------------------------------------------------------- */
  /*                    🛑 Cleanup on Unmount                                  */
  /* ----------------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [stream, photos]);

  /* ----------------------------------------------------------------------- */
  /*                        Utility: Format File Size                          */
  /* ----------------------------------------------------------------------- */
  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizes = ["Bytes", "KB", "MB", "GB"];
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  /* ----------------------------------------------------------------------- */
  /*                         Early Exit if Closed                             */
  /* ----------------------------------------------------------------------- */
  if (!isOpen) return null;

  /* ----------------------------------------------------------------------- */
  /*                        Derived UI State                                   */
  /* ----------------------------------------------------------------------- */
  const hasPhotos = photos.length > 0;
  const shouldDisableButton = required && !hasPhotos;
  let buttonText: string;
  let buttonColor: string;

  if (!hasPhotos) {
    if (required) {
      buttonText = "Please add at least one photo";
      buttonColor = "bg-gray-400 cursor-not-allowed";
    } else {
      buttonText = "Continue without photos";
      buttonColor = "bg-indigo-600 hover:bg-indigo-700";
    }
  } else {
    buttonText = `Continue with ${photos.length} photo${
      photos.length === 1 ? "" : "s"
    }`;
    buttonColor = "bg-indigo-600 hover:bg-indigo-700";
  }

  /* ----------------------------------------------------------------------- */
  /*                          Render: JSX                                      */
  /* ----------------------------------------------------------------------- */
  return (
    <>
      {/* Backdrop: closes modal on click */}
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
                  You can skip this step if you don’t have photos to add.
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

        {/* Camera Error Alert */}
        {cameraError && (
          <div className="mx-4 mt-4 rounded-lg bg-red-50 p-4" role="alert">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Camera Error
                </h3>
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
                : "Drag & drop files here or use the buttons below (optional)"}
            </p>

            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              {/* Choose from Files Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= maxPhotos}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <Upload size={16} />
                Choose Files
              </button>

              {/* Take Photo Button */}
              <button
                type="button"
                onClick={() => {
                  if (canUseCameraAPI) {
                    startCamera();
                  } else {
                    // If camera API not available, open file input with capture
                    cameraInputRef.current?.click();
                  }
                }}
                disabled={photos.length >= maxPhotos || isLoadingCamera}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <Camera size={16} />
                {isLoadingCamera ? "Opening Camera..." : "Take Photo"}
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Accepts{" "}
              {acceptedTypes
                .map((t) => t.split("/")[1].toUpperCase())
                .join(", ")}{" "}
              up to {maxSizePerPhoto} MB each. Max {maxPhotos} photo
              {maxPhotos > 1 ? "s" : ""}.
            </p>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileInput}
            className="hidden"
          />

          {/* iOS & Android-friendly Capture Fallback */}
          {isIOS ? (
            // iOS-specific syntax to prompt camera directly
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*;capture=camera"
              capture
              onChange={handleFileInput}
              className="hidden"
            />
          ) : (
            // Other mobile browsers: specify environment camera if supported
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              className="hidden"
            />
          )}
        </div>

        {/* Selected Photo Thumbnails */}
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

                  {/* Hover Mask with Preview & Delete */}
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

                  {/* File Name & Size Caption */}
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

        {/* Footer Buttons */}
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

      {/* Camera Overlay Modal */}
      {showCamera && (
        <>
          {/* Semi-transparent backdrop to close camera on outside click */}
          <div
            className="fixed inset-0 z-[60] bg-black/75"
            onClick={stopCamera}
          />

          {/* Camera Preview Container */}
          <div className="fixed inset-4 z-[70] flex items-center justify-center p-4">
            <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-black shadow-xl">
              {/* Camera Header: Title + Switch/Close Buttons */}
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

              {/* Live Video Preview */}
              <div className="relative flex-grow">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label="Live camera preview"
                  className="h-full w-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Loading Spinner While Camera Wakes Up */}
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

              {/* Capture Button */}
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

      {/* Image Preview Modal */}
      {previewPhoto && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/75"
            onClick={() => setPreviewPhoto(null)}
          />
          {/* Preview Container */}
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
