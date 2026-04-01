import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'resident';
  
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState(roleFromUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password, role);
      // Wait context updates
      if (role === 'admin') navigate('/create-society');
      else if (role === 'resident') navigate('/join');
      else navigate('/join'); // Guards also need to join a society with a code
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Make sure your password is robust.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 animate-fade-in">
      <div className="mb-10 mx-auto bg-primary/10 p-4 rounded-full">
        <ShieldAlert size={40} className="text-primary" />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black mb-2">Welcome to ResQ</h1>
        <p className="text-muted-foreground font-medium">Log in or create your account</p>
      </div>

      <form onSubmit={handleAuth} className="glass-card p-6 rounded-3xl mb-8 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">I am a</label>
          <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-xl">
            {['resident', 'admin', 'guard'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 text-xs font-bold rounded-lg capitalize transition-all
                  ${role === r ? 'bg-white dark:bg-black shadow-sm text-primary scale-105' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}
                `}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Min 6 characters"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold rounded-xl text-center break-words">
            {errorMsg}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !email || !password}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Continue</>}
        </button>
      </form>
    </div>
  );
}
