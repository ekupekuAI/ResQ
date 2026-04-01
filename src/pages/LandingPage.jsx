import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, MessageSquareWarning } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-center items-center p-6 text-center relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="z-10 animate-slide-up w-full max-w-sm">
        <div className="mb-8 relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-500 rounded-2xl rotate-3 animate-pulse"></div>
          <div className="absolute inset-0 bg-red-600 rounded-2xl flex items-center justify-center -rotate-3 transition-transform hover:rotate-0">
            <ShieldAlert size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-5xl font-black tracking-tight mb-2 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">ResQ</h1>
        <p className="text-xl font-bold text-red-500 tracking-wide uppercase mb-6">One Tap. Life Saved.</p>
        
        <p className="text-slate-400 font-medium mb-12 text-sm leading-relaxed px-4">
          The instant emergency alert system for your gated community. Connect every neighbor when seconds matter.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <button 
            onClick={() => navigate('/auth?role=resident')}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-4 rounded-xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Users size={20} /> Request Help / Join Society
          </button>
          
          <button 
            onClick={() => navigate('/auth?role=admin')}
            className="w-full glass hover:bg-white/10 active:scale-95 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ShieldAlert size={20} /> Create a Society
          </button>

          <button 
            onClick={() => navigate('/auth?role=guard')}
            className="w-full text-slate-500 font-medium py-3 rounded-xl hover:text-white transition-colors text-sm"
          >
            Security Guard Login
          </button>
        </div>

        <div className="mt-16 flex justify-around text-slate-500 text-xs font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1"><MessageSquareWarning size={14} /> Instant</span>
          <span className="flex items-center gap-1"><ShieldAlert size={14} /> Secure</span>
          <span className="flex items-center gap-1"><Users size={14} /> Local</span>
        </div>
      </div>
    </div>
  );
}
