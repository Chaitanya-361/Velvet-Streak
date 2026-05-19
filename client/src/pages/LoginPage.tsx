import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🦚');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-heading font-bold text-2xl text-vs-text mb-1">Welcome back</h2>
      <p className="text-sm text-vs-muted mb-6">Sign in to continue your streaks</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-vs-text mb-1.5">Email</label>
          <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text placeholder-vs-muted/50 focus:border-vs-feather focus:ring-1 focus:ring-vs-feather transition-colors" required />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-vs-text">Password</label>
          </div>
          <div className="relative">
            <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text placeholder-vs-muted/50 focus:border-vs-feather focus:ring-1 focus:ring-vs-feather transition-colors pr-12" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-vs-muted hover:text-vs-feather transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-vs-teal to-vs-feather text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-vs-teal/30 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50">
          <LogIn className="w-4 h-4" />
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-vs-muted mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-vs-feather hover:text-vs-gold font-medium transition-colors">Sign up</Link>
      </p>
    </div>
  );
}
