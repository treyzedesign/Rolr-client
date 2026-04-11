"use client";

import { X } from "lucide-react";

interface ImageViewerModalProps {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export function ImageViewerModal({ imageUrl, alt, onClose }: ImageViewerModalProps) {
  return (
    <div 
      className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white bg-opacity-20 backdrop-blur-sm text-white hover:bg-opacity-30 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
