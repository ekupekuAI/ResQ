import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed } from '../services/alerts';
import { getSocietyById } from '../services/societies';
import { Users, AlertTriangle, ShieldCheck, Activity, Search } from 'lucide-react';
import EmergencyBadge from '../components/EmergencyBadge';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [society, setSociety] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user?.society_id) {
        const socData = await getSocietyById(user.society_id);
        const feedData = await getFeed(user.society_id);
        if (socData) setSociety(socData);
        if (feedData) setAlerts(feedData.filter(i => i.feedType === 'alert'));
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] pt-6 px-4 pb-24 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm font-medium text-slate-500">Managing {society.name || 'Your Society'}</p>
        <div className="mt-4 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider block mb-1">Society Code</span>
          <span className="font-mono text-xl font-black tracking-widest">{society.society_code || '---'}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon={<Users />} label="Total Residents" value="--" color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={<AlertTriangle />} label="Total Alerts" value={alerts.length} color="text-red-500" bg="bg-red-500/10" />
        <StatCard icon={<ShieldCheck />} label="Resolved" value={alerts.filter(a => a.status === 'resolved').length} color="text-orange-500" bg="bg-orange-500/10" />
        <StatCard icon={<Activity />} label="Avg Response" value="--" color="text-green-500" bg="bg-green-500/10" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black tracking-tight">Recent Activity</h2>
        <div className="bg-slate-200 dark:bg-slate-800 rounded-lg p-1 flex gap-1">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow flex-1' : 'text-slate-500'}`}>All</button>
          <button onClick={() => setFilter('active')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'active' ? 'bg-white dark:bg-slate-700 shadow flex-1' : 'text-slate-500'}`}>Active</button>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.filter(a => filter === 'all' || a.status === filter).map(alert => (
          <div key={alert.id} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <EmergencyBadge type={alert.type} />
                <span className="text-xs text-slate-400 font-medium">Flat {alert.flat}</span>
              </div>
              <p className="text-sm font-semibold truncate max-w-[200px]">{alert.description || 'No description'}</p>
            </div>
            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${alert.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {alert.status}
            </div>
          </div>
        ))}

        {alerts.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No alerts yet.</p>}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
      <div className={`p-3 rounded-full mb-2 ${bg} ${color}`}>
        {icon}
      </div>
      <span className="text-3xl font-black mb-1">{value}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}
