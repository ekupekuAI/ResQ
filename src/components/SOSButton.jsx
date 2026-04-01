import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function SOSButton() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <div className="relative flex justify-center items-center">
        {/* Animated Pulse Rings */}
        <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse-ring opacity-60"></div>
        <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse-ring opacity-40" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Main Button */}
        <button 
          onClick={() => navigate('/send-alert')}
          className="relative bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-xl shadow-red-500/40 transition-transform hover:scale-105 active:scale-95"
        >
          <AlertTriangle size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-wider mt-0.5 uppercase">SOS</span>
        </button>
      </div>
    </div>
  );
}
