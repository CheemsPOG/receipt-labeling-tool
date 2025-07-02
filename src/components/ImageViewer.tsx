import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ImageViewerProps {
  currentImage: File | undefined;
  currentImageIndex: number;
  selectedImages: File[];
  imageUrl: string | null;
  zoomLevel: number;
  pan: { x: number; y: number };
  dragging: boolean;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  navigateImage: (direction: "prev" | "next") => void;
  setZoomLevel: (level: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  currentImage,
  currentImageIndex,
  selectedImages,
  imageUrl,
  zoomLevel,
  pan,
  dragging,
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
  setZoomLevel,
  setPan,
}) => {
  // Double click handler for 2x zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!imageUrl) return;
    const container = e.currentTarget as HTMLDivElement;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    // The image is centered and scaled to 80% of the container
    const imgWidth = rect.width * 0.8;
    const imgHeight = rect.height * 0.8;
    const imgLeft = (rect.width - imgWidth) / 2;
    const imgTop = (rect.height - imgHeight) / 2;
    // If click is outside the image, do nothing
    if (
      clickX < imgLeft ||
      clickX > imgLeft + imgWidth ||
      clickY < imgTop ||
      clickY > imgTop + imgHeight
    ) {
      return;
    }
    // Click position relative to image center
    const relX = clickX - rect.width / 2;
    const relY = clickY - rect.height / 2;
    if (zoomLevel !== 2) {
      // After zoom, the clicked point should be at the center
      // Calculate the new pan so that (relX, relY) moves to (0,0) at 2x
      setZoomLevel(2);
      setPan({
        x: pan.x - relX,
        y: pan.y - relY,
      });
    } else {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    }
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center bg-muted rounded-lg mb-3 sm:mb-4 overflow-hidden min-h-[200px] sm:min-h-[300px]">
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            aspectRatio: "1/1",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            cursor:
              zoomLevel > 1 ? (dragging ? "grabbing" : "grab") : "default",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
          onDoubleClick={handleDoubleClick}
        >
          {imageUrl && currentImage && (
            <img
              src={imageUrl}
              alt={currentImage.name}
              className="object-contain select-none"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                maxWidth: "none",
                maxHeight: "none",
                width: "80%",
                height: "80%",
                transform: `translate(-50%, -50%) scale(${zoomLevel}) translate(${
                  pan.x / zoomLevel
                }px, ${pan.y / zoomLevel}px)`,
                transition: dragging ? "none" : "transform 0.2s",
                userSelect: "none",
              }}
              draggable={false}
            />
          )}
        </div>
      </div>
      {/* Zoom controls */}
      <div className="flex justify-center gap-2 mb-2 items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.2}
          title="Zoom Out"
        >
          -
        </Button>
        <span className="w-10 text-center select-none font-mono text-xs">
          {zoomLevel.toFixed(1)}x
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          title="Zoom In"
        >
          +
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetZoom}
          disabled={zoomLevel === 1.0}
          title="Reset Zoom"
        >
          1x
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {/* Navigation buttons */}
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateImage("prev")}
            disabled={currentImageIndex === 0}
            className="flex-1 max-w-[120px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateImage("next")}
            disabled={currentImageIndex === selectedImages.length - 1}
            className="flex-1 max-w-[120px]"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default ImageViewer;
