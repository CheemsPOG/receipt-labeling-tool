import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen } from "lucide-react";

const FileControls = ({
  onFolderSelect,
  onJsonImport,
  onJsonImportClick,
  fileInputRef,
  jsonInputRef,
}) => (
  <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
    <Button
      onClick={() => fileInputRef.current?.click()}
      className="flex-1 sm:flex-none"
    >
      <FolderOpen className="w-4 h-4 mr-2" />
      Select Image Folder
    </Button>
    <Button
      onClick={
        onJsonImportClick
          ? onJsonImportClick
          : () => jsonInputRef.current?.click()
      }
      variant="outline"
      className="flex-1 sm:flex-none"
    >
      <Upload className="w-4 h-4 mr-2" />
      Import JSON
    </Button>
    <input
      ref={fileInputRef}
      type="file"
      {...({ webkitdirectory: "", directory: "" } as any)}
      multiple
      onChange={onFolderSelect}
      className="hidden"
    />
    <input
      ref={jsonInputRef}
      type="file"
      accept="application/json,.json"
      onChange={onJsonImport}
      className="hidden"
    />
  </div>
);

export default FileControls;
