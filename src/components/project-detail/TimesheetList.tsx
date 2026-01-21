"use client";
import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Loader2 } from "lucide-react";

interface Timesheet {
  id: number;
  date: string;
  employee_id: [number, string] | false;
  name: string;
  unit_amount: number;
}

export const TimesheetList: React.FC<{ taskId: number; isOpen: boolean }> = ({ taskId, isOpen }) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // New Entry Form State
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  
  const fetchTimesheets = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timesheets?taskId=${taskId}`);
      const json = await res.json();
      if (json.success) setTimesheets(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const fetchEmployees = React.useCallback(async () => {
    try {
      const res = await fetch('/api/employees');
      const json = await res.json();
      if (json.success) setEmployees(json.data);
    } catch (e) {
      console.error("Failed to fetch employees", e);
    }
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this log?")) return;
    try {
      const res = await fetch(`/api/timesheets?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTimesheets(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    
    setAdding(true);
    try {
      const res = await fetch('/api/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           taskId,
           date,
           description,
           employeeId: selectedEmployee || undefined // Send ID if selected
        })
      });
      
      const json = await res.json();
      if (json.success) {
        setDescription("");
        fetchTimesheets(); // Reload list
      } else {
        alert(json.error || "Failed to add");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTimesheets();
      if (employees.length === 0) fetchEmployees();
    }
  }, [isOpen, fetchTimesheets, fetchEmployees, employees.length]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 animate-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between mb-3">
         <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Timesheet Logs
         </h4>
         <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">
            {timesheets.length} entries
         </span>
      </div>

      {/* List */}
      <div className="space-y-2 mb-4">
         {loading ? (
           <div className="flex items-center justify-center py-4 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading logs...
           </div>
         ) : timesheets.length === 0 ? (
           <div className="text-center py-3 text-sm text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              No activity logs yet.
           </div>
         ) : (
           timesheets.map(ts => (
             <div key={ts.id} className="group flex items-start gap-3 text-sm p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                <div className="text-gray-400 text-xs min-w-[80px] pt-0.5">{ts.date}</div>
                <div className="flex-1">
                   <div className="font-medium text-gray-800 dark:text-gray-200">
                      {Array.isArray(ts.employee_id) ? ts.employee_id[1] : 'Unknown'}
                   </div>
                   <div className="text-gray-500 text-xs mt-0.5">{ts.name}</div>
                </div>
                {/* Delete Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(ts.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
                  title="Delete Log"
                >
                   <Trash2 className="w-3.5 h-3.5" />
                </button>
             </div>
           ))
         )}
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
         <input 
           type="date" 
           required
           value={date}
           onChange={e => setDate(e.target.value)}
           className="px-3 py-2 text-sm rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
         />
         
         {/* Employee Selector */}
         <select
           value={selectedEmployee}
           onChange={e => setSelectedEmployee(e.target.value)}
           className="px-3 py-2 text-sm rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-[150px]"
         >
            <option value="">Myself</option>
            {employees.length > 0 && <option disabled>──────────</option>}
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
         </select>

         <input 
           type="text" 
           placeholder="What did you work on?" 
           required
           value={description}
           onChange={e => setDescription(e.target.value)}
           className="flex-1 px-3 py-2 text-sm rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
         />
         <button 
           type="submit"
           disabled={adding}
           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
         >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">Add</span>
         </button>
      </form>
    </div>
  );
};
