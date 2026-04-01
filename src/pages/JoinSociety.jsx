import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSocietyByCode } from '../services/societies';

export default function JoinSociety() {
  const navigate = useNavigate();
  const { updateProfile, user } = useAuth();

  const [code, setCode] = useState('');
  const [flat, setFlat] = useState('');
  const [floor, setFloor] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already joined, they can skip to home/guard unless they explicitly want to rejoin
  useEffect(() => {
    if (user?.society_id) {
      if (user.role === 'guard') navigate('/guard');
      else navigate('/home');
    }
  }, [user, navigate]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const society = await getSocietyByCode(code.toUpperCase());
      if (!society) {
        throw new Error('Invalid Society Code. Please check again.');
      }
      
      const payload = { society_id: society.id };
      if (flat) payload.flat = flat;
      if (floor) payload.floor = floor;

      await updateProfile(payload);
      
      if (user?.role === 'guard') navigate('/guard');
      else navigate('/home');
    } catch (err) {
      setErrorMsg(err.message || 'Error joining society');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 pt-12 animate-slide-up">
      <div className="mb-8 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-fit">
        <Building2 size={36} className="text-blue-600 dark:text-blue-400" />
      </div>

      <h1 className="text-3xl font-black tracking-tight mb-2">Join Your Building</h1>
      <p className="text-muted-foreground font-medium mb-8">Enter the society code provided by your admin to connect.</p>

      <form onSubmit={handleJoin} className="space-y-5 flex-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Society Code</label>
          <input 
            type="text" 
            required
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SUNRISE-BLR-204"
            className="w-full text-lg uppercase bg-input/50 border border-border rounded-xl px-4 py-4 font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {user?.role !== 'guard' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Flat Number</label>
              <input 
                type="text" 
                required
                value={flat}
                onChange={e => setFlat(e.target.value)}
                placeholder="e.g. 302"
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Floor</label>
              <input 
                type="text" 
                required
                value={floor}
                onChange={e => setFloor(e.target.value)}
                placeholder="e.g. 3rd"
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold rounded-xl text-center break-words">
            {errorMsg}
          </div>
        )}

        <div className="pt-8">
          <button 
            type="submit" 
            disabled={loading || !code || (user?.role !== 'guard' && (!flat || !floor))}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Connect to Society <ArrowRight size={20} /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
