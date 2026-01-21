
import React, { useState, useEffect } from "react";
import { Loader2, X, Calendar, User, Type, Building2 } from "lucide-react";

interface Employee {
  id: number;
  name: string;
}

interface Partner {
  id: number;
  name: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  project: {
    id: number;
    name: string;
    date?: string;
    date_start?: string;
    partner_id?: [number, string];
  };
  currentPicIds?: number[];
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpdate,
  project,
  currentPicIds = []
}) => {
  const [name, setName] = useState(project.name);
  const [date, setDate] = useState(project.date || "");
  const [dateStart, setDateStart] = useState(project.date_start || "");
  const [partnerId, setPartnerId] = useState<string>(project.partner_id ? String(project.partner_id[0]) : "");
  
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPicIds, setSelectedPicIds] = useState<number[]>(currentPicIds);

  // Fetch Data
  useEffect(() => {
    if (isOpen) {
        setName(project.name);
        setDate(project.date || "");
        setDateStart(project.date_start || "");
        setPartnerId(project.partner_id ? String(project.partner_id[0]) : "");
        setSelectedPicIds(currentPicIds);
    
        const fetchData = async () => {
            try {
                const [empRes, partRes] = await Promise.all([
                    fetch('/api/employees'),
                    fetch('/api/partners')
                ]);
                
                const empJson = await empRes.json();
                const partJson = await partRes.json();
                
                if (empJson.success) setEmployees(empJson.data);
                if (partJson.success) setPartners(partJson.partners);
                
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        };
        fetchData();
    }
  }, [isOpen, project, currentPicIds]);

  const toggleEmployee = (id: number) => {
    setSelectedPicIds(prev => 
        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
       const res = await fetch('/api/updateProject', {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({
               projectId: project.id,
               name,
               deadline: date,
               date_start: dateStart,
               partner_id: partnerId,
               picIds: selectedPicIds
           })
       });
       
       const json = await res.json();
       if (json.success) {
           onUpdate();
           onClose();
       } else {
           alert("Failed to update project");
       }
    } catch (e) {
        console.error(e);
        alert("Error updating project");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Project</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
             {/* Name */}
             <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <Type className="w-4 h-4 text-blue-500" /> Project Name
                </label>
                <input 
                   type="text" 
                   required
                   value={name}
                   onChange={e => setName(e.target.value)}
                   className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
             </div>

             {/* Client */}
             <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <Building2 className="w-4 h-4 text-emerald-500" /> Client
                </label>
                <select 
                   value={partnerId}
                   onChange={e => setPartnerId(e.target.value)}
                   className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                   <option value="">Select Client...</option>
                   {partners.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                   ))}
                </select>
             </div>

             {/* Dates */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-gray-400" /> Start Date
                    </label>
                    <input 
                       type="date" 
                       value={dateStart}
                       onChange={e => setDateStart(e.target.value)}
                       className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-orange-500" /> Deadline
                    </label>
                    <input 
                       type="date" 
                       value={date}
                       onChange={e => setDate(e.target.value)}
                       className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                 </div>
             </div>

             {/* PICs */}
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <User className="w-4 h-4 text-purple-500" /> Assign PICs
                </label>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900">
                    {employees.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-2">Loading...</div>
                    ) : (
                        employees.map(emp => (
                            <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-800 rounded cursor-pointer transition-colors">
                                <input 
                                   type="checkbox" 
                                   checked={selectedPicIds.includes(emp.id)}
                                   onChange={() => toggleEmployee(emp.id)}
                                   className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{emp.name}</span>
                            </label>
                        ))
                    )}
                </div>
                <p className="text-xs text-gray-400">Select multiple employees to assign to this project.</p>
             </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
             <button 
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
             >
                Cancel
             </button>
             <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
             >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
             </button>
          </div>
       </div>
    </div>
  );
};
