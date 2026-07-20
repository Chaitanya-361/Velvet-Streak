import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function PasswordCheck({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${met ? 'text-vs-emerald' : 'text-vs-muted/60'}`}>
      {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      {label}
    </div>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const pw = form.password;
  const hasLength = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasLength || !hasUpper || !hasNumber) {
      toast.error('Password does not meet requirements');
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.username, form.password, form.displayName);
      toast.success('Account created! Welcome to Velvet Streak 🦚');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-heading font-bold text-2xl text-vs-text mb-1">Create your account</h2>
      <p className="text-sm font-medium text-vs-muted mb-6">Start building your streaks today</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-display" className="block text-sm font-bold text-vs-text mb-1.5">Display Name</label>
          <input id="reg-display" type="text" value={form.displayName} onChange={e => update('displayName', e.target.value)} placeholder="Your Name"
            className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal transition-colors font-medium" required />
        </div>
        <div>
          <label htmlFor="reg-username" className="block text-sm font-bold text-vs-text mb-1.5">Username</label>
          <input id="reg-username" type="text" value={form.username} onChange={e => update('username', e.target.value)} placeholder="Your_name"
            className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal transition-colors font-medium" required minLength={3} maxLength={20} pattern="^[a-zA-Z0-9_]+$" />
          <p className="text-xs font-semibold text-vs-muted/70 mt-1.5">3–20 characters, letters, numbers, underscores</p>
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-bold text-vs-text mb-1.5">Email</label>
          <input id="reg-email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com"
            className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal transition-colors font-medium" required />
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-bold text-vs-text mb-1.5">Password</label>
          <div className="relative">
            <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal transition-colors pr-12 font-medium" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-vs-muted hover:text-vs-teal hover:bg-vs-surface transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
            <PasswordCheck met={hasLength} label="8+ chars" />
            <PasswordCheck met={hasUpper} label="1 uppercase" />
            <PasswordCheck met={hasNumber} label="1 number" />
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl bg-vs-teal text-white font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-vs-teal/30 hover:bg-vs-teal/90 transition-all duration-300 disabled:opacity-50">
            <UserPlus className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>

      <p className="text-center text-sm font-medium text-vs-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-vs-teal hover:text-vs-teal/80 font-bold transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
