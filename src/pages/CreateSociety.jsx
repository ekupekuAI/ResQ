import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { createSociety } from '../services/societies';
import { useAuth } from '../context/AuthContext';

export default function CreateSociety() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const generated = `${name.replace(/[^a-zA-Z0-9]/g, '').substring(0,4).toUpperCase()}-${Math.floor(Math.random()*900+100)}`;
    
    try {
      const society = await createSociety(name, address, generated, user.id);
      await updateProfile({ society_id: society.id });
      setCode(generated);
    } catch (err) {
      setErrorMsg(err.message || 'Error creating society');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mb-8 bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit">
        <ShieldCheck size={36} className="text-green-600 dark:text-green-400" />
      </div>

      <h1 className="text-3xl font-black mb-2">Create Society</h1>
      <p className="text-muted-foreground font-medium mb-8">Set up your community space and get the invite code.</p>

      {!code ? (
        <form onSubmit={handleCreate} className="space-y-5 flex-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Society Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sunrise Apartments"
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Address / Location</label>
            <textarea 
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Bangalore"
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all h-24 resize-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-600 text-sm font-bold rounded-xl text-center break-words">
              {errorMsg}
            </div>
          )}

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading || !name || !address}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generate Society Code'}
            </button>
          </div>
        </form>
      ) : (
        <div className="animate-slide-up text-center pt-8">
          <h2 className="text-lg font-bold text-muted-foreground mb-4 uppercase tracking-wider">Your Society Code</h2>
          <div className="bg-primary/10 border-2 border-primary border-dashed rounded-3xl p-8 mb-8 relative group">
            <span className="text-4xl font-black tracking-widest text-primary">{code}</span>
            <button 
              onClick={copyCode}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 shadow-lg rounded-full p-3 font-bold text-sm text-foreground flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              {copied ? <CheckCircle2 className="text-green-500" /> : <Copy className="text-primary" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-12">
            Share this code along with the ResQ app link with your residents and guards. They need this to connect to your building.
          </p>

          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
