import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X as XIcon } from "lucide-react";

interface AddedBillsListProps {
  savedData: any[];
  selectedEntryIndex: number | null;
  onSelectEntry: (index: number) => void;
  onRemoveEntry: (index: number) => void;
  onDeleteAll: () => void;
}

const BILLS_PER_PAGE = 10;

const AddedBillsList: React.FC<AddedBillsListProps> = ({
  savedData,
  selectedEntryIndex,
  onSelectEntry,
  onRemoveEntry,
  onDeleteAll,
}) => {
  const [page, setPage] = useState(0);
  if (savedData.length === 0) return null;
  const totalPages = Math.ceil(savedData.length / BILLS_PER_PAGE);
  const startIdx = page * BILLS_PER_PAGE;
  const endIdx = startIdx + BILLS_PER_PAGE;
  const pageBills = savedData.slice(startIdx, endIdx);

  return (
    <div className="mb-4">
      <div className="font-semibold text-xs mb-2 text-muted-foreground">
        Added Bills
      </div>
      <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
        {pageBills.map((entry, idx) => {
          const globalIdx = startIdx + idx;
          return (
            <div key={globalIdx} className="flex items-center">
              <button
                type="button"
                className={`flex-1 text-left rounded px-2 py-1 text-xs border transition-colors ${
                  selectedEntryIndex === globalIdx
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-accent border-border"
                }`}
                onClick={() => onSelectEntry(globalIdx)}
              >
                <div className="font-medium truncate">
                  <span className="mr-2 text-muted-foreground">
                    {globalIdx + 1}.
                  </span>
                  {entry.image_filename ||
                    entry.imageName ||
                    `Entry #${globalIdx + 1}`}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {entry.timestamp
                    ? new Date(entry.timestamp).toLocaleString()
                    : ""}
                </div>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-1 text-destructive hover:bg-destructive/10"
                onClick={() => onRemoveEntry(globalIdx)}
                aria-label="Remove bill"
              >
                <XIcon className="w-3 h-3" />
              </Button>
            </div>
          );
        })}
      </div>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Prev
          </Button>
          <span className="text-xs">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
      {/* Delete All button */}
      <div className="flex justify-center mt-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={onDeleteAll}
          disabled={savedData.length === 0}
        >
          Delete All
        </Button>
      </div>
    </div>
  );
};

export default AddedBillsList;
