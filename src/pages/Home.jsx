import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed, subscribeToFeed, initRealtime, markAlertResolved, respondToAlert } from '../services/alerts';
import { getSocietyById } from '../services/societies';
import AlertCard from '../components/AlertCard';
import AnnouncementCard from '../components/AnnouncementCard';
import SOSButton from '../components/SOSButton';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [societyName, setSocietyName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?.society_id) return;
    let active = true;
    // Fetch dynamic society profile + feed
    Promise.all([getSocietyById(user.society_id), getFeed(user.society_id)])
      .then(([soc, data]) => {
        if (!active) return;
        if (soc) setSocietyName(soc.name);
        setFeed(data);
        setError('');
      })
      .catch(err => { if (active) setError(err.message || 'Could not load alerts'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.society_id, refreshKey]);

  // Live updates: realtime channel triggers a refetch
  useEffect(() => {
    if (!user?.society_id) return;
    const stopRealtime = initRealtime(user.society_id);
    const unsubscribe = subscribeToFeed(() => setRefreshKey(k => k + 1));
    // Fallback poll in case the realtime socket drops
    const poll = setInterval(() => setRefreshKey(k => k + 1), 30000);
    return () => { unsubscribe(); stopRealtime(); clearInterval(poll); };
  }, [user?.society_id]);

  const runAction = async (action) => {
    try {
      await action();
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(`Action failed: ${err.message || 'please try again'}`);
    }
  };

  const handleHelp = (alertId) => runAction(() => respondToAlert(alertId, user.id, 'helping'));
  const handleResolve = (alertId) => runAction(() => markAlertResolved(alertId));

  if (loading) return <div className="p-8 text-center animate-pulse">Loading feed...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] pt-6 px-4">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Live Feed</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{societyName}</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800">
          <ShieldCheck className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold rounded-xl flex items-center justify-between gap-3">
          <span className="break-words">{error}</span>
          <button onClick={() => { setError(''); setRefreshKey(k => k + 1); }} className="shrink-0 underline">Retry</button>
        </div>
      )}

      <div className="space-y-4 pb-16">
        {feed.map((item) => (
          item.feedType === 'alert' ? (
            <AlertCard 
              key={item.id} 
              alert={item} 
              onHelp={handleHelp}
              onResolve={handleResolve}
            />
          ) : (
            <AnnouncementCard 
              key={item.id} 
              announcement={item} 
            />
          )
        ))}
        {feed.length === 0 && !error && (
          <div className="text-center py-12 text-slate-400 font-medium">
            No active alerts or announcements.
          </div>
        )}
      </div>

      {/* Only residents can send alerts (the /send-alert route rejects other roles) */}
      {user?.role === 'resident' && <SOSButton />}
    </div>
  );
}
