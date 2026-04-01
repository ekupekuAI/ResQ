import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, Settings, Bell, CircleAlert } from 'lucide-react';
import { getSocietyById } from '../services/societies';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [society, setSociety] = useState({});

  useEffect(() => {
    if (user?.society_id) {
      getSocietyById(user.society_id).then(soc => {
        if (soc) setSociety(soc);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] flex flex-col pt-8 animate-fade-in">
      <div className="px-6 mb-8 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-xl">
          <UserCircle size={48} className="text-blue-500 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
        <p className="font-semibold text-slate-500 uppercase text-xs tracking-wider mt-1">{user.role}</p>
      </div>

      <div className="px-6 space-y-6 flex-1">
        {user.role !== 'guard' && (
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-around">
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Flat</span>
              <span className="font-black text-xl">{user.flat || '--'}</span>
            </div>
            <div className="w-px bg-slate-100 dark:bg-slate-800" />
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Floor</span>
              <span className="font-black text-xl">{user.floor || '--'}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
          <ListItem icon={<Bell size={20} />} label="Notification Settings" />
          <div className="h-px bg-slate-100 dark:bg-slate-800 ml-12" />
          <ListItem icon={<Settings size={20} />} label="Account Settings" />
          <div className="h-px bg-slate-100 dark:bg-slate-800 ml-12" />
          <ListItem icon={<CircleAlert size={20} />} label="Help & Support" />
        </div>

        {society.id && (
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-400 mb-2">Connected to</p>
            <p className="font-bold">{society.name}</p>
            <p className="font-mono text-xs text-slate-500 mt-1">{society.society_code}</p>
          </div>
        )}
      </div>

      <div className="p-6">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={20} /> Log Out
        </button>
      </div>
    </div>
  );
}

function ListItem({ icon, label }) {
  return (
    <button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
      <div className="text-slate-400">{icon}</div>
      <span className="font-semibold flex-1">{label}</span>
      <div className="text-slate-300">❯</div>
    </button>
  );
}
