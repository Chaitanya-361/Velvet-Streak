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
      <p className="text-sm font-medium text-vs-muted mb-6">Sign in to continue your streaks</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-bold text-vs-text mb-1.5">Email</label>
          <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal transition-colors font-medium" required />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-bold text-vs-text">Password</label>
          </div>
          <div className="relative">
            <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal transition-colors pr-12 font-medium" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-vs-muted hover:text-vs-teal hover:bg-vs-surface transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl bg-vs-teal text-white font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-vs-teal/30 hover:bg-vs-teal/90 transition-all duration-300 disabled:opacity-50">
            <LogIn className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>

      <p className="text-center text-sm font-medium text-vs-muted mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-vs-teal hover:text-vs-teal/80 font-bold transition-colors">Sign up</Link>
      </p>
    </div>
  );
}
