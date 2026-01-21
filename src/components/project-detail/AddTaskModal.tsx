
import React, { useState } from "react";
import { Loader2, X, Plus, Tag, AlignLeft, Calculator } from "lucide-react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  soId: number;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdded, soId }) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !soId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/createSalesOrderLine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soId,
          productName,
          description,
          qty,
          price
        })
      });

      const json = await res.json();
      if (json.success) {
        onAdded();
        handleClose();
      } else {
        alert(json.error || "Failed to add task");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding task");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
      setProductName("");
      setDescription("");
      setQty(1);
      setPrice(0);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Add New Task
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Alert */}
        <div className="px-6 pt-4">
             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-blue-600 dark:text-blue-300 p-3 rounded-lg">
                 This will add a <strong>Service Line</strong> to the Sales Order, which automatically creates a Task in this project.
             </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           {/* Product Name */}
           <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                 <Tag className="w-4 h-4 text-blue-500" /> Task / Service Name
              </label>
              <input 
                 type="text" 
                 required
                 placeholder="e.g. Interior Design Phase 2"
                 value={productName}
                 onChange={e => setProductName(e.target.value)}
                 className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
           </div>

           {/* Description */}
           <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                 <AlignLeft className="w-4 h-4 text-gray-400" /> Description
              </label>
              <textarea 
                 value={description}
                 onChange={e => setDescription(e.target.value)}
                 placeholder="Additional details..."
                 className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
               {/* Qty */}
               <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</label>
                  <input 
                     type="number" 
                     min="0.1"
                     step="0.1"
                     required
                     value={qty}
                     onChange={e => setQty(parseFloat(e.target.value))}
                     className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
               </div>

               {/* Price */}
               <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 icon-label gap-2 flex items-center">
                     <Calculator className="w-4 h-4 text-green-500" /> Unit Price
                  </label>
                  <input 
                     type="number" 
                     min="0"
                     required
                     value={price}
                     onChange={e => setPrice(parseFloat(e.target.value))}
                     className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
               </div>
           </div>

        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
           <button 
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
           >
              Cancel
           </button>
           <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
           >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Task
           </button>
        </div>
      </div>
    </div>
  );
};
