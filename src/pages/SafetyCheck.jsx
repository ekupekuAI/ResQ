import { ShieldAlert, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SafetyCheck() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 min-h-screen bg-red-600 dark:bg-red-900 text-white flex flex-col items-center justify-center px-6 z-50 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        <div className="bg-white/10 p-4 rounded-full mb-6 border-4 border-white/20 animate-pulse">
          <ShieldAlert size={64} className="text-white drop-shadow-md" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase drop-shadow-md">Building Emergency</h1>
        <p className="text-xl font-bold text-red-200 mb-12 uppercase tracking-widest drop-shadow-sm">Evacuation Protocol Active</p>
        
        <p className="text-white/90 font-medium mb-10 text-lg leading-relaxed shadow-sm">
          Please follow emergency escape routes immediately. Mark yourself safe once you are out of the building.
        </p>

        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-6 rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:shadow-[0_0_60px_rgba(34,197,94,0.8)] text-2xl uppercase tracking-wider transition-all active:scale-95 border-2 border-green-400 flex items-center justify-center"
        >
          I ALREADY EVACUATED
        </button>

        <p className="mt-8 flex items-center justify-center gap-2 text-sm text-red-200 font-medium">
          <Info size={16} /> Admin live counters are active.
        </p>
      </div>
    </div>
  );
}
