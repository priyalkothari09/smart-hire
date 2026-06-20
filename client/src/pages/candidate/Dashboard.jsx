import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, FileText, LogOut, Upload,
  CheckCircle, Clock, XCircle, LayoutDashboard,
  Search, ChevronRight, User, Star, Zap, X, TrendingUp
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

  .cd-layout { display: flex; min-height: 100vh; }

  /* Sidebar */
  .cd-sidebar {
    width: 240px; flex-shrink: 0; background: var(--ink-2);
    border-right: 1px solid var(--border); display: flex;
    flex-direction: column; padding: 28px 0;
    position: sticky; top: 0; height: 100vh;
  }
  .cd-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 0 24px 32px; font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 20px;
    border-bottom: 1px solid var(--border); margin-bottom: 24px;
  }
  .cd-logo-dot {
    width: 9px; height: 9px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--teal));
    box-shadow: 0 0 8px var(--teal);
  }
  .cd-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 24px; font-size: 14px; font-weight: 500;
    color: var(--muted); cursor: pointer; transition: all .2s;
    border-left: 2px solid transparent;
  }
  .cd-nav-item:hover { color: var(--white); background: rgba(255,255,255,.03); }
  .cd-nav-item.active { color: var(--gold); border-left-color: var(--gold); background: rgba(232,192,106,.05); }
  .cd-nav-item svg { width: 17px; height: 17px; flex-shrink: 0; }
  .cd-sidebar-bottom { margin-top: auto; padding: 0 24px; }
  .cd-logout {
    display: flex; align-items: center; gap: 10px; padding: 12px 0;
    font-size: 14px; color: var(--muted); cursor: pointer;
    transition: color .2s; background: none; border: none;
    font-family: 'DM Sans', sans-serif; width: 100%;
  }
  .cd-logout:hover { color: var(--red); }

  /* Main */
  .cd-main { flex: 1; padding: 40px 48px; overflow-y: auto; }
  .cd-header { margin-bottom: 36px; }
  .cd-header h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .cd-header p { font-size: 14px; color: var(--muted); margin-top: 6px; }

  /* Stats */
  .cd-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 36px; }
  .cd-stat-card {
    background: var(--ink-2); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px 22px;
    display: flex; align-items: flex-start; gap: 16px;
    transition: border-color .2s;
  }
  .cd-stat-card:hover { border-color: rgba(232,192,106,.2); }
  .cd-stat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .cd-stat-icon svg { width: 20px; height: 20px; }
  .cd-stat-val { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .cd-stat-label { font-size: 12px; color: var(--muted); }

  /* Cards */
  .cd-card {
    background: var(--ink-2); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden; margin-bottom: 24px;
  }
  .cd-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
  }
  .cd-card-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }

  /* Table */
  .cd-table { width: 100%; border-collapse: collapse; }
  .cd-table th {
    padding: 12px 20px; text-align: left; font-size: 11px;
    font-weight: 600; color: var(--muted); text-transform: uppercase;
    letter-spacing: .8px; border-bottom: 1px solid var(--border);
  }
  .cd-table td {
    padding: 14px 20px; font-size: 14px;
    border-bottom: 1px solid rgba(255,255,255,.03); vertical-align: middle;
  }
  .cd-table tr:last-child td { border-bottom: none; }
  .cd-table tr:hover td { background: rgba(255,255,255,.02); }

  /* Status badges */
  .cd-status { font-size: 11px; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
  .cd-status-applied   { background: rgba(108,138,255,.12); color: #6c8aff; }
  .cd-status-reviewed  { background: rgba(232,192,106,.12); color: var(--gold); }
  .cd-status-shortlisted { background: rgba(74,222,128,.12); color: #4ade80; }
  .cd-status-rejected  { background: rgba(240,106,106,.12); color: var(--red); }
  .cd-status-pending   { background: rgba(255,255,255,.07); color: var(--muted); }

  /* Job browse */
  .cd-job-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 20px; }
  .cd-job-item {
    background: var(--ink-3); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px;
    transition: border-color .2s, transform .2s;
  }
  .cd-job-item:hover { border-color: rgba(232,192,106,.3); transform: translateY(-2px); }
  .cd-job-item__top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .cd-job-item__logo {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, var(--gold), var(--teal));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: var(--ink);
  }
  .cd-job-item__tag {
    font-size: 11px; background: rgba(56,217,192,.12); color: var(--teal);
    padding: 3px 9px; border-radius: 999px; font-weight: 500;
  }
  .cd-job-item__title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .cd-job-item__company { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
  .cd-job-item__footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .cd-job-item__salary { font-size: 13px; color: var(--gold); font-weight: 500; }
  .cd-job-item__actions { display: flex; gap: 8px; align-items: center; }

  .cd-apply-btn {
    font-size: 12px; font-weight: 600; padding: 6px 14px;
    background: linear-gradient(135deg, var(--gold), var(--gold-2));
    border: none; border-radius: 8px; color: var(--ink); cursor: pointer;
    transition: opacity .2s;
  }
  .cd-apply-btn:hover { opacity: .85; }
  .cd-apply-btn:disabled { opacity: .4; cursor: not-allowed; }
  .cd-applied-badge {
    font-size: 12px; font-weight: 600; padding: 6px 14px;
    background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.2);
    border-radius: 8px; color: #4ade80;
  }
  .cd-match-btn {
    font-size: 12px; font-weight: 600; padding: 6px 12px;
    background: rgba(56,217,192,.1); border: 1px solid rgba(56,217,192,.25);
    border-radius: 8px; color: var(--teal); cursor: pointer;
    transition: all .2s; display: flex; align-items: center; gap: 5px;
  }
  .cd-match-btn:hover { background: rgba(56,217,192,.18); }
  .cd-match-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* Profile */
  .cd-profile-wrap { padding: 28px; }
  .cd-profile-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--teal));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 28px;
    color: var(--ink); margin-bottom: 20px;
  }
  .cd-profile-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .cd-profile-email { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
  .cd-profile-field { margin-bottom: 20px; }
  .cd-profile-label { font-size: 12px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px; }
  .cd-profile-input {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; font-size: 14px; color: var(--white);
    outline: none; transition: border-color .2s; font-family: 'DM Sans', sans-serif;
  }
  .cd-profile-input:focus { border-color: rgba(232,192,106,.4); }
  .cd-save-btn {
    padding: 12px 28px; background: linear-gradient(135deg, var(--gold), var(--gold-2));
    border: none; border-radius: 10px; font-size: 14px; font-weight: 700;
    color: var(--ink); cursor: pointer; transition: opacity .2s;
  }
  .cd-save-btn:hover { opacity: .9; }
  .cd-save-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* Resume upload */
  .cd-upload-zone {
    border: 2px dashed var(--border); border-radius: 14px; padding: 40px;
    text-align: center; cursor: pointer; transition: border-color .2s;
    margin: 20px 24px;
  }
  .cd-upload-zone:hover { border-color: rgba(232,192,106,.4); }
  .cd-upload-icon { color: var(--gold); margin-bottom: 12px; }
  .cd-upload-text { font-size: 15px; font-weight: 500; margin-bottom: 6px; }
  .cd-upload-sub { font-size: 13px; color: var(--muted); }

  /* AI Score Card */
  .cd-ai-wrap { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
  .cd-ai-top { display: flex; gap: 24px; align-items: flex-start; }
  .cd-score-ring-wrap {
    flex-shrink: 0; display: flex; flex-direction: column;
    align-items: center; gap: 8px;
  }
  .cd-score-ring { position: relative; width: 120px; height: 120px; }
  .cd-score-ring svg { transform: rotate(-90deg); }
  .cd-score-ring__track { fill: none; stroke: var(--surface); stroke-width: 8; }
  .cd-score-ring__fill {
    fill: none; stroke-width: 8; stroke-linecap: round;
    transition: stroke-dashoffset 1s ease;
  }
  .cd-score-ring__num {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .cd-score-ring__val {
    font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1;
  }
  .cd-score-ring__lbl { font-size: 10px; color: var(--muted); margin-top: 2px; }
  .cd-verdict-badge {
    font-size: 12px; font-weight: 700; padding: 4px 12px;
    border-radius: 999px; text-transform: uppercase; letter-spacing: .6px;
  }
  .cd-verdict-excellent { background: rgba(74,222,128,.15); color: #4ade80; border: 1px solid rgba(74,222,128,.3); }
  .cd-verdict-good      { background: rgba(56,217,192,.15); color: var(--teal); border: 1px solid rgba(56,217,192,.3); }
  .cd-verdict-fair      { background: rgba(232,192,106,.15); color: var(--gold); border: 1px solid rgba(232,192,106,.3); }
  .cd-verdict-poor      { background: rgba(240,106,106,.15); color: var(--red); border: 1px solid rgba(240,106,106,.3); }
  .cd-ai-feedback { font-size: 14px; color: var(--muted); line-height: 1.7; flex: 1; }
  .cd-ai-section-title {
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px;
    color: var(--muted); margin-bottom: 10px;
  }
  .cd-skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .cd-skill-chip {
    font-size: 12px; padding: 4px 12px; border-radius: 999px; font-weight: 500;
    background: rgba(108,138,255,.1); border: 1px solid rgba(108,138,255,.2); color: #6c8aff;
  }
  .cd-sw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cd-sw-box { background: var(--ink-3); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
  .cd-sw-box ul { list-style: none; display: flex; flex-direction: column; gap: 6px; }
  .cd-sw-box ul li { font-size: 13px; display: flex; align-items: flex-start; gap: 8px; }
  .cd-sw-box ul li::before { content: '•'; flex-shrink: 0; margin-top: 1px; }
  .cd-sw-strength li::before { color: #4ade80; }
  .cd-sw-weakness li::before { color: var(--red); }
  .cd-ai-file-info {
    display: flex; align-items: center; gap: 10px; padding: 12px 16px;
    background: rgba(56,217,192,.06); border: 1px solid rgba(56,217,192,.12);
    border-radius: 10px; font-size: 13px; color: var(--teal);
    margin: 0 24px 0;
  }

  /* Match Modal */
  .cd-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px; backdrop-filter: blur(4px);
  }
  .cd-modal {
    background: var(--ink-2); border: 1px solid var(--border);
    border-radius: 20px; width: 100%; max-width: 520px;
    max-height: 88vh; overflow-y: auto;
  }
  .cd-modal-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--ink-2); z-index: 1;
  }
  .cd-modal-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }
  .cd-modal-close {
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    background: var(--surface); border: none; border-radius: 8px;
    color: var(--muted); cursor: pointer; transition: color .2s;
  }
  .cd-modal-close:hover { color: var(--white); }
  .cd-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
  .cd-match-score-row { display: flex; align-items: center; gap: 20px; }
  .cd-match-bar-wrap { flex: 1; }
  .cd-match-bar-label { font-size: 12px; color: var(--muted); margin-bottom: 6px; display: flex; justify-content: space-between; }
  .cd-match-bar-track { height: 8px; background: var(--surface); border-radius: 999px; overflow: hidden; }
  .cd-match-bar-fill { height: 100%; border-radius: 999px; transition: width 1s ease; }
  .cd-match-verdict-big {
    font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; line-height: 1;
  }
  .cd-match-skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cd-match-skills-box { background: var(--ink-3); border-radius: 12px; padding: 16px; border: 1px solid var(--border); }
  .cd-match-skills-box-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 10px; }
  .cd-match-skill-chip {
    font-size: 12px; padding: 4px 10px; border-radius: 999px; font-weight: 500;
    display: inline-block; margin: 3px 3px 0 0;
  }
  .cd-match-skill-matched { background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.2); color: #4ade80; }
  .cd-match-skill-missing { background: rgba(240,106,106,.1); border: 1px solid rgba(240,106,106,.2); color: var(--red); }
  .cd-match-rec {
    background: rgba(232,192,106,.06); border: 1px solid rgba(232,192,106,.15);
    border-radius: 12px; padding: 16px;
  }
  .cd-match-rec-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: var(--gold); margin-bottom: 8px; }
  .cd-match-rec p { font-size: 13px; color: var(--muted); line-height: 1.7; }
  .cd-match-loading { padding: 40px; text-align: center; color: var(--muted); font-size: 14px; }
  .cd-match-loading-dot { display: inline-block; animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: .3; } 50% { opacity: 1; } }

  /* Search bar */
  .cd-search-wrap { padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .cd-search {
    display: flex; background: var(--surface);
    border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
  }
  .cd-search input {
    flex: 1; background: transparent; border: none; outline: none;
    padding: 12px 16px; font-size: 14px; color: var(--white);
    font-family: 'DM Sans', sans-serif;
  }
  .cd-search input::placeholder { color: var(--muted); }
  .cd-search-btn {
    padding: 10px 18px; background: var(--gold); border: none;
    color: var(--ink); cursor: pointer; font-weight: 600; font-size: 13px;
    display: flex; align-items: center; gap: 6px;
  }

  .cd-empty { padding: 48px; text-align: center; color: var(--muted); font-size: 14px; }
  .cd-loading { padding: 48px; text-align: center; color: var(--muted); }

  @media (max-width: 1024px) {
    .cd-stats { grid-template-columns: repeat(2, 1fr); }
    .cd-main { padding: 24px; }
    .cd-job-grid { grid-template-columns: 1fr; }
    .cd-sw-grid { grid-template-columns: 1fr; }
    .cd-match-skills-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) { .cd-sidebar { display: none; } }
`;

// Score ring color based on value
const scoreColor = (s) => {
  if (s >= 80) return '#4ade80';
  if (s >= 60) return '#38d9c0';
  if (s >= 40) return '#e8c06a';
  return '#f06a6a';
};

const scoreVerdict = (s) => {
  if (s >= 80) return ['Excellent', 'excellent'];
  if (s >= 60) return ['Good', 'good'];
  if (s >= 40) return ['Fair', 'fair'];
  return ['Needs Work', 'poor'];
};

function ScoreRing({ score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div className="cd-score-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle className="cd-score-ring__track" cx="60" cy="60" r={r} />
        <circle
          className="cd-score-ring__fill"
          cx="60" cy="60" r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="cd-score-ring__num">
        <span className="cd-score-ring__val" style={{ color }}>{score}</span>
        <span className="cd-score-ring__lbl">/ 100</span>
      </div>
    </div>
  );
}

function MatchModal({ job, resume, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.post('/resume/score-job', { jobId: job._id });
        setResult(res.data);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Match scoring failed');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [job._id]);

  const barColor = result ? scoreColor(result.matchScore) : '#e8c06a';

  return (
    <div className="cd-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cd-modal">
        <div className="cd-modal-head">
          <div>
            <div className="cd-modal-title">Match Score</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              {job.title} · {job.company}
            </div>
          </div>
          <button className="cd-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="cd-modal-body">
          {loading ? (
            <div className="cd-match-loading">
              <div style={{ fontSize: 28, marginBottom: 12 }}>
                <span className="cd-match-loading-dot">·</span>
                <span className="cd-match-loading-dot" style={{ animationDelay: '.2s' }}>·</span>
                <span className="cd-match-loading-dot" style={{ animationDelay: '.4s' }}>·</span>
              </div>
              Analysing your resume against this role...
            </div>
          ) : result && (
            <>
              <div className="cd-match-score-row">
                <div>
                  <div className="cd-match-verdict-big" style={{ color: barColor }}>
                    {result.matchScore}%
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={`cd-verdict-badge cd-verdict-${scoreVerdict(result.matchScore)[1]}`}>
                      {result.verdict || scoreVerdict(result.matchScore)[0]}
                    </span>
                  </div>
                </div>
                <div className="cd-match-bar-wrap">
                  <div className="cd-match-bar-label">
                    <span>Match</span><span>{result.matchScore}%</span>
                  </div>
                  <div className="cd-match-bar-track">
                    <div className="cd-match-bar-fill"
                      style={{ width: `${result.matchScore}%`, background: barColor }} />
                  </div>
                </div>
              </div>

              {(result.matchedSkills?.length > 0 || result.missingSkills?.length > 0) && (
                <div className="cd-match-skills-grid">
                  <div className="cd-match-skills-box">
                    <div className="cd-match-skills-box-title" style={{ color: '#4ade80' }}>
                      ✓ Matched Skills
                    </div>
                    {result.matchedSkills?.length > 0
                      ? result.matchedSkills.map(s => (
                          <span key={s} className="cd-match-skill-chip cd-match-skill-matched">{s}</span>
                        ))
                      : <span style={{ fontSize: 13, color: 'var(--muted)' }}>None detected</span>
                    }
                  </div>
                  <div className="cd-match-skills-box">
                    <div className="cd-match-skills-box-title" style={{ color: 'var(--red)' }}>
                      ✗ Missing Skills
                    </div>
                    {result.missingSkills?.length > 0
                      ? result.missingSkills.map(s => (
                          <span key={s} className="cd-match-skill-chip cd-match-skill-missing">{s}</span>
                        ))
                      : <span style={{ fontSize: 13, color: 'var(--muted)' }}>None — great fit!</span>
                    }
                  </div>
                </div>
              )}

              {result.recommendation && (
                <div className="cd-match-rec">
                  <div className="cd-match-rec-title">Recommendation</div>
                  <p>{result.recommendation}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobSearch, setJobSearch] = useState('');
  const [applying, setApplying] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [matchJob, setMatchJob] = useState(null);        // job currently being matched
  const [checkingMatch, setCheckingMatch] = useState(null); // jobId being checked
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', skills: '', bio: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/jobs'),
      ]);
      setApplications(appsRes.data);
      setJobs(jobsRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const fetchResume = async () => {
    try {
      const res = await api.get('/resume/my');
      setResumeData(res.data);
    } catch { /* no resume yet — that's fine */ }
  };

  // Fetch resume when landing on resume tab
  useEffect(() => {
    if (tab === 'resume') fetchResume();
  }, [tab]);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await api.post('/applications', { job: jobId });
      toast.success('Application submitted!');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Already applied or error occurred');
    } finally { setApplying(null); }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume uploaded & analysed!');
      setResumeFile(null);
      setResumeData(res.data.resume);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', profile);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const appliedJobIds = new Set(applications.map(a => a.job?._id));
  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.company?.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    pending: applications.filter(a => ['applied', 'reviewed'].includes(a.status)).length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const navItems = [
    { id: 'overview',      label: 'Overview',         icon: <LayoutDashboard /> },
    { id: 'jobs',          label: 'Browse Jobs',       icon: <Search /> },
    { id: 'applications',  label: 'My Applications',   icon: <FileText /> },
    { id: 'resume',        label: 'Resume',            icon: <Upload /> },
    { id: 'profile',       label: 'Profile',           icon: <User /> },
  ];

  return (
    <>
      <style>{S}</style>
      <div className="cd-layout">

        {/* Sidebar */}
        <aside className="cd-sidebar">
          <div className="cd-logo">
            <span className="cd-logo-dot" /> SmartHire
          </div>
          {navItems.map(n => (
            <div key={n.id} className={`cd-nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              {n.icon} {n.label}
            </div>
          ))}
          <div className="cd-sidebar-bottom">
            <button className="cd-logout" onClick={handleLogout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="cd-main">
          <div className="cd-header">
            <h1>{navItems.find(n => n.id === tab)?.label}</h1>
            <p>Welcome back, {user?.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {loading && <div className="cd-loading">Loading...</div>}

          {/* ── Overview ── */}
          {!loading && tab === 'overview' && (
            <>
              <div className="cd-stats">
                {[
                  { label: 'Total Applied',  val: stats.total,       icon: <Briefcase />,    color: '#6c8aff', bg: 'rgba(108,138,255,.12)' },
                  { label: 'Shortlisted',    val: stats.shortlisted, icon: <CheckCircle />,  color: '#4ade80', bg: 'rgba(74,222,128,.12)'  },
                  { label: 'In Progress',    val: stats.pending,     icon: <Clock />,        color: '#e8c06a', bg: 'rgba(232,192,106,.12)' },
                  { label: 'Rejected',       val: stats.rejected,    icon: <XCircle />,      color: '#f06a6a', bg: 'rgba(240,106,106,.12)' },
                ].map(s => (
                  <div key={s.label} className="cd-stat-card">
                    <div className="cd-stat-icon" style={{ background: s.bg }}>
                      <span style={{ color: s.color }}>{s.icon}</span>
                    </div>
                    <div>
                      <div className="cd-stat-val">{s.val}</div>
                      <div className="cd-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cd-card">
                <div className="cd-card-head">
                  <span className="cd-card-title">Recent Applications</span>
                  <span style={{ fontSize: 13, color: 'var(--gold)', cursor: 'pointer' }} onClick={() => setTab('applications')}>
                    View all <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                  </span>
                </div>
                <table className="cd-table">
                  <thead>
                    <tr><th>Job</th><th>Company</th><th>Status</th><th>Applied</th></tr>
                  </thead>
                  <tbody>
                    {applications.length === 0 && (
                      <tr><td colSpan={4}><div className="cd-empty">No applications yet. Browse jobs to get started!</div></td></tr>
                    )}
                    {applications.slice(0, 5).map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 500 }}>{a.job?.title || '—'}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.job?.company || '—'}</td>
                        <td><span className={`cd-status cd-status-${a.status}`}>{a.status}</span></td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Browse Jobs ── */}
          {!loading && tab === 'jobs' && (
            <div className="cd-card">
              <div className="cd-search-wrap">
                <div className="cd-search">
                  <input
                    placeholder="Search by title or company..."
                    value={jobSearch}
                    onChange={e => setJobSearch(e.target.value)}
                  />
                  <button className="cd-search-btn"><Search size={14} /> Search</button>
                </div>
              </div>
              {filteredJobs.length === 0 && <div className="cd-empty">No jobs found.</div>}
              <div className="cd-job-grid">
                {filteredJobs.map(j => (
                  <div key={j._id} className="cd-job-item">
                    <div className="cd-job-item__top">
                      <div className="cd-job-item__logo">{j.company?.[0] || '?'}</div>
                      <span className="cd-job-item__tag">{j.type || 'Full-time'}</span>
                    </div>
                    <div className="cd-job-item__title">{j.title}</div>
                    <div className="cd-job-item__company">{j.company} · {j.location || 'Remote'}</div>
                    <div className="cd-job-item__footer">
                      <span className="cd-job-item__salary">{j.salary || 'Competitive'}</span>
                      <div className="cd-job-item__actions">
                        {/* Check Match — only if resume exists */}
                        {resumeData && (
                          <button
                            className="cd-match-btn"
                            onClick={() => setMatchJob(j)}
                          >
                            <Zap size={12} /> Match
                          </button>
                        )}
                        {appliedJobIds.has(j._id)
                          ? <span className="cd-applied-badge">Applied ✓</span>
                          : (
                            <button
                              className="cd-apply-btn"
                              disabled={applying === j._id}
                              onClick={() => handleApply(j._id)}
                            >
                              {applying === j._id ? 'Applying...' : 'Apply Now'}
                            </button>
                          )
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!resumeData && filteredJobs.length > 0 && (
                <div style={{ padding: '0 20px 20px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                  <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Upload your resume to unlock <span style={{ color: 'var(--teal)' }}>AI Match scoring</span> on every job.
                </div>
              )}
            </div>
          )}

          {/* ── My Applications ── */}
          {!loading && tab === 'applications' && (
            <div className="cd-card">
              <div className="cd-card-head">
                <span className="cd-card-title">All Applications ({applications.length})</span>
              </div>
              <table className="cd-table">
                <thead>
                  <tr><th>Job</th><th>Company</th><th>Status</th><th>Applied</th></tr>
                </thead>
                <tbody>
                  {applications.length === 0 && (
                    <tr><td colSpan={4}><div className="cd-empty">No applications yet.</div></td></tr>
                  )}
                  {applications.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 500 }}>{a.job?.title || '—'}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.job?.company || '—'}</td>
                      <td><span className={`cd-status cd-status-${a.status}`}>{a.status}</span></td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Resume ── */}
          {!loading && tab === 'resume' && (
            <>
              <div className="cd-card">
                <div className="cd-card-head">
                  <span className="cd-card-title">
                    {resumeData ? 'Resume Analysis' : 'Upload Resume'}
                  </span>
                  {resumeData && (
                    <button
                      className="cd-match-btn"
                      onClick={() => { setResumeData(null); setResumeFile(null); }}
                      style={{ fontSize: 12 }}
                    >
                      <Upload size={12} /> Replace
                    </button>
                  )}
                </div>

                {/* Existing resume info bar */}
                {resumeData && (
                  <div className="cd-ai-file-info">
                    <FileText size={16} />
                    <span>{resumeData.fileName}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 12 }}>
                      Uploaded {new Date(resumeData.updatedAt || resumeData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Upload zone — shown when no resume or replacing */}
                {!resumeData && (
                  <>
                    <div
                      className="cd-upload-zone"
                      onClick={() => document.getElementById('resume-input').click()}
                    >
                      <div className="cd-upload-icon"><Upload size={32} /></div>
                      <div className="cd-upload-text">
                        {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                      </div>
                      <div className="cd-upload-sub">PDF only · Max 5MB</div>
                      <input
                        id="resume-input"
                        type="file"
                        accept=".pdf"
                        style={{ display: 'none' }}
                        onChange={e => setResumeFile(e.target.files[0])}
                      />
                    </div>
                    {resumeFile && (
                      <div style={{ padding: '0 24px 24px' }}>
                        <button className="cd-save-btn" onClick={handleResumeUpload} disabled={uploading}>
                          {uploading ? 'Analysing with AI...' : 'Upload & Analyse'}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* AI Results */}
                {resumeData && (
                  <div className="cd-ai-wrap">
                    {/* Score + Feedback */}
                    <div className="cd-ai-top">
                      <div className="cd-score-ring-wrap">
                        <ScoreRing score={resumeData.aiScore || 0} />
                        <span className={`cd-verdict-badge cd-verdict-${scoreVerdict(resumeData.aiScore || 0)[1]}`}>
                          {scoreVerdict(resumeData.aiScore || 0)[0]}
                        </span>
                      </div>
                      <div>
                        <div className="cd-ai-section-title" style={{ marginBottom: 8 }}>AI Feedback</div>
                        <p className="cd-ai-feedback">{resumeData.aiFeedback || 'No feedback available.'}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    {resumeData.aiSkills?.length > 0 && (
                      <div>
                        <div className="cd-ai-section-title">Detected Skills</div>
                        <div className="cd-skills-wrap">
                          {resumeData.aiSkills.map(s => (
                            <span key={s} className="cd-skill-chip">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    {(resumeData.aiStrengths?.length > 0 || resumeData.aiWeaknesses?.length > 0) && (
                      <div className="cd-sw-grid">
                        <div className="cd-sw-box cd-sw-strength">
                          <div className="cd-ai-section-title" style={{ color: '#4ade80' }}>Strengths</div>
                          <ul>
                            {resumeData.aiStrengths?.map(s => <li key={s}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="cd-sw-box cd-sw-weakness">
                          <div className="cd-ai-section-title" style={{ color: 'var(--red)' }}>Areas to Improve</div>
                          <ul>
                            {resumeData.aiWeaknesses?.map(w => <li key={w}>{w}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Nudge to use match feature */}
                    <div style={{
                      fontSize: 13, color: 'var(--muted)', textAlign: 'center',
                      padding: '8px 0', borderTop: '1px solid var(--border)', paddingTop: 16
                    }}>
                      <Zap size={13} style={{ verticalAlign: 'middle', color: 'var(--teal)', marginRight: 5 }} />
                      Go to <span
                        style={{ color: 'var(--gold)', cursor: 'pointer' }}
                        onClick={() => setTab('jobs')}
                      >Browse Jobs</span> and hit <strong style={{ color: 'var(--teal)' }}>Match</strong> on any role to see your fit score.
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Profile ── */}
          {!loading && tab === 'profile' && (
            <div className="cd-card">
              <div className="cd-card-head">
                <span className="cd-card-title">My Profile</span>
              </div>
              <div className="cd-profile-wrap">
                <div className="cd-profile-avatar">{user?.name?.[0]}</div>
                <div className="cd-profile-name">{user?.name}</div>
                <div className="cd-profile-email">{user?.email}</div>
                <div className="cd-profile-field">
                  <div className="cd-profile-label">Full Name</div>
                  <input className="cd-profile-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="cd-profile-field">
                  <div className="cd-profile-label">Skills (comma separated)</div>
                  <input className="cd-profile-input" placeholder="React, Node.js, Python..." value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} />
                </div>
                <div className="cd-profile-field">
                  <div className="cd-profile-label">Bio</div>
                  <textarea className="cd-profile-input" rows={4} placeholder="Tell employers about yourself..." value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <button className="cd-save-btn" onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Match Modal */}
      {matchJob && (
        <MatchModal
          job={matchJob}
          resume={resumeData}
          onClose={() => setMatchJob(null)}
        />
      )}
    </>
  );
}