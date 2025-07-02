import React, { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useImageViewer } from "@/hooks/useImageViewer";
import { useBillManager } from "@/hooks/useBillManager";
import FileControls from "@/components/FileControls";
import MainGrid from "@/components/MainGrid";
import AddedBillsList from "@/components/AddedBillsList";
import { Trash2 } from "lucide-react";

const Index = () => {
  const {
    selectedImages,
    setSelectedImages,
    currentImageIndex,
    setCurrentImageIndex,
    currentImage,
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
  } = useImageViewer();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    billData,
    setBillData,
    savedData,
    setSavedData,
    selectedEntryIndex,
    setSelectedEntryIndex,
    handleAddBill,
    handleSaveBill,
    handleSelectEntry,
    handleSaveAllBills,
  } = useBillManager(selectedImages, setCurrentImageIndex, toast);

  // Track the imported file handle for overwriting
  const [importedFileHandle, setImportedFileHandle] =
    useState<FileSystemFileHandle | null>(null);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);

  // Restore imported file name and images from sessionStorage on mount
  React.useEffect(() => {
    const storedFileName = sessionStorage.getItem(
      "receipt_labeling_importedFileName"
    );
    if (storedFileName) setImportedFileName(storedFileName);
    // Restore images
    const storedImages = sessionStorage.getItem(
      "receipt_labeling_selectedImages"
    );
    if (storedImages) {
      try {
        const arr = JSON.parse(storedImages);
        if (Array.isArray(arr)) {
          // Reconstruct File objects from dataUrls
          const files = arr.map(({ name, dataUrl }) => {
            const arr = dataUrl.split(",");
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            return new File([u8arr], name, { type: mime });
          });
          setSelectedImages(files);
          setCurrentImageIndex(0);
        }
      } catch {}
    }
  }, []);

  // Persist imported file name to sessionStorage
  React.useEffect(() => {
    if (importedFileName) {
      sessionStorage.setItem(
        "receipt_labeling_importedFileName",
        importedFileName
      );
    } else {
      sessionStorage.removeItem("receipt_labeling_importedFileName");
    }
  }, [importedFileName]);

  // Persist selected images to sessionStorage
  React.useEffect(() => {
    if (selectedImages.length > 0) {
      // Read all images as dataUrl and store
      Promise.all(
        selectedImages.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) =>
                resolve({ name: file.name, dataUrl: e.target.result });
              reader.readAsDataURL(file);
            })
        )
      ).then((arr) => {
        sessionStorage.setItem(
          "receipt_labeling_selectedImages",
          JSON.stringify(arr)
        );
      });
    } else {
      sessionStorage.removeItem("receipt_labeling_selectedImages");
    }
  }, [selectedImages]);

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)
    );
    if (imageFiles.length > 0) {
      setSelectedImages(imageFiles);
      setCurrentImageIndex(0);
      setBillData({
        merchant: "",
        receiptDate: "",
        totalPayment: 0,
        totalQuantity: 0,
        items: [
          { sku: "", name: "", quantity: 0, unitPrice: 0, totalPrice: 0 },
        ],
      });
    } else {
      toast({
        title: "No images found",
        description: "Please select a folder containing image files.",
        variant: "destructive",
      });
    }
  };

  // Modified import logic to use File System Access API if available
  const handleJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImportedFileHandle(null); // No file handle for fallback
    setImportedFileName(file ? file.name : null);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          if (
            jsonData.successful_results &&
            Array.isArray(jsonData.successful_results)
          ) {
            setSavedData(jsonData.successful_results);
            setSelectedEntryIndex(null);
            toast({
              title: "Data imported",
              description: `Successfully imported ${jsonData.successful_results.length} entries.`,
            });
          } else if (Array.isArray(jsonData)) {
            setSavedData(jsonData);
            setSelectedEntryIndex(null);
            toast({
              title: "Data imported",
              description: `Successfully imported ${jsonData.length} entries.`,
            });
          } else {
            throw new Error("Invalid JSON format");
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Please select a valid JSON file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  // Handler for Import JSON button click
  const handleJsonImportClick = async () => {
    if ((window as any).showOpenFilePicker) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: "JSON files",
              accept: { "application/json": [".json"] },
            },
          ],
          excludeAcceptAllOption: true,
          multiple: false,
        });
        setImportedFileHandle(handle);
        setImportedFileName(handle.name);
        const file = await handle.getFile();
        const text = await file.text();
        try {
          const jsonData = JSON.parse(text);
          if (
            jsonData.successful_results &&
            Array.isArray(jsonData.successful_results)
          ) {
            setSavedData(jsonData.successful_results);
            setSelectedEntryIndex(null);
            toast({
              title: "Data imported",
              description: `Successfully imported ${jsonData.successful_results.length} entries.`,
            });
          } else if (Array.isArray(jsonData)) {
            setSavedData(jsonData);
            setSelectedEntryIndex(null);
            toast({
              title: "Data imported",
              description: `Successfully imported ${jsonData.length} entries.`,
            });
          } else {
            throw new Error("Invalid JSON format");
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Please select a valid JSON file.",
            variant: "destructive",
          });
        }
      } catch (e) {
        // User cancelled or not supported, do nothing
      }
    } else {
      // Fallback to file input
      jsonInputRef.current?.click();
    }
  };

  // Modified save logic to overwrite imported file if possible
  const handleSaveAllBillsOverwrite = async () => {
    if (savedData.length === 0) {
      toast({
        title: "No bills to save",
        description: "Please add at least one bill before saving.",
        variant: "destructive",
      });
      return;
    }
    const exportData = { successful_results: savedData };
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    if (importedFileHandle) {
      try {
        const writable = await importedFileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast({
          title: "File overwritten",
          description: "Changes saved to the imported file.",
        });
      } catch (error) {
        toast({
          title: "Save failed",
          description:
            "Could not overwrite the imported file. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // fallback to the default export logic
      handleSaveAllBills();
    }
  };

  // Add handler to remove imported file
  const handleRemoveImportedFile = () => {
    setImportedFileHandle(null);
    setImportedFileName(null);
    sessionStorage.removeItem("receipt_labeling_importedFileName");
    // Optionally clear savedData if you want a fresh start:
    // setSavedData([]);
    toast({
      title: "Imported file removed",
      description: "You can now import or create a new JSON file.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      {(importedFileHandle || importedFileName) && (
        <div className="mb-2 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="font-semibold text-foreground bg-muted px-2 py-1 rounded border border-border">
            Imported JSON file:
          </span>
          <span className="font-mono bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700 px-2 py-1 rounded">
            {importedFileHandle?.name || importedFileName}
          </span>
          {importedFileHandle && (
            <span className="ml-2 px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200 text-xs font-semibold">
              Will overwrite this file on Save
            </span>
          )}
          {/* Remove imported file button */}
          <button
            type="button"
            onClick={handleRemoveImportedFile}
            className="ml-2 flex items-center gap-1 px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
            title="Remove imported file"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        </div>
      )}
      <FileControls
        onFolderSelect={handleFolderSelect}
        onJsonImport={handleJsonImport}
        onJsonImportClick={handleJsonImportClick}
        fileInputRef={fileInputRef}
        jsonInputRef={jsonInputRef}
      />
      <MainGrid
        imageViewerProps={{
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
        }}
        billFormProps={{
          billData,
          setBillData,
          handleAddBill: () => handleAddBill(currentImage),
          handleSaveAllBills: handleSaveAllBillsOverwrite, // use the new save logic
          handleSaveBill: () => handleSaveBill(currentImage),
          currentImage,
          savedData,
          importedFileHandle, // pass for UI
          importedFileName, // pass for UI
        }}
      >
        <AddedBillsList
          savedData={savedData}
          selectedEntryIndex={selectedEntryIndex}
          onSelectEntry={handleSelectEntry}
          onRemoveEntry={(idx) => {
            setSavedData((prev) => prev.filter((_, i) => i !== idx));
            if (selectedEntryIndex === idx) setSelectedEntryIndex(null);
          }}
          onDeleteAll={() => {
            setSavedData([]);
            setSelectedEntryIndex(null);
          }}
        />
      </MainGrid>
    </div>
  );
};

export default Index;
