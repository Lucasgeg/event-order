"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ClickableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function ClickableImage({
  src,
  alt,
  width,
  height,
  className,
}: ClickableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`relative group cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-cover rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg duration-300">
          <span className="sr-only">Agrandir l&apos;image</span>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
          >
            <X className="h-8 w-8" />
            <span className="sr-only">Fermer</span>
          </button>

          <div
            className="relative w-full max-w-7xl h-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
