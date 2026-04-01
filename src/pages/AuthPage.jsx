import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signUp, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form fields
  const [role, setRole] = useState('resident');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If user becomes authenticated, router (App.jsx) will automatically intercept to push them to correct page, 
  // but we can preemptively redirect if context catches it early to avoid flicker.
  useEffect(() => {
    if (user) {
      if (!user.society_id) {
        if (user.role === 'admin') navigate('/create-society');
        else navigate('/join');
      } else {
        if (user.role === 'guard') navigate('/guard');
        else navigate('/home');
      }
    }
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) throw new Error("Please enter your full name");
        await signUp(name, email, password, role);
      }
      // On success, useEffect takes over the routing when context updates the user!
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 animate-fade-in relative">
      <div className="mb-8 mx-auto bg-primary/10 p-4 rounded-full">
        <ShieldAlert size={40} className="text-primary" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="text-muted-foreground font-medium">Safety starts right here.</p>
      </div>

      <div className="flex bg-muted p-1 rounded-xl mb-6 mx-auto w-full max-w-xs shadow-inner">
        <button 
          onClick={() => { setIsLogin(false); setErrorMsg(''); }}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-black text-primary shadow-sm' : 'text-muted-foreground'}`}
        >
          Sign Up
        </button>
        <button 
          onClick={() => { setIsLogin(true); setErrorMsg(''); }}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-black text-primary shadow-sm' : 'text-muted-foreground'}`}
        >
          Log In
        </button>
      </div>

      <form onSubmit={handleAuth} className="glass-card p-6 rounded-3xl mb-8 space-y-4 shadow-xl">
        {!isLogin && (
          <div className="animate-slide-up">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">I am a</label>
            <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-xl mb-4">
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
            
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Full Name</label>
            <input 
              type="text" 
              required={!isLogin}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mb-4"
              placeholder="e.g. John Doe"
            />
          </div>
        )}

        <div className="animate-slide-up">
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

        <div className="animate-slide-up">
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
          <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold rounded-xl text-center break-words animate-slide-up">
            {errorMsg}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !email || !password || (!isLogin && !name)}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 mt-6"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <>{isLogin ? 'Log In Now' : 'Create Account'} <ArrowRight size={20} /></>}
        </button>
      </form>
    </div>
  );
}
