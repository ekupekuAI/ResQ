import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed, subscribeToFeed, initRealtime } from '../services/alerts';
import { getSocietyById } from '../services/societies';
import { ShieldCheck, LogOut } from 'lucide-react';
import EmergencyBadge from '../components/EmergencyBadge';
import { formatDistanceToNow } from 'date-fns';

export default function GuardView() {
  const { user, logout } = useAuth();
  const [feed, setFeed] = useState([]);
  const [societyName, setSocietyName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.society_id) return;
    getSocietyById(user.society_id).then(soc => { if (soc) setSocietyName(soc.name); });

    const fetchFeed = async () => {
      try {
        const data = await getFeed(user.society_id);
        setFeed(data.filter(i => i.feedType === 'alert')); // Guards only see alerts
        setError('');
      } catch (err) {
        setError(err.message || 'Could not load alerts');
      }
    };
    fetchFeed();
    const stopRealtime = initRealtime(user.society_id);
    const unsubscribe = subscribeToFeed(fetchFeed);
    // Fallback poll so the terminal stays current even if the realtime socket drops
    const poll = setInterval(fetchFeed, 30000);
    return () => { unsubscribe(); stopRealtime(); clearInterval(poll); };
  }, [user?.society_id]);

  const activeAlerts = feed.filter(a => a.status === 'active');

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono select-none">
      <header className="flex justify-between items-center bg-[#111] p-4 rounded-xl border border-white/10 mb-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-yellow-500" size={32} />
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase">Guard Terminal</h1>
            <p className="text-xs text-yellow-500/80">LIVE FEED • {societyName || '...'}</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 bg-red-900/30 text-red-500 rounded-lg hover:bg-red-900/50 transition">
          <LogOut size={24} />
        </button>
      </header>

      {error && (
        <div role="alert" className="mb-6 bg-yellow-900/30 border-2 border-yellow-500/60 text-yellow-400 p-4 rounded-xl font-bold">
          FEED OFFLINE — {error}. Retrying automatically.
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="mb-6 bg-red-900/20 border-2 border-red-600/50 text-red-500 p-4 rounded-xl animate-pulse font-bold flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
          {activeAlerts.length} ACTIVE EMERGENCY DETECTED
        </div>
      )}

      <div className="space-y-4">
        {feed.map(alert => (
          <div key={alert.id} className={`p-4 rounded-xl border-l-4 transition-all duration-500 ${alert.status === 'active' ? 'bg-[#1a0f0f] border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-[#111] border-green-500 opacity-60'}`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`text-4xl font-black ${alert.status === 'active' ? 'text-white' : 'text-slate-500'}`}>
                #{alert.flat}
              </span>
              <div className="text-right">
                <EmergencyBadge type={alert.type} />
                <div className="text-xs text-slate-500 mt-2">
                  {formatDistanceToNow(new Date(alert.created_at))} ago
                </div>
              </div>
            </div>
            {alert.status === 'active' && alert.description && (
              <p className="text-red-400 font-bold text-lg leading-snug border-t border-red-900/30 pt-3 mt-2">
                {alert.description.toUpperCase()}
              </p>
            )}
            {alert.status === 'resolved' && (
              <div className="text-green-500 font-bold border-t border-green-900/30 pt-3 mt-2 uppercase tracking-widest text-xs">
                RESOLVED • {new Date(alert.resolved_at).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
