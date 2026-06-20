import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Users, Briefcase, FileText, TrendingUp, LogOut, Trash2, UserX, LayoutDashboard, BarChart3 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --ink: #0a0c14; --ink-2: #10131f; --ink-3: #181c2e; --surface: #1e2235; --border: rgba(255,255,255,0.07); --gold: #e8c06a; --gold-2: #f5d88a; --teal: #38d9c0; --red: #f06a6a; --white: #f0f2f8; --muted: #7a7f9a; font-family: 'DM Sans', sans-serif; }
  body { background: var(--ink); color: var(--white); }
  a { text-decoration: none; color: inherit; }
  .ad-layout { display: flex; min-height: 100vh; }
  .ad-sidebar { width: 240px; flex-shrink: 0; background: var(--ink-2); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 28px 0; position: sticky; top: 0; height: 100vh; }
  .ad-logo { display: flex; align-items: center; gap: 10px; padding: 0 24px 32px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
  .ad-logo-dot { width: 9px; height: 9px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--teal)); box-shadow: 0 0 8px var(--teal); }
  .ad-badge { font-size: 10px; background: rgba(232,192,106,.15); color: var(--gold); padding: 2px 8px; border-radius: 999px; margin-left: 4px; font-weight: 600; letter-spacing: .5px; }
  .ad-nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 24px; font-size: 14px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all .2s; border-left: 2px solid transparent; }
  .ad-nav-item:hover { color: var(--white); background: rgba(255,255,255,.03); }
  .ad-nav-item.active { color: var(--gold); border-left-color: var(--gold); background: rgba(232,192,106,.05); }
  .ad-nav-item svg { width: 17px; height: 17px; flex-shrink: 0; }
  .ad-sidebar-bottom { margin-top: auto; padding: 0 24px; }
  .ad-logout { display: flex; align-items: center; gap: 10px; padding: 12px 0; font-size: 14px; color: var(--muted); cursor: pointer; transition: color .2s; background: none; border: none; font-family: 'DM Sans', sans-serif; width: 100%; }
  .ad-logout:hover { color: var(--red); }
  .ad-main { flex: 1; padding: 40px 48px; overflow-y: auto; }
  .ad-header { margin-bottom: 36px; }
  .ad-header h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .ad-header p { font-size: 14px; color: var(--muted); margin-top: 6px; }
  .ad-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 36px; }
  .ad-stat-card { background: var(--ink-2); border: 1px solid var(--border); border-radius: 16px; padding: 24px 22px; display: flex; align-items: flex-start; gap: 16px; transition: border-color .2s; }
  .ad-stat-card:hover { border-color: rgba(232,192,106,.2); }
  .ad-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ad-stat-icon svg { width: 20px; height: 20px; }
  .ad-stat-val { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .ad-stat-label { font-size: 12px; color: var(--muted); }
  .ad-table-card { background: var(--ink-2); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
  .ad-table-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .ad-table-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
  .ad-table { width: 100%; border-collapse: collapse; }
  .ad-table th { padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; border-bottom: 1px solid var(--border); }
  .ad-table td { padding: 14px 20px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,.03); vertical-align: middle; }
  .ad-table tr:last-child td { border-bottom: none; }
  .ad-table tr:hover td { background: rgba(255,255,255,.02); }
  .ad-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--teal)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: var(--ink); flex-shrink: 0; }
  .ad-user-cell { display: flex; align-items: center; gap: 12px; }
  .ad-user-name { font-weight: 500; }
  .ad-user-email { font-size: 12px; color: var(--muted); }
  .ad-badge-role { font-size: 11px; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
  .ad-badge-candidate { background: rgba(56,217,192,.12); color: var(--teal); }
  .ad-badge-employer { background: rgba(232,192,106,.12); color: var(--gold); }
  .ad-badge-admin { background: rgba(108,138,255,.12); color: #6c8aff; }
  .ad-active-dot { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
  .ad-active-dot::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; }
  .ad-inactive-dot { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
  .ad-inactive-dot::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--muted); display: inline-block; }
  .ad-btn-icon { background: none; border: 1px solid var(--border); border-radius: 8px; padding: 7px; cursor: pointer; color: var(--muted); transition: all .2s; display: flex; align-items: center; }
  .ad-btn-icon:hover { border-color: var(--red); color: var(--red); background: rgba(240,106,106,.08); }
  .ad-btn-deactivate:hover { border-color: var(--gold); color: var(--gold); background: rgba(232,192,106,.08); }
  .ad-actions { display: flex; gap: 6px; }
  .ad-empty { padding: 48px; text-align: center; color: var(--muted); font-size: 14px; }
  .ad-loading { padding: 48px; text-align: center; color: var(--muted); }

  /* Analytics */
  .ad-chart-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-bottom: 20px; }
  .ad-chart-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .ad-chart-card { background: var(--ink-2); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
  .ad-chart-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .ad-chart-sub { font-size: 12px; color: var(--muted); margin-bottom: 18px; }
  .ad-chart-wrap { position: relative; height: 260px; }
  .ad-chart-wrap-sm { position: relative; height: 220px; }
  .ad-funnel-row { display: flex; flex-direction: column; gap: 10px; }
  .ad-funnel-item { display: flex; align-items: center; gap: 14px; }
  .ad-funnel-label { width: 90px; font-size: 12px; color: var(--muted); flex-shrink: 0; }
  .ad-funnel-bar-track { flex: 1; height: 28px; background: var(--surface); border-radius: 8px; overflow: hidden; }
  .ad-funnel-bar-fill { height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; transition: width .8s ease; }
  .ad-funnel-bar-fill span { font-size: 12px; font-weight: 700; color: var(--ink); }

  @media (max-width: 1024px) { .ad-stats { grid-template-columns: repeat(2, 1fr); } .ad-main { padding: 24px; } .ad-chart-grid, .ad-chart-grid-2 { grid-template-columns: 1fr; } }
  @media (max-width: 768px) { .ad-sidebar { display: none; } }
`;

// ─── Chart.js shared theming ────────────────────────────────────────────────
const CHART_COLORS = {
  gold: '#e8c06a', teal: '#38d9c0', blue: '#6c8aff', green: '#4ade80', red: '#f06a6a', muted: '#7a7f9a',
};

const baseGrid = { color: 'rgba(255,255,255,.05)' };
const baseTicks = { color: '#7a7f9a', font: { family: 'DM Sans', size: 11 } };

const lineOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#10131f', borderColor: 'rgba(255,255,255,.1)', borderWidth: 1, padding: 10, titleFont: { family: 'Syne' }, bodyFont: { family: 'DM Sans' } } },
  scales: {
    x: { grid: { display: false }, ticks: baseTicks },
    y: { grid: baseGrid, ticks: baseTicks, beginAtZero: true },
  },
};

const barOptions = {
  indexAxis: 'y',
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#10131f', borderColor: 'rgba(255,255,255,.1)', borderWidth: 1, padding: 10 } },
  scales: {
    x: { grid: baseGrid, ticks: baseTicks, beginAtZero: true },
    y: { grid: { display: false }, ticks: { ...baseTicks, font: { family: 'DM Sans', size: 12 } } },
  },
};

const doughnutOptions = {
  responsive: true, maintainAspectRatio: false, cutout: '68%',
  plugins: {
    legend: { position: 'bottom', labels: { color: '#7a7f9a', font: { family: 'DM Sans', size: 12 }, padding: 16, usePointStyle: true, pointStyle: 'circle' } },
    tooltip: { backgroundColor: '#10131f', borderColor: 'rgba(255,255,255,.1)', borderWidth: 1, padding: 10 },
  },
};

// ─── Helpers to derive chart data from raw applications/jobs/users ────────
function buildApplicationsOverTime(applications) {
  // Group by day for the last 14 days
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const counts = Object.fromEntries(days.map(d => [d, 0]));
  applications.forEach(a => {
    const day = new Date(a.createdAt).toISOString().slice(0, 10);
    if (counts[day] !== undefined) counts[day]++;
  });
  return {
    labels: days.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    data: days.map(d => counts[d]),
  };
}

function buildTopSkills(jobs, topN = 6) {
  const freq = {};
  jobs.forEach(j => (j.skills || []).forEach(s => { freq[s] = (freq[s] || 0) + 1; }));
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, topN);
  return {
    labels: sorted.map(([s]) => s),
    data: sorted.map(([, c]) => c),
  };
}

function buildEmployerActivity(jobs, topN = 5) {
  const freq = {};
  jobs.forEach(j => {
    const name = j.employer?.company || j.employer?.name || j.company || 'Unknown';
    freq[name] = (freq[name] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, topN);
  return {
    labels: sorted.map(([s]) => s),
    data: sorted.map(([, c]) => c),
  };
}

function buildFunnel(applications) {
  const total = applications.length;
  const applied = total;
  const reviewed = applications.filter(a => ['reviewed', 'shortlisted', 'rejected'].includes(a.status)).length;
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
  return [
    { label: 'Applied', value: applied, color: CHART_COLORS.blue },
    { label: 'Reviewed', value: reviewed, color: CHART_COLORS.gold },
    { label: 'Shortlisted', value: shortlisted, color: CHART_COLORS.green },
  ];
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, j, a] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/jobs'),
        api.get('/admin/applications'),
      ]);
      setStats(s.data); setUsers(u.data); setJobs(j.data); setApplications(a.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/${type}/${id}`);
      toast.success('Deleted successfully');
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };

  const handleDeactivate = async (id) => {
    try {
      await api.put(`/admin/users/${id}/deactivate`);
      toast.success('User deactivated');
      fetchAll();
    } catch { toast.error('Failed to deactivate'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 /> },
    { id: 'users', label: 'Users', icon: <Users /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase /> },
    { id: 'applications', label: 'Applications', icon: <FileText /> },
  ];

  // ── Derived chart data (memoized so it doesn't recompute every render) ──
  const appsOverTime = useMemo(() => buildApplicationsOverTime(applications), [applications]);
  const topSkills = useMemo(() => buildTopSkills(jobs), [jobs]);
  const employerActivity = useMemo(() => buildEmployerActivity(jobs), [jobs]);
  const funnel = useMemo(() => buildFunnel(applications), [applications]);

  const userBreakdownData = stats ? {
    labels: ['Candidates', 'Employers', 'Admins'],
    datasets: [{
      data: [
        stats.totalCandidates || 0,
        stats.totalEmployers || 0,
        (stats.totalUsers || 0) - (stats.totalCandidates || 0) - (stats.totalEmployers || 0),
      ],
      backgroundColor: [CHART_COLORS.teal, CHART_COLORS.gold, CHART_COLORS.blue],
      borderWidth: 0,
    }],
  } : null;

  const appsLineData = {
    labels: appsOverTime.labels,
    datasets: [{
      label: 'Applications',
      data: appsOverTime.data,
      borderColor: CHART_COLORS.gold,
      backgroundColor: 'rgba(232,192,106,.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: CHART_COLORS.gold,
      pointBorderColor: CHART_COLORS.gold,
    }],
  };

  const skillsBarData = {
    labels: topSkills.labels,
    datasets: [{
      label: 'Demand',
      data: topSkills.data,
      backgroundColor: CHART_COLORS.teal,
      borderRadius: 6,
      barThickness: 18,
    }],
  };

  const employerBarData = {
    labels: employerActivity.labels,
    datasets: [{
      label: 'Jobs Posted',
      data: employerActivity.data,
      backgroundColor: CHART_COLORS.blue,
      borderRadius: 6,
      barThickness: 18,
    }],
  };

  const maxFunnel = funnel[0]?.value || 1;

  return (
    <>
      <style>{S}</style>
      <div className="ad-layout">
        <aside className="ad-sidebar">
          <div className="ad-logo">
            <span className="ad-logo-dot" /> SmartHire
            <span className="ad-badge">ADMIN</span>
          </div>
          {navItems.map(n => (
            <div key={n.id} className={`ad-nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              {n.icon} {n.label}
            </div>
          ))}
          <div className="ad-sidebar-bottom">
            <button className="ad-logout" onClick={handleLogout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        <main className="ad-main">
          <div className="ad-header">
            <h1>{navItems.find(n => n.id === tab)?.label}</h1>
            <p>Welcome back, {user?.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {loading && <div className="ad-loading">Loading...</div>}

          {/* ── Overview ── */}
          {!loading && tab === 'overview' && stats && (
            <>
              <div className="ad-stats">
                {[
                  { label: 'Total Users', val: stats.totalUsers, icon: <Users />, color: '#6c8aff', bg: 'rgba(108,138,255,.12)' },
                  { label: 'Active Jobs', val: stats.activeJobs, icon: <Briefcase />, color: '#e8c06a', bg: 'rgba(232,192,106,.12)' },
                  { label: 'Applications', val: stats.totalApplications, icon: <FileText />, color: '#38d9c0', bg: 'rgba(56,217,192,.12)' },
                  { label: 'Shortlisted', val: stats.shortlisted, icon: <TrendingUp />, color: '#4ade80', bg: 'rgba(74,222,128,.12)' },
                ].map(s => (
                  <div key={s.label} className="ad-stat-card">
                    <div className="ad-stat-icon" style={{ background: s.bg }}>
                      <span style={{ color: s.color }}>{s.icon}</span>
                    </div>
                    <div>
                      <div className="ad-stat-val">{s.val}</div>
                      <div className="ad-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="ad-stat-card" style={{ flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px' }}>User Breakdown</div>
                  {[
                    { label: 'Candidates', val: stats.totalCandidates, color: 'var(--teal)' },
                    { label: 'Employers', val: stats.totalEmployers, color: 'var(--gold)' },
                    { label: 'Total Resumes', val: stats.totalResumes, color: '#6c8aff' },
                    { label: 'Rejected Apps', val: stats.rejected, color: 'var(--red)' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 14, color: 'var(--muted)' }}>{r.label}</span>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
                <div className="ad-stat-card" style={{ flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px' }}>Recent Users</div>
                  {users.slice(0, 4).map(u => (
                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="ad-avatar">{u.name[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Analytics (Chart.js) ── */}
          {!loading && tab === 'analytics' && (
            <>
              <div className="ad-chart-grid">
                <div className="ad-chart-card">
                  <div className="ad-chart-title">Applications Over Time</div>
                  <div className="ad-chart-sub">Last 14 days</div>
                  <div className="ad-chart-wrap">
                    <Line data={appsLineData} options={lineOptions} />
                  </div>
                </div>
                <div className="ad-chart-card">
                  <div className="ad-chart-title">User Breakdown</div>
                  <div className="ad-chart-sub">By role across the platform</div>
                  <div className="ad-chart-wrap">
                    {userBreakdownData && <Doughnut data={userBreakdownData} options={doughnutOptions} />}
                  </div>
                </div>
              </div>

              <div className="ad-chart-grid-2">
                <div className="ad-chart-card">
                  <div className="ad-chart-title">Hiring Funnel</div>
                  <div className="ad-chart-sub">Applied → Reviewed → Shortlisted</div>
                  <div className="ad-funnel-row" style={{ marginTop: 8 }}>
                    {funnel.map(f => (
                      <div key={f.label} className="ad-funnel-item">
                        <div className="ad-funnel-label">{f.label}</div>
                        <div className="ad-funnel-bar-track">
                          <div
                            className="ad-funnel-bar-fill"
                            style={{ width: `${Math.max((f.value / maxFunnel) * 100, f.value > 0 ? 8 : 0)}%`, background: f.color }}
                          >
                            {f.value > 0 && <span>{f.value}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ad-chart-card">
                  <div className="ad-chart-title">Top Skills in Demand</div>
                  <div className="ad-chart-sub">Most requested across active job posts</div>
                  <div className="ad-chart-wrap-sm">
                    {topSkills.labels.length > 0
                      ? <Bar data={skillsBarData} options={barOptions} />
                      : <div className="ad-empty" style={{ padding: 24 }}>No skill data yet</div>
                    }
                  </div>
                </div>
              </div>

              <div className="ad-chart-card" style={{ marginTop: 20 }}>
                <div className="ad-chart-title">Employer Activity</div>
                <div className="ad-chart-sub">Jobs posted per company</div>
                <div className="ad-chart-wrap-sm">
                  {employerActivity.labels.length > 0
                    ? <Bar data={employerBarData} options={barOptions} />
                    : <div className="ad-empty" style={{ padding: 24 }}>No employer data yet</div>
                  }
                </div>
              </div>
            </>
          )}

          {/* ── Users ── */}
          {!loading && tab === 'users' && (
            <div className="ad-table-card">
              <div className="ad-table-head">
                <span className="ad-table-title">All Users ({users.length})</span>
              </div>
              <table className="ad-table">
                <thead>
                  <tr><th>User</th><th>Role</th><th>Company</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="ad-user-cell">
                          <div className="ad-avatar">{u.name[0]}</div>
                          <div>
                            <div className="ad-user-name">{u.name}</div>
                            <div className="ad-user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`ad-badge-role ad-badge-${u.role}`}>{u.role}</span></td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{u.company || '—'}</td>
                      <td>{u.isActive ? <span className="ad-active-dot">Active</span> : <span className="ad-inactive-dot">Inactive</span>}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <div className="ad-actions">
                            <button className="ad-btn-icon ad-btn-deactivate" title="Deactivate" onClick={() => handleDeactivate(u._id)}><UserX size={14} /></button>
                            <button className="ad-btn-icon" title="Delete" onClick={() => handleDelete(u._id, 'users')}><Trash2 size={14} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Jobs ── */}
          {!loading && tab === 'jobs' && (
            <div className="ad-table-card">
              <div className="ad-table-head">
                <span className="ad-table-title">All Jobs ({jobs.length})</span>
              </div>
              <table className="ad-table">
                <thead>
                  <tr><th>Job Title</th><th>Company</th><th>Employer</th><th>Status</th><th>Posted</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {jobs.length === 0 && <tr><td colSpan={6}><div className="ad-empty">No jobs found</div></td></tr>}
                  {jobs.map(j => (
                    <tr key={j._id}>
                      <td style={{ fontWeight: 500 }}>{j.title}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{j.company}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{j.employer?.name || '—'}</td>
                      <td>{j.isActive ? <span className="ad-active-dot">Active</span> : <span className="ad-inactive-dot">Closed</span>}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                      <td><button className="ad-btn-icon" onClick={() => handleDelete(j._id, 'jobs')}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Applications ── */}
          {!loading && tab === 'applications' && (
            <div className="ad-table-card">
              <div className="ad-table-head">
                <span className="ad-table-title">All Applications ({applications.length})</span>
              </div>
              <table className="ad-table">
                <thead>
                  <tr><th>Candidate</th><th>Job</th><th>Company</th><th>Status</th><th>Applied</th></tr>
                </thead>
                <tbody>
                  {applications.length === 0 && <tr><td colSpan={5}><div className="ad-empty">No applications found</div></td></tr>}
                  {applications.map(a => (
                    <tr key={a._id}>
                      <td>
                        <div className="ad-user-cell">
                          <div className="ad-avatar">{a.candidate?.name?.[0] || '?'}</div>
                          <div>
                            <div className="ad-user-name">{a.candidate?.name || '—'}</div>
                            <div className="ad-user-email">{a.candidate?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{a.job?.title || '—'}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.job?.company || '—'}</td>
                      <td>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 600, background: a.status === 'shortlisted' ? 'rgba(74,222,128,.12)' : a.status === 'rejected' ? 'rgba(240,106,106,.12)' : 'rgba(255,255,255,.07)', color: a.status === 'shortlisted' ? '#4ade80' : a.status === 'rejected' ? 'var(--red)' : 'var(--muted)' }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
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