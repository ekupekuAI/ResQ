import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createAnnouncement } from '../services/alerts';

export default function Announcements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Only admins can broadcast notices.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  const handlePost = async (e) => {
    e.preventDefault();
    if (!message) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await createAnnouncement(user.society_id, user.id, message);
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message || 'Error broadcasting announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] pt-6 px-4 pb-20">
      <header className="mb-6">
        <button onClick={() => navigate(-1)} className="mb-4 text-primary font-bold text-sm">❮ Back to Dashboard</button>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Broadcast Notice</h1>
        <p className="text-sm font-medium text-slate-500">Send an announcement to all residents.</p>
      </header>

      <form onSubmit={handlePost} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
          <Megaphone size={20} />
          <span className="text-sm font-bold tracking-tight">This will push to everyone's feed.</span>
        </div>

        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your announcement here... (e.g. Water supply off tomorrow)"
            className="w-full h-40 bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold mt-4 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <button 
          type="submit"
          disabled={!message || loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Post Notice</>}
        </button>
      </form>
    </div>
  );
}
