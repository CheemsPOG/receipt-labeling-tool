import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Edit, Check } from "lucide-react";

interface BillItem {
  sku?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BillData {
  merchant: string;
  receiptDate: string;
  totalPayment: number;
  totalQuantity: number;
  items: BillItem[];
}

interface BillFormProps {
  billData: BillData;
  setBillData: React.Dispatch<React.SetStateAction<BillData>>;
  handleAddBill: () => void;
  handleSaveAllBills: () => void;
  handleSaveBill?: () => void;
  currentImage: File | undefined;
  savedData: any[];
  children?: React.ReactNode;
  importedFileHandle?: any;
  importedFileName?: string | null;
}

const BillForm: React.FC<BillFormProps> = ({
  billData,
  setBillData,
  handleAddBill,
  handleSaveAllBills,
  handleSaveBill,
  currentImage,
  savedData,
  children,
  importedFileHandle,
  importedFileName,
}) => {
  // Add local state for feedback
  const [addSuccess, setAddSuccess] = React.useState(false);
  const [saveAllSuccess, setSaveAllSuccess] = React.useState(false);

  // Handler wrappers for feedback
  const handleAddBillWithFeedback = () => {
    handleAddBill();
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 1000);
  };
  const handleSaveAllBillsWithFeedback = () => {
    handleSaveAllBills();
    setSaveAllSuccess(true);
    setTimeout(() => setSaveAllSuccess(false), 1000);
  };

  return (
    <>
      {children}
      {/* Merchant and Receipt Date */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="merchant" className="text-sm">
            Merchant
          </Label>
          <Input
            id="merchant"
            type="text"
            value={billData.merchant}
            onChange={(e) =>
              setBillData((prev) => ({
                ...prev,
                merchant: e.target.value,
              }))
            }
            className="text-sm"
          />
        </div>
        <div>
          <Label htmlFor="receiptDate" className="text-sm">
            Receipt Date
          </Label>
          <Input
            id="receiptDate"
            type="datetime-local"
            value={
              billData.receiptDate ? billData.receiptDate.slice(0, 16) : ""
            }
            onChange={(e) =>
              setBillData((prev) => ({
                ...prev,
                receiptDate: e.target.value,
              }))
            }
            className="text-sm"
          />
        </div>
      </div>
      {/* Total Payment and Quantity */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="totalPayment" className="text-sm">
            Total Payment
          </Label>
          <Input
            id="totalPayment"
            type="number"
            value={billData.totalPayment}
            readOnly
            className="text-sm bg-muted"
          />
        </div>
        <div>
          <Label htmlFor="totalQuantity" className="text-sm">
            Total Quantity
          </Label>
          <Input
            id="totalQuantity"
            type="number"
            value={billData.totalQuantity}
            readOnly
            className="text-sm bg-muted"
          />
        </div>
      </div>
      {/* Items Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm">Items</Label>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              setBillData((prev) => ({
                ...prev,
                items: [
                  ...prev.items,
                  {
                    sku: "",
                    name: "",
                    quantity: 0,
                    unitPrice: 0,
                    totalPrice: 0,
                  },
                ],
              }))
            }
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {billData.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Item {index + 1}</span>
                {billData.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setBillData((prev) => ({
                        ...prev,
                        items: prev.items.filter((_, i) => i !== index),
                      }))
                    }
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-1">
                  <Label className="text-xs">SKU</Label>
                  <Input
                    value={item.sku}
                    onChange={(e) =>
                      setBillData((prev) => ({
                        ...prev,
                        items: prev.items.map((it, i) =>
                          i === index ? { ...it, sku: e.target.value } : it
                        ),
                      }))
                    }
                    placeholder="SKU"
                    className="text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      setBillData((prev) => ({
                        ...prev,
                        items: prev.items.map((it, i) =>
                          i === index ? { ...it, name: e.target.value } : it
                        ),
                      }))
                    }
                    placeholder="Item name..."
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setBillData((prev) => {
                        const items = prev.items.map((it, i) =>
                          i === index
                            ? {
                                ...it,
                                quantity: val,
                                totalPrice: (it.unitPrice || 0) * val,
                              }
                            : it
                        );
                        const totalQuantity = items.reduce(
                          (sum, it) => sum + (it.quantity || 0),
                          0
                        );
                        const totalPayment = items.reduce(
                          (sum, it) => sum + (it.totalPrice || 0),
                          0
                        );
                        return {
                          ...prev,
                          items,
                          totalQuantity,
                          totalPayment,
                        };
                      });
                    }}
                    placeholder="0"
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Unit Price</Label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setBillData((prev) => {
                        const items = prev.items.map((it, i) =>
                          i === index
                            ? {
                                ...it,
                                unitPrice: val,
                                totalPrice: (it.quantity || 0) * val,
                              }
                            : it
                        );
                        const totalPayment = items.reduce(
                          (sum, it) => sum + (it.totalPrice || 0),
                          0
                        );
                        return { ...prev, items, totalPayment };
                      });
                    }}
                    placeholder="0.00"
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Total</Label>
                  <Input
                    type="number"
                    value={item.totalPrice}
                    readOnly
                    className="text-xs bg-muted"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Update Bill button for editing/updating current bill */}
      {/* Save button removed: auto-save is now enabled */}
      <Button
        onClick={handleAddBillWithFeedback}
        disabled={!currentImage}
        className="mt-2 w-full hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-transform"
        variant="secondary"
      >
        {addSuccess ? (
          <Check className="w-4 h-4 mr-2 text-green-600 animate-bounce" />
        ) : null}
        {addSuccess ? "Added!" : "Add Bill"}
      </Button>
      <Button
        onClick={handleSaveAllBillsWithFeedback}
        disabled={savedData.length === 0}
        className="mt-2 w-full flex items-center justify-center gap-2 relative hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-transform"
      >
        {saveAllSuccess ? (
          <Check className="w-4 h-4 mr-2 text-green-600 animate-bounce" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {importedFileHandle ? (
          <>
            {saveAllSuccess ? "Saved!" : "Save All Bills"}
            <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200 text-xs font-semibold">
              Overwrite: {importedFileName || importedFileHandle.name}
            </span>
          </>
        ) : saveAllSuccess ? (
          "Saved!"
        ) : (
          "Save All Bills"
        )}
      </Button>
      {importedFileHandle && (
        <div className="text-xs text-green-700 mt-1 text-center flex items-center justify-center gap-1">
          <span className="inline-block bg-green-100 border border-green-200 rounded px-2 py-0.5">
            Saving will overwrite the imported file.
          </span>
        </div>
      )}
    </>
  );
};

export default BillForm;
