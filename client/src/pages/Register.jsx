import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, User, Briefcase } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: searchParams.get('role') || 'candidate', company: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to SmartHire, ${user.name}!`);
      if (user.role === 'employer') navigate('/employer/dashboard');
      else navigate('/candidate/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --ink: #0a0c14; --ink-2: #10131f; --surface: #1e2235; --border: rgba(255,255,255,0.07); --gold: #e8c06a; --gold-2: #f5d88a; --teal: #38d9c0; --white: #f0f2f8; --muted: #7a7f9a; font-family: 'DM Sans', sans-serif; }
        body { background: var(--ink); color: var(--white); }
        a { text-decoration: none; color: inherit; }
        .auth-orb { position: fixed; border-radius: 50%; filter: blur(120px); opacity: .15; pointer-events: none; }
        .auth-orb-1 { width: 500px; height: 500px; background: #3b5bff; top: -150px; right: -150px; }
        .auth-orb-2 { width: 400px; height: 400px; background: var(--teal); bottom: -100px; left: -100px; }
        .auth-back { position: fixed; top: 24px; left: 24px; display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); transition: color .2s; z-index: 10; }
        .auth-back:hover { color: var(--white); }
        .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 80px 24px 40px; }
        .auth-card { position: relative; z-index: 1; width: 100%; max-width: 460px; background: var(--ink-2); border: 1px solid var(--border); border-radius: 24px; padding: 48px 44px; }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; }
        .auth-logo-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--teal)); box-shadow: 0 0 10px var(--teal); }
        .auth-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
        .auth-sub { font-size: 14px; color: var(--muted); margin-bottom: 32px; }
        .role-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }
        .role-btn { padding: 14px 12px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); font-size: 14px; font-weight: 500; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all .2s; font-family: 'DM Sans', sans-serif; }
        .role-btn.active { border-color: var(--gold); color: var(--gold); background: rgba(232,192,106,.08); }
        .role-btn svg { width: 20px; height: 20px; }
        .auth-label { display: block; font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 8px; }
        .auth-field { margin-bottom: 18px; }
        .auth-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; font-size: 15px; color: var(--white); outline: none; transition: border-color .2s; font-family: 'DM Sans', sans-serif; }
        .auth-input::placeholder { color: var(--muted); }
        .auth-input:focus { border-color: rgba(232,192,106,.4); }
        .auth-input-wrap { position: relative; }
        .auth-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; display: flex; align-items: center; }
        .auth-eye:hover { color: var(--white); }
        .auth-submit { width: 100%; padding: 15px; background: linear-gradient(135deg, var(--gold), var(--gold-2)); border: none; border-radius: 12px; font-size: 15px; font-weight: 700; color: #0a0c14; cursor: pointer; transition: opacity .2s, transform .15s; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .auth-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .auth-submit:disabled { opacity: .5; cursor: not-allowed; }
        .auth-footer { margin-top: 28px; text-align: center; font-size: 14px; color: var(--muted); }
        .auth-footer a { color: var(--gold); font-weight: 500; }
        .auth-footer a:hover { text-decoration: underline; }
      `}</style>

      <span className="auth-orb auth-orb-1" />
      <span className="auth-orb auth-orb-2" />
      <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to home</Link>

      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo"><span className="auth-logo-dot" /> SmartHire</div>
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-sub">Join thousands of professionals on SmartHire</p>

          <div className="role-toggle">
            <button type="button" className={`role-btn ${form.role === 'candidate' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'candidate' })}>
              <User /> Job Seeker
            </button>
            <button type="button" className={`role-btn ${form.role === 'employer' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'employer' })}>
              <Briefcase /> Employer
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input className="auth-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input className="auth-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            {form.role === 'employer' && (
              <div className="auth-field">
                <label className="auth-label">Company Name</label>
                <input className="auth-input" type="text" name="company" value={form.company} onChange={handleChange} placeholder="Acme Inc." required />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input className="auth-input" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required style={{ paddingRight: 48 }} />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </>
  );
}
