import { useState, useEffect, useRef } from "react";

export function useImageViewer() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const currentImage = selectedImages[currentImageIndex];
  const imageUrl = currentImage ? URL.createObjectURL(currentImage) : null;

  // Reset pan when image or zoom resets
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [currentImageIndex, imageUrl]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.2));
  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel === 1) return;
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !lastPos) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => {
    setDragging(false);
    setLastPos(null);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel === 1) return;
    const touch = e.touches[0];
    setDragging(true);
    setLastPos({ x: touch.clientX, y: touch.clientY });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !lastPos) return;
    const touch = e.touches[0];
    const dx = touch.clientX - lastPos.x;
    const dy = touch.clientY - lastPos.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    setLastPos({ x: touch.clientX, y: touch.clientY });
  };
  const handleTouchEnd = () => {
    setDragging(false);
    setLastPos(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImages.length === 0) return;
    if (direction === "prev" && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (
      direction === "next" &&
      currentImageIndex < selectedImages.length - 1
    ) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return {
    selectedImages,
    setSelectedImages,
    currentImageIndex,
    setCurrentImageIndex,
    currentImage,
    imageUrl,
    zoomLevel,
    setZoomLevel,
    pan,
    setPan,
    dragging,
    setDragging,
    lastPos,
    setLastPos,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    navigateImage,
  };
}
