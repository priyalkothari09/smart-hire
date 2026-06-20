import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'employer') navigate('/employer/dashboard');
      else navigate('/candidate/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0a0c14; --ink-2: #10131f; --surface: #1e2235;
          --border: rgba(255,255,255,0.07); --gold: #e8c06a; --gold-2: #f5d88a;
          --teal: #38d9c0; --white: #f0f2f8; --muted: #7a7f9a;
          font-family: 'DM Sans', sans-serif;
        }
        body { background: var(--ink); color: var(--white); }
        a { text-decoration: none; color: inherit; }
        .auth-page { min-height: 100vh; background: var(--ink); display: flex; align-items: center; justify-content: center; padding: 24px; position: relative; overflow: hidden; }
        .auth-orb { position: fixed; border-radius: 50%; filter: blur(120px); opacity: .15; pointer-events: none; }
        .auth-orb-1 { width: 500px; height: 500px; background: #3b5bff; top: -150px; left: -150px; }
        .auth-orb-2 { width: 400px; height: 400px; background: var(--gold); bottom: -100px; right: -100px; }
        .auth-back { position: fixed; top: 24px; left: 24px; display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); transition: color .2s; z-index: 10; }
        .auth-back:hover { color: var(--white); }
        .auth-card { position: relative; z-index: 1; width: 100%; max-width: 440px; background: var(--ink-2); border: 1px solid var(--border); border-radius: 24px; padding: 48px 44px; }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; }
        .auth-logo-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--teal)); box-shadow: 0 0 10px var(--teal); }
        .auth-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
        .auth-sub { font-size: 14px; color: var(--muted); margin-bottom: 36px; }
        .auth-label { display: block; font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 8px; }
        .auth-field { margin-bottom: 20px; }
        .auth-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; font-size: 15px; color: var(--white); outline: none; transition: border-color .2s; font-family: 'DM Sans', sans-serif; }
        .auth-input::placeholder { color: var(--muted); }
        .auth-input:focus { border-color: rgba(232,192,106,.4); }
        .auth-input-wrap { position: relative; }
        .auth-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; display: flex; align-items: center; padding: 4px; }
        .auth-eye:hover { color: var(--white); }
        .auth-submit { width: 100%; padding: 15px; background: linear-gradient(135deg, var(--gold), var(--gold-2)); border: none; border-radius: 12px; font-size: 15px; font-weight: 700; color: #0a0c14; cursor: pointer; transition: opacity .2s, transform .15s; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .auth-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .auth-submit:disabled { opacity: .5; cursor: not-allowed; }
        .auth-footer { margin-top: 28px; text-align: center; font-size: 14px; color: var(--muted); }
        .auth-footer a { color: var(--gold); font-weight: 500; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }
      `}</style>

      <span className="auth-orb auth-orb-1" />
      <span className="auth-orb auth-orb-2" />
      <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to home</Link>

      <div className="auth-card">
        <div className="auth-logo"><span className="auth-logo-dot" /> SmartHire</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue to your dashboard</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email address</label>
            <input className="auth-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <input className="auth-input" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required style={{ paddingRight: 48 }} />
              <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/register">Create one free</Link></p>
      </div>
    </>
  );
}