import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, FileText, LogOut, LayoutDashboard,
  Plus, Trash2, Users, CheckCircle, XCircle, Clock, Eye
} from 'lucide-react';

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0a0c14; --ink-2: #10131f; --ink-3: #181c2e; --surface: #1e2235;
    --border: rgba(255,255,255,0.07); --gold: #e8c06a; --gold-2: #f5d88a;
    --teal: #38d9c0; --red: #f06a6a; --white: #f0f2f8; --muted: #7a7f9a;
    font-family: 'DM Sans', sans-serif;
  }
  body { background: var(--ink); color: var(--white); }
  a { text-decoration: none; color: inherit; }

  .ed-layout { display: flex; min-height: 100vh; }

  /* Sidebar */
  .ed-sidebar {
    width: 240px; flex-shrink: 0; background: var(--ink-2);
    border-right: 1px solid var(--border); display: flex;
    flex-direction: column; padding: 28px 0;
    position: sticky; top: 0; height: 100vh;
  }
  .ed-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 0 24px 32px; font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 20px;
    border-bottom: 1px solid var(--border); margin-bottom: 24px;
  }
  .ed-logo-dot {
    width: 9px; height: 9px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--teal));
    box-shadow: 0 0 8px var(--teal);
  }
  .ed-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 24px; font-size: 14px; font-weight: 500;
    color: var(--muted); cursor: pointer; transition: all .2s;
    border-left: 2px solid transparent;
  }
  .ed-nav-item:hover { color: var(--white); background: rgba(255,255,255,.03); }
  .ed-nav-item.active { color: var(--gold); border-left-color: var(--gold); background: rgba(232,192,106,.05); }
  .ed-nav-item svg { width: 17px; height: 17px; flex-shrink: 0; }
  .ed-sidebar-bottom { margin-top: auto; padding: 0 24px; }
  .ed-logout {
    display: flex; align-items: center; gap: 10px; padding: 12px 0;
    font-size: 14px; color: var(--muted); cursor: pointer;
    transition: color .2s; background: none; border: none;
    font-family: 'DM Sans', sans-serif; width: 100%;
  }
  .ed-logout:hover { color: var(--red); }

  /* Main */
  .ed-main { flex: 1; padding: 40px 48px; overflow-y: auto; }
  .ed-header { margin-bottom: 36px; display: flex; align-items: flex-start; justify-content: space-between; }
  .ed-header h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .ed-header p { font-size: 14px; color: var(--muted); margin-top: 6px; }
  .ed-post-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 22px; background: linear-gradient(135deg, var(--gold), var(--gold-2));
    border: none; border-radius: 12px; font-size: 14px; font-weight: 700;
    color: var(--ink); cursor: pointer; transition: opacity .2s, transform .15s;
    white-space: nowrap; flex-shrink: 0;
  }
  .ed-post-btn:hover { opacity: .9; transform: translateY(-1px); }

  /* Stats */
  .ed-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 36px; }
  .ed-stat-card {
    background: var(--ink-2); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px 22px;
    display: flex; align-items: flex-start; gap: 16px; transition: border-color .2s;
  }
  .ed-stat-card:hover { border-color: rgba(232,192,106,.2); }
  .ed-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ed-stat-icon svg { width: 20px; height: 20px; }
  .ed-stat-val { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .ed-stat-label { font-size: 12px; color: var(--muted); }

  /* Card */
  .ed-card { background: var(--ink-2); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-bottom: 24px; }
  .ed-card-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .ed-card-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }

  /* Table */
  .ed-table { width: 100%; border-collapse: collapse; }
  .ed-table th { padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; border-bottom: 1px solid var(--border); }
  .ed-table td { padding: 14px 20px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,.03); vertical-align: middle; }
  .ed-table tr:last-child td { border-bottom: none; }
  .ed-table tr:hover td { background: rgba(255,255,255,.02); }

  /* Status */
  .ed-status { font-size: 11px; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
  .ed-status-pending { background: rgba(255,255,255,.07); color: var(--muted); }
  .ed-status-shortlisted { background: rgba(74,222,128,.12); color: #4ade80; }
  .ed-status-rejected { background: rgba(240,106,106,.12); color: var(--red); }
  .ed-status-active { background: rgba(74,222,128,.12); color: #4ade80; }
  .ed-status-closed { background: rgba(255,255,255,.07); color: var(--muted); }

  /* Buttons */
  .ed-btn-icon { background: none; border: 1px solid var(--border); border-radius: 8px; padding: 7px; cursor: pointer; color: var(--muted); transition: all .2s; display: flex; align-items: center; }
  .ed-btn-icon:hover { border-color: var(--red); color: var(--red); background: rgba(240,106,106,.08); }
  .ed-btn-view:hover { border-color: var(--teal); color: var(--teal); background: rgba(56,217,192,.08); }
  .ed-btn-shortlist:hover { border-color: #4ade80; color: #4ade80; background: rgba(74,222,128,.08); }
  .ed-btn-reject:hover { border-color: var(--red); color: var(--red); background: rgba(240,106,106,.08); }
  .ed-actions { display: flex; gap: 6px; }

  /* Avatar */
  .ed-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--teal)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: var(--ink); flex-shrink: 0; }
  .ed-user-cell { display: flex; align-items: center; gap: 12px; }
  .ed-user-name { font-weight: 500; }
  .ed-user-email { font-size: 12px; color: var(--muted); }

  /* Post Job Form */
  .ed-form-wrap { padding: 28px; }
  .ed-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .ed-field { margin-bottom: 20px; }
  .ed-label { display: block; font-size: 12px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px; }
  .ed-input {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; font-size: 14px; color: var(--white);
    outline: none; transition: border-color .2s; font-family: 'DM Sans', sans-serif;
  }
  .ed-input:focus { border-color: rgba(232,192,106,.4); }
  .ed-input::placeholder { color: var(--muted); }
  .ed-select {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; font-size: 14px; color: var(--white);
    outline: none; font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .ed-textarea {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; font-size: 14px; color: var(--white);
    outline: none; font-family: 'DM Sans', sans-serif; resize: vertical; min-height: 120px;
  }
  .ed-textarea:focus { border-color: rgba(232,192,106,.4); }
  .ed-submit-btn {
    padding: 13px 32px; background: linear-gradient(135deg, var(--gold), var(--gold-2));
    border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
    color: var(--ink); cursor: pointer; transition: opacity .2s;
  }
  .ed-submit-btn:hover { opacity: .9; }
  .ed-submit-btn:disabled { opacity: .5; cursor: not-allowed; }

  .ed-empty { padding: 48px; text-align: center; color: var(--muted); font-size: 14px; }
  .ed-loading { padding: 48px; text-align: center; color: var(--muted); }

  @media (max-width: 1024px) { .ed-stats { grid-template-columns: repeat(2, 1fr); } .ed-main { padding: 24px; } .ed-form-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px) { .ed-sidebar { display: none; } }
`;

const emptyForm = { title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' };

export default function EmployerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm, company: user?.company || '' });
  const [posting, setPosting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsRes = await api.get('/jobs/my');
      setJobs(jobsRes.data);
      const appsArrays = await Promise.all(
        jobsRes.data.map(j => api.get(`/applications/job/${j._id}`))
      );
      setApplications(appsArrays.flatMap(r => r.data));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await api.post('/jobs', form);
      toast.success('Job posted successfully!');
      setForm({ ...emptyForm, company: user?.company || '' });
      fetchData();
      setTab('jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally { setPosting(false); }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      fetchData();
    } catch { toast.error('Failed to delete job'); }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success(`Applicant ${status}`);
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredApps = selectedJob
    ? applications.filter(a => a.job?._id === selectedJob)
    : applications;

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.isActive).length,
    totalApps: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
    { id: 'post', label: 'Post a Job', icon: <Plus /> },
    { id: 'jobs', label: 'My Jobs', icon: <Briefcase /> },
    { id: 'applicants', label: 'Applicants', icon: <Users /> },
  ];

  return (
    <>
      <style>{S}</style>
      <div className="ed-layout">
        {/* Sidebar */}
        <aside className="ed-sidebar">
          <div className="ed-logo">
            <span className="ed-logo-dot" /> SmartHire
          </div>
          {navItems.map(n => (
            <div key={n.id} className={`ed-nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              {n.icon} {n.label}
            </div>
          ))}
          <div className="ed-sidebar-bottom">
            <button className="ed-logout" onClick={handleLogout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="ed-main">
          <div className="ed-header">
            <div>
              <h1>{navItems.find(n => n.id === tab)?.label}</h1>
              <p>Welcome back, {user?.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            {tab !== 'post' && (
              <button className="ed-post-btn" onClick={() => setTab('post')}>
                <Plus size={16} /> Post a Job
              </button>
            )}
          </div>

          {loading && <div className="ed-loading">Loading...</div>}

          {/* Overview */}
          {!loading && tab === 'overview' && (
            <>
              <div className="ed-stats">
                {[
                  { label: 'Total Jobs', val: stats.totalJobs, icon: <Briefcase />, color: '#6c8aff', bg: 'rgba(108,138,255,.12)' },
                  { label: 'Active Jobs', val: stats.activeJobs, icon: <CheckCircle />, color: '#4ade80', bg: 'rgba(74,222,128,.12)' },
                  { label: 'Total Applicants', val: stats.totalApps, icon: <Users />, color: '#e8c06a', bg: 'rgba(232,192,106,.12)' },
                  { label: 'Shortlisted', val: stats.shortlisted, icon: <FileText />, color: '#38d9c0', bg: 'rgba(56,217,192,.12)' },
                ].map(s => (
                  <div key={s.label} className="ed-stat-card">
                    <div className="ed-stat-icon" style={{ background: s.bg }}>
                      <span style={{ color: s.color }}>{s.icon}</span>
                    </div>
                    <div>
                      <div className="ed-stat-val">{s.val}</div>
                      <div className="ed-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ed-card">
                <div className="ed-card-head">
                  <span className="ed-card-title">Recent Job Postings</span>
                  <span style={{ fontSize: 13, color: 'var(--gold)', cursor: 'pointer' }} onClick={() => setTab('jobs')}>View all →</span>
                </div>
                <table className="ed-table">
                  <thead>
                    <tr><th>Title</th><th>Location</th><th>Type</th><th>Applicants</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {jobs.length === 0 && <tr><td colSpan={5}><div className="ed-empty">No jobs posted yet. Post your first job!</div></td></tr>}
                    {jobs.slice(0, 5).map(j => (
                      <tr key={j._id}>
                        <td style={{ fontWeight: 500 }}>{j.title}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{j.location || 'Remote'}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{j.type || 'Full-time'}</td>
                        <td style={{ color: 'var(--teal)', fontWeight: 600 }}>
                          {applications.filter(a => a.job?._id === j._id).length}
                        </td>
                        <td>
                          <span className={`ed-status ed-status-${j.isActive ? 'active' : 'closed'}`}>
                            {j.isActive ? 'Active' : 'Closed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ed-card">
                <div className="ed-card-head">
                  <span className="ed-card-title">Recent Applicants</span>
                  <span style={{ fontSize: 13, color: 'var(--gold)', cursor: 'pointer' }} onClick={() => setTab('applicants')}>View all →</span>
                </div>
                <table className="ed-table">
                  <thead>
                    <tr><th>Candidate</th><th>Applied For</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {applications.length === 0 && <tr><td colSpan={4}><div className="ed-empty">No applicants yet.</div></td></tr>}
                    {applications.slice(0, 5).map(a => (
                      <tr key={a._id}>
                        <td>
                          <div className="ed-user-cell">
                            <div className="ed-avatar">{a.candidate?.name?.[0] || '?'}</div>
                            <div>
                              <div className="ed-user-name">{a.candidate?.name || '—'}</div>
                              <div className="ed-user-email">{a.candidate?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.job?.title || '—'}</td>
                        <td><span className={`ed-status ed-status-${a.status}`}>{a.status}</span></td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Post Job */}
          {!loading && tab === 'post' && (
            <div className="ed-card">
              <div className="ed-card-head">
                <span className="ed-card-title">Post a New Job</span>
              </div>
              <div className="ed-form-wrap">
                <form onSubmit={handlePostJob}>
                  <div className="ed-form-grid">
                    <div className="ed-field">
                      <label className="ed-label">Job Title *</label>
                      <input className="ed-input" placeholder="e.g. Senior React Developer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="ed-field">
                      <label className="ed-label">Company *</label>
                      <input className="ed-input" placeholder="Company name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required />
                    </div>
                    <div className="ed-field">
                      <label className="ed-label">Location</label>
                      <input className="ed-input" placeholder="e.g. Bangalore / Remote" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div className="ed-field">
                      <label className="ed-label">Job Type</label>
                      <select className="ed-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                        <option>Remote</option>
                      </select>
                    </div>
                    <div className="ed-field">
                      <label className="ed-label">Salary Range</label>
                      <input className="ed-input" placeholder="e.g. ₹12–18 LPA" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                    </div>
                  </div>
                  <div className="ed-field">
                    <label className="ed-label">Job Description *</label>
                    <textarea className="ed-textarea" placeholder="Describe the role, responsibilities, and what a typical day looks like..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                  </div>
                  <div className="ed-field">
                    <label className="ed-label">Requirements</label>
                    <textarea className="ed-textarea" style={{ minHeight: 80 }} placeholder="Skills, experience, qualifications required..." value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
                  </div>
                  <button className="ed-submit-btn" type="submit" disabled={posting}>
                    {posting ? 'Posting...' : 'Post Job →'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* My Jobs */}
          {!loading && tab === 'jobs' && (
            <div className="ed-card">
              <div className="ed-card-head">
                <span className="ed-card-title">My Job Postings ({jobs.length})</span>
              </div>
              <table className="ed-table">
                <thead>
                  <tr><th>Title</th><th>Location</th><th>Type</th><th>Salary</th><th>Applicants</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {jobs.length === 0 && <tr><td colSpan={7}><div className="ed-empty">No jobs posted yet.</div></td></tr>}
                  {jobs.map(j => (
                    <tr key={j._id}>
                      <td style={{ fontWeight: 500 }}>{j.title}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{j.location || 'Remote'}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{j.type || '—'}</td>
                      <td style={{ color: 'var(--gold)', fontSize: 13 }}>{j.salary || '—'}</td>
                      <td>
                        <span
                          style={{ color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => { setSelectedJob(j._id); setTab('applicants'); }}
                        >
                          {applications.filter(a => a.job?._id === j._id).length} →
                        </span>
                      </td>
                      <td><span className={`ed-status ed-status-${j.isActive ? 'active' : 'closed'}`}>{j.isActive ? 'Active' : 'Closed'}</span></td>
                      <td>
                        <div className="ed-actions">
                          <button className="ed-btn-icon" title="Delete" onClick={() => handleDeleteJob(j._id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Applicants */}
          {!loading && tab === 'applicants' && (
            <div className="ed-card">
              <div className="ed-card-head">
                <span className="ed-card-title">
                  {selectedJob ? `Applicants for: ${jobs.find(j => j._id === selectedJob)?.title}` : `All Applicants (${applications.length})`}
                </span>
                {selectedJob && (
                  <button
                    style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setSelectedJob(null)}
                  >
                    ← Show all
                  </button>
                )}
              </div>

              {jobs.length > 1 && (
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedJob(null)}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, border: '1px solid var(--border)', background: selectedJob ? 'transparent' : 'rgba(232,192,106,.1)', color: selectedJob ? 'var(--muted)' : 'var(--gold)', cursor: 'pointer' }}
                  >
                    All
                  </button>
                  {jobs.map(j => (
                    <button
                      key={j._id}
                      onClick={() => setSelectedJob(j._id)}
                      style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, border: '1px solid var(--border)', background: selectedJob === j._id ? 'rgba(232,192,106,.1)' : 'transparent', color: selectedJob === j._id ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer' }}
                    >
                      {j.title}
                    </button>
                  ))}
                </div>
              )}

              <table className="ed-table">
                <thead>
                  <tr><th>Candidate</th><th>Applied For</th><th>Status</th><th>Applied</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredApps.length === 0 && <tr><td colSpan={5}><div className="ed-empty">No applicants yet.</div></td></tr>}
                  {filteredApps.map(a => (
                    <tr key={a._id}>
                      <td>
                        <div className="ed-user-cell">
                          <div className="ed-avatar">{a.candidate?.name?.[0] || '?'}</div>
                          <div>
                            <div className="ed-user-name">{a.candidate?.name || '—'}</div>
                            <div className="ed-user-email">{a.candidate?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.job?.title || '—'}</td>
                      <td><span className={`ed-status ed-status-${a.status}`}>{a.status}</span></td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="ed-actions">
                          <button
                            className="ed-btn-icon ed-btn-shortlist"
                            title="Shortlist"
                            disabled={a.status === 'shortlisted'}
                            onClick={() => handleStatusChange(a._id, 'shortlisted')}
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            className="ed-btn-icon ed-btn-reject"
                            title="Reject"
                            disabled={a.status === 'rejected'}
                            onClick={() => handleStatusChange(a._id, 'rejected')}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}