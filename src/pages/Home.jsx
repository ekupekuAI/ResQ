import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed, subscribeToFeed, markAlertResolved, respondToAlert } from '../services/alerts';
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

  const fetchFeed = async () => {
    if (!user?.society_id) return;
    
    // Fetch dynamic society profile
    const soc = await getSocietyById(user.society_id);
    if(soc) setSocietyName(soc.name);
    
    const data = await getFeed(user.society_id);
    setFeed(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
    const unsubscribe = subscribeToFeed(() => {
      fetchFeed();
    });
    return () => unsubscribe();
  }, [user]);

  const handleHelp = async (alertId) => {
    await respondToAlert(alertId, user.id, 'helping');
  };

  const handleResolve = async (alertId) => {
    await markAlertResolved(alertId);
  };

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
        {feed.length === 0 && (
          <div className="text-center py-12 text-slate-400 font-medium">
            No active alerts or announcements.
          </div>
        )}
      </div>

      {user?.role !== 'guard' && <SOSButton />}
    </div>
  );
}
