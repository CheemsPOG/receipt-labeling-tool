import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageViewer from "@/components/ImageViewer";
import BillForm from "@/components/BillForm";

const MainGrid = ({ imageViewerProps, billFormProps, children }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)]">
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-sm sm:text-base">
          Image Viewer
          {imageViewerProps.selectedImages.length > 0 && (
            <span className="text-xs sm:text-sm font-normal ml-2 block sm:inline">
              ({imageViewerProps.currentImageIndex + 1} of{" "}
              {imageViewerProps.selectedImages.length})
            </span>
          )}
        </CardTitle>
        {imageViewerProps.currentImage && (
          <div className="text-center mt-1">
            <span className="text-xs sm:text-sm text-muted-foreground break-all">
              {imageViewerProps.currentImage.name}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 sm:p-6">
        {imageViewerProps.imageUrl ? (
          <ImageViewer {...imageViewerProps} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground text-sm sm:text-base text-center">
              No image selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base">Bill Data</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-6 overflow-y-auto">
        <BillForm {...billFormProps}>{children}</BillForm>
      </CardContent>
    </Card>
  </div>
);

export default MainGrid;
