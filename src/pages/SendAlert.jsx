import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createAlert } from '../services/alerts';
import { EMERGENCY_TYPES } from '../lib/utils';
import * as Icons from 'lucide-react';
import { ArrowLeft, Send } from 'lucide-react';

export default function SendAlert() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) return alert('Please select an emergency type');
    
    setLoading(true);
    await createAlert({
      type: selectedType,
      flat: user.flat,
      description,
      society_id: user.society_id,
      sent_by: user.id
    });
    setLoading(false);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] flex flex-col pt-6">
      <div className="px-4 mb-6 flex flex-col gap-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 w-fit rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-red-600 dark:text-red-500 tracking-tight">Send SOS</h1>
        <p className="text-sm font-medium text-slate-500">Alert your building immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-4 pb-safe space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Emergency Type</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(EMERGENCY_TYPES).map(([key, meta]) => {
              const Icon = Icons[meta.icon] || Icons.AlertTriangle;
              const isSelected = selectedType === key;
              
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedType(key)}
                  className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 overflow-hidden
                    ${isSelected 
                      ? 'border-transparent text-white scale-[1.02] shadow-lg' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}
                  `}
                >
                  {isSelected && <div className={`absolute inset-0 opacity-100 transition-opacity ${meta.color}`} />}
                  <div className="relative z-10">
                    <Icon size={32} strokeWidth={2.5} />
                  </div>
                  <span className="relative z-10 text-xs font-bold tracking-wide uppercase">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">My Location (Auto)</label>
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800 shadow-inner block">
            Flat {user?.flat}, {user?.floor} Floor
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Details (Optional)</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="E.g. Smoke coming from kitchen..."
            className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none shadow-sm"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !selectedType}
          className={`
            w-full mb-8 py-5 rounded-2xl flex items-center justify-center gap-2 font-black text-lg transition-all
            ${!selectedType 
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30 active:scale-[0.98]'}
          `}
        >
          {loading ? 'Sending Alert...' : <><Send size={24} /> Broadcast SOS</>}
        </button>
      </form>
    </div>
  );
}
