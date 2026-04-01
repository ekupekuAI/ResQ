import { useLocation, useNavigate } from 'react-router-dom';
import { BellRing, ShieldAlert, User, ShieldCheck, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isGuards = user?.role === 'guard';
  const isAdmin = user?.role === 'admin';

  // Guard only has feed
  if (isGuards) return null; // Guard view might be simpler with top nav

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-border z-50">
      <div className="flex justify-around items-center h-[72px] px-2">
        <NavButton 
          icon={<BellRing size={24} />} 
          label="Alerts" 
          active={location.pathname === '/home'} 
          onClick={() => navigate('/home')} 
        />
        
        {isAdmin && (
          <NavButton 
            icon={<ShieldCheck size={24} />} 
            label="Dashboard" 
            active={location.pathname === '/admin'} 
            onClick={() => navigate('/admin')} 
          />
        )}
        
        <NavButton 
          icon={<User size={24} />} 
          label="Profile" 
          active={location.pathname === '/profile'} 
          onClick={() => navigate('/profile')} 
        />
      </div>
    </nav>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[64px]
      ${active ? 'text-primary scale-110' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
    >
      <div className="relative">
        {icon}
        {active && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-fade-in" />
        )}
      </div>
      <span className="text-[10px] mt-1.5 font-bold tracking-tight">{label}</span>
      {active && <div className="absolute inset-0 bg-primary/10 rounded-xl animate-fade-in -z-10" />}
    </button>
  );
}
