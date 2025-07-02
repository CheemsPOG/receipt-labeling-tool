import { useState, useEffect } from "react";

export function useBillManager(selectedImages, setCurrentImageIndex, toast) {
  const [billData, setBillData] = useState({
    merchant: "",
    receiptDate: "",
    totalPayment: 0,
    totalQuantity: 0,
    items: [{ sku: "", name: "", quantity: 0, unitPrice: 0, totalPrice: 0 }],
  });
  const [savedData, setSavedData] = useState([]);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);

  useEffect(() => {
    const totalQuantity = billData.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalPayment = billData.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
    if (
      billData.totalPayment !== totalPayment ||
      billData.totalQuantity !== totalQuantity
    ) {
      setBillData((prev) => ({ ...prev, totalPayment, totalQuantity }));
    }
  }, [billData.items]);

  useEffect(() => {
    const stored = sessionStorage.getItem("receipt_labeling_savedData");
    if (stored) {
      try {
        setSavedData(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "receipt_labeling_savedData",
      JSON.stringify(savedData)
    );
  }, [savedData]);

  // Auto-save billData to savedData when billData changes and a bill is selected
  useEffect(() => {
    if (selectedEntryIndex != null && savedData[selectedEntryIndex]) {
      const latestBillData = billData;
      const updatedEntry = {
        ...savedData[selectedEntryIndex],
        scan_result: {
          merchant: latestBillData.merchant,
          items: latestBillData.items.map((item) => ({
            sku: item.sku,
            name: item.name,
            quantity: parseFloat(Number(item.quantity).toFixed(1)),
            unit_price: parseFloat(Number(item.unitPrice).toFixed(1)),
            total_price: parseFloat(Number(item.totalPrice).toFixed(1)),
          })),
          total_quantity: parseFloat(
            Number(latestBillData.totalQuantity).toFixed(1)
          ),
          total_payment: parseFloat(
            Number(latestBillData.totalPayment).toFixed(1)
          ),
          receipt_date: latestBillData.receiptDate,
        },
        timestamp: new Date().toISOString(),
      };
      const updatedData = [...savedData];
      updatedData[selectedEntryIndex] = updatedEntry;
      setSavedData(updatedData);
    }
  }, [billData, selectedEntryIndex]);

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function getNextImageFilename(baseName, existingNames) {
    if (!existingNames.includes(baseName)) return baseName;
    let i = 1;
    let name, ext;
    const match = baseName.match(/^(.*?)(\.[^.]+)?$/);
    if (match) {
      name = match[1];
      ext = match[2] || "";
    } else {
      name = baseName;
      ext = "";
    }
    while (existingNames.includes(`${name}(${i})${ext}`)) {
      i++;
    }
    return `${name}(${i})${ext}`;
  }

  const handleAddBill = (currentImage) => {
    if (!currentImage) {
      toast({
        title: "No image selected",
        description: "Please select an image first.",
        variant: "destructive",
      });
      return;
    }
    const baseName = currentImage.name;
    const existingNames = savedData
      .filter((entry) =>
        entry.image_filename.startsWith(baseName.replace(/(\.[^.]+)$/, ""))
      )
      .map((entry) => entry.image_filename);
    const newImageFilename = getNextImageFilename(baseName, existingNames);
    const newEntry = {
      image_filename: newImageFilename,
      success: true,
      task_id: generateUUID(),
      scan_result: {
        merchant: "",
        items: [
          { sku: "", name: "", quantity: 0, unit_price: 0, total_price: 0 },
        ],
        total_quantity: 0,
        total_payment: 0,
        receipt_date: "",
      },
      timestamp: new Date().toISOString(),
    };
    setSavedData([newEntry, ...savedData]);
    setBillData({
      merchant: "",
      receiptDate: "",
      totalPayment: 0,
      totalQuantity: 0,
      items: [{ sku: "", name: "", quantity: 0, unitPrice: 0, totalPrice: 0 }],
    });
    setSelectedEntryIndex(0);
    toast({
      title: "New bill started",
      description: `Blank bill for ${newImageFilename} added. Fill in the details and click Save.`,
    });
  };

  const handleSaveBill = (currentImage) => {
    // No-op: auto-save is now enabled
  };

  const handleSelectEntry = (index) => {
    setSelectedEntryIndex(index);
    const entry = savedData[index];
    if (entry && entry.image_filename) {
      const imgIdx = selectedImages.findIndex(
        (img) =>
          img.name === entry.image_filename ||
          entry.image_filename.startsWith(img.name.replace(/(\.[^.]+)$/, ""))
      );
      if (imgIdx !== -1) {
        setCurrentImageIndex(imgIdx);
      } else {
        toast({
          title: "Image not found",
          description: `Image not found: ${entry.image_filename}`,
          variant: "destructive",
        });
      }
    }
    if (entry && entry.scan_result) {
      setBillData({
        merchant: entry.scan_result.merchant || "",
        receiptDate: entry.scan_result.receipt_date || "",
        totalPayment: entry.scan_result.total_payment || 0,
        totalQuantity: entry.scan_result.total_quantity || 0,
        items: (entry.scan_result.items || []).map((item) => ({
          sku: item.sku || "",
          name: item.name || "",
          quantity: item.quantity || 0,
          unitPrice: item.unit_price || 0,
          totalPrice: item.total_price || 0,
        })),
      });
    } else if (entry && entry.billData) {
      setBillData({ ...entry.billData });
      if (
        typeof entry.imageIndex === "number" &&
        selectedImages.length > 0 &&
        entry.imageIndex < selectedImages.length
      ) {
        setCurrentImageIndex(entry.imageIndex);
      }
    }
  };

  const handleSaveAllBills = async () => {
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
    const canShowSaveFilePicker =
      typeof window !== "undefined" &&
      typeof (window as any).showSaveFilePicker === "function";
    if (canShowSaveFilePicker) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          types: [
            {
              description: "JSON files",
              accept: { "application/json": [".json"] },
            },
          ],
          suggestedName: "label_v1.json",
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast({
          title: "All bills saved",
          description: `All bills have been exported to ${
            fileHandle.name || "label_v1.json"
          }.`,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          toast({
            title: "Save failed",
            description: "Could not save the file. Please try again.",
            variant: "destructive",
          });
        }
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "label_v1.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return {
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
  };
}
