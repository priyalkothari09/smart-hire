import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ChevronRight, Sparkles, Shield, Zap, TrendingUp, Star, CheckCircle, Play } from 'lucide-react';

/* ─── Floating Orb Background ─────────────────────────────────────── */
const Orbs = () => (
  <div className="sh-orbs" aria-hidden="true">
    <span className="orb orb-1" />
    <span className="orb orb-2" />
    <span className="orb orb-3" />
  </div>
);

/* ─── Animated Counter ─────────────────────────────────────────────── */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      const start = Date.now();
      const duration = 1800;
      const tick = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(ease * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Job Card (floating preview) ─────────────────────────────────── */
const JobCard = ({ title, company, tag, salary, delay }) => (
  <div className="sh-job-card" style={{ animationDelay: `${delay}s` }}>
    <div className="sh-job-card__logo">{company[0]}</div>
    <div className="sh-job-card__info">
      <p className="sh-job-card__title">{title}</p>
      <p className="sh-job-card__company">{company}</p>
    </div>
    <div className="sh-job-card__right">
      <span className="sh-job-card__tag">{tag}</span>
      <p className="sh-job-card__salary">{salary}</p>
    </div>
  </div>
);

/* ─── Main Component ───────────────────────────────────────────────── */
export default function Landing() {
  const [query, setQuery] = useState('');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:     #0a0c14;
          --ink-2:   #10131f;
          --ink-3:   #181c2e;
          --surface: #1e2235;
          --border:  rgba(255,255,255,0.07);
          --gold:    #e8c06a;
          --gold-2:  #f5d88a;
          --teal:    #38d9c0;
          --white:   #f0f2f8;
          --muted:   #7a7f9a;
          --radius:  16px;
          font-family: 'DM Sans', sans-serif;
        }

        body { background: var(--ink); color: var(--white); min-height: 100vh; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }

        /* ── Orbs ── */
        .sh-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(100px); opacity: .18;
          animation: orb-drift 20s ease-in-out infinite alternate;
        }
        .orb-1 { width: 600px; height: 600px; background: #3b5bff; top: -200px; left: -100px; animation-duration: 22s; }
        .orb-2 { width: 500px; height: 500px; background: var(--gold); bottom: -100px; right: -80px; animation-duration: 18s; animation-delay: -6s; }
        .orb-3 { width: 350px; height: 350px; background: var(--teal); top: 40%; left: 50%; transform: translateX(-50%); animation-duration: 26s; animation-delay: -12s; }
        @keyframes orb-drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.1); }
        }

        /* ── Nav ── */
        .sh-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 max(24px, calc((100vw - 1200px)/2));
          height: 68px;
          background: rgba(10,12,20,.75); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .sh-nav__logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -.5px;
          color: var(--white); display: flex; align-items: center; gap: 10px;
        }
        .sh-nav__logo-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--teal));
          box-shadow: 0 0 12px var(--teal);
        }
        .sh-nav__links { display: flex; gap: 32px; }
        .sh-nav__link { font-size: 14px; color: var(--muted); transition: color .2s; }
        .sh-nav__link:hover { color: var(--white); }
        .sh-nav__actions { display: flex; gap: 12px; align-items: center; }
        .sh-btn-ghost {
          font-size: 14px; font-weight: 500; color: var(--white); padding: 9px 20px;
          border: 1px solid var(--border); border-radius: 10px; background: transparent;
          cursor: pointer; transition: background .2s, border-color .2s;
        }
        .sh-btn-ghost:hover { background: var(--surface); border-color: rgba(255,255,255,.15); }
        .sh-btn-gold {
          font-size: 14px; font-weight: 600; color: var(--ink); padding: 9px 22px;
          background: linear-gradient(135deg, var(--gold), var(--gold-2));
          border: none; border-radius: 10px; cursor: pointer; transition: opacity .2s, transform .15s;
        }
        .sh-btn-gold:hover { opacity: .9; transform: translateY(-1px); }

        /* ── Hero ── */
        .sh-hero {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          padding: 100px 24px 80px;
          display: grid; grid-template-columns: 1fr 440px; gap: 60px; align-items: center;
        }
        @media (max-width: 900px) {
          .sh-hero { grid-template-columns: 1fr; padding: 60px 24px; }
          .sh-hero__visual { display: none; }
          .sh-nav__links { display: none; }
        }

        .sh-hero__eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 999px;
          background: rgba(232,192,106,.1); border: 1px solid rgba(232,192,106,.25);
          font-size: 12px; font-weight: 500; color: var(--gold); letter-spacing: .5px;
          text-transform: uppercase; margin-bottom: 28px;
        }
        .sh-hero__eyebrow svg { width: 13px; height: 13px; }

        .sh-hero__h1 {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(42px, 5vw, 64px); line-height: 1.05; letter-spacing: -2px;
          margin-bottom: 24px;
        }
        .sh-hero__h1 em { font-style: normal; color: var(--gold); }

        .sh-hero__sub {
          font-size: 17px; line-height: 1.7; color: var(--muted); max-width: 480px; margin-bottom: 42px;
        }

        /* Search bar */
        .sh-search {
          display: flex; gap: 0;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden; max-width: 500px;
          transition: border-color .2s;
        }
        .sh-search:focus-within { border-color: rgba(232,192,106,.4); }
        .sh-search__input {
          flex: 1; background: transparent; border: none; outline: none;
          padding: 16px 20px; font-size: 15px; color: var(--white);
          font-family: 'DM Sans', sans-serif;
        }
        .sh-search__input::placeholder { color: var(--muted); }
        .sh-search__btn {
          padding: 12px 20px; background: linear-gradient(135deg, var(--gold), var(--gold-2));
          border: none; border-radius: 10px; margin: 6px; cursor: pointer;
          display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600;
          color: var(--ink); transition: opacity .2s;
        }
        .sh-search__btn:hover { opacity: .9; }
        .sh-search__btn svg { width: 16px; height: 16px; }

        .sh-hero__tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
        .sh-hero__tag {
          font-size: 12px; color: var(--muted); padding: 5px 12px;
          border: 1px solid var(--border); border-radius: 999px; cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .sh-hero__tag:hover { border-color: var(--gold); color: var(--gold); }

        /* Hero Visual */
        .sh-hero__visual { position: relative; height: 500px; }

        .sh-job-card {
          position: absolute; left: 0; right: 0;
          background: rgba(30,34,53,.85); border: 1px solid var(--border);
          border-radius: 14px; padding: 16px 20px;
          display: flex; align-items: center; gap: 14px;
          backdrop-filter: blur(12px);
          animation: card-float 4s ease-in-out infinite alternate;
        }
        .sh-job-card:nth-child(1) { top: 0; }
        .sh-job-card:nth-child(2) { top: 110px; left: 30px; right: -30px; }
        .sh-job-card:nth-child(3) { top: 220px; left: -10px; right: 10px; }
        .sh-job-card:nth-child(4) { top: 330px; left: 20px; right: -20px; }
        @keyframes card-float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-8px); }
        }

        .sh-job-card__logo {
          width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--gold), var(--teal));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: var(--ink);
        }
        .sh-job-card__info { flex: 1; min-width: 0; }
        .sh-job-card__title { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sh-job-card__company { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .sh-job-card__right { text-align: right; flex-shrink: 0; }
        .sh-job-card__tag {
          font-size: 11px; background: rgba(56,217,192,.15); color: var(--teal);
          padding: 3px 9px; border-radius: 999px; font-weight: 500;
        }
        .sh-job-card__salary { font-size: 12px; color: var(--gold); margin-top: 4px; font-weight: 500; }

        /* ── Stats ── */
        .sh-stats {
          position: relative; z-index: 1;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          background: rgba(16,19,31,.6); backdrop-filter: blur(10px);
        }
        .sh-stats__inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        @media (max-width: 700px) { .sh-stats__inner { grid-template-columns: repeat(2,1fr); } }
        .sh-stat {
          padding: 40px 24px; text-align: center;
          border-right: 1px solid var(--border);
        }
        .sh-stat:last-child { border-right: none; }
        .sh-stat__val {
          font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 800;
          background: linear-gradient(135deg, var(--white), var(--gold));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .sh-stat__label { font-size: 13px; color: var(--muted); margin-top: 4px; }

        /* ── Features ── */
        .sh-section {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto; padding: 100px 24px;
        }
        .sh-section__badge {
          display: inline-block; font-size: 12px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--teal); margin-bottom: 16px;
        }
        .sh-section__h2 {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(32px, 4vw, 48px); letter-spacing: -1.5px; line-height: 1.1;
          margin-bottom: 16px;
        }
        .sh-section__sub { font-size: 16px; color: var(--muted); max-width: 500px; line-height: 1.7; margin-bottom: 60px; }

        .sh-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 800px) { .sh-features-grid { grid-template-columns: 1fr; } }

        .sh-feat {
          background: var(--ink-2); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 36px 32px; transition: border-color .25s, transform .25s;
        }
        .sh-feat:hover { border-color: rgba(232,192,106,.3); transform: translateY(-4px); }
        .sh-feat__icon {
          width: 52px; height: 52px; border-radius: 14px; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.05); border: 1px solid var(--border);
        }
        .sh-feat__icon svg { width: 24px; height: 24px; }
        .sh-feat__h3 { font-family: 'Syne', sans-serif; font-size: 19px; font-weight: 700; margin-bottom: 12px; }
        .sh-feat__p { font-size: 14px; color: var(--muted); line-height: 1.75; }

        /* ── How It Works ── */
        .sh-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
        @media (max-width: 800px) { .sh-steps { grid-template-columns: repeat(2, 1fr); } }

        .sh-step { text-align: center; }
        .sh-step__num {
          font-family: 'Syne', sans-serif; font-size: 56px; font-weight: 800; line-height: 1;
          color: transparent; -webkit-text-stroke: 1px rgba(232,192,106,.25);
          margin-bottom: 20px;
        }
        .sh-step__circle {
          width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
        }
        .sh-step__circle svg { width: 24px; height: 24px; color: var(--gold); }
        .sh-step__title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 10px; }
        .sh-step__desc { font-size: 13px; color: var(--muted); line-height: 1.7; }

        /* ── Testimonials ── */
        .sh-testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 800px) { .sh-testimonials { grid-template-columns: 1fr; } }

        .sh-testi {
          background: var(--ink-3); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 32px 28px;
        }
        .sh-testi__stars { display: flex; gap: 4px; margin-bottom: 16px; }
        .sh-testi__stars svg { width: 14px; height: 14px; fill: var(--gold); color: var(--gold); }
        .sh-testi__quote { font-size: 14px; color: var(--muted); line-height: 1.8; margin-bottom: 24px; }
        .sh-testi__person { display: flex; align-items: center; gap: 12px; }
        .sh-testi__avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--teal));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; color: var(--ink); flex-shrink: 0;
        }
        .sh-testi__name { font-size: 14px; font-weight: 600; }
        .sh-testi__role { font-size: 12px; color: var(--muted); }

        /* ── CTA Banner ── */
        .sh-cta-wrap { position: relative; z-index: 1; padding: 0 24px 100px; max-width: 1200px; margin: 0 auto; }
        .sh-cta {
          background: linear-gradient(135deg, #1a1f36 0%, #0d1020 100%);
          border: 1px solid rgba(232,192,106,.2);
          border-radius: 28px; padding: 80px 60px;
          text-align: center; position: relative; overflow: hidden;
        }
        .sh-cta::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(232,192,106,.12), transparent 60%);
        }
        .sh-cta__h2 {
          font-family: 'Syne', sans-serif; font-size: clamp(30px, 4vw, 48px);
          font-weight: 800; letter-spacing: -1.5px; margin-bottom: 16px;
        }
        .sh-cta__h2 em { font-style: normal; color: var(--gold); }
        .sh-cta__sub { font-size: 16px; color: var(--muted); margin-bottom: 40px; }
        .sh-cta__btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }
        .sh-btn-outline {
          padding: 15px 32px; border: 1px solid var(--border); border-radius: 12px;
          font-size: 15px; font-weight: 600; color: var(--white); background: transparent;
          cursor: pointer; transition: background .2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .sh-btn-outline:hover { background: var(--surface); }
        .sh-btn-primary {
          padding: 15px 32px; border-radius: 12px; font-size: 15px; font-weight: 700;
          color: var(--ink); background: linear-gradient(135deg, var(--gold), var(--gold-2));
          border: none; cursor: pointer; transition: opacity .2s, transform .15s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .sh-btn-primary:hover { opacity: .9; transform: translateY(-2px); }
        .sh-btn-primary svg { width: 16px; height: 16px; }

        /* ── Footer ── */
        .sh-footer {
          position: relative; z-index: 1;
          border-top: 1px solid var(--border);
          background: var(--ink-2);
        }
        .sh-footer__inner {
          max-width: 1200px; margin: 0 auto; padding: 64px 24px 40px;
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
        }
        @media (max-width: 800px) { .sh-footer__inner { grid-template-columns: 1fr 1fr; } }
        .sh-footer__brand-name {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
        }
        .sh-footer__brand-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }
        .sh-footer__brand-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }
        .sh-footer__col-title { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--white); margin-bottom: 20px; }
        .sh-footer__links { display: flex; flex-direction: column; gap: 12px; }
        .sh-footer__link { font-size: 14px; color: var(--muted); transition: color .2s; }
        .sh-footer__link:hover { color: var(--white); }
        .sh-footer__bottom {
          max-width: 1200px; margin: 0 auto; padding: 24px;
          border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px; color: var(--muted);
        }
      `}</style>

      <Orbs />

      {/* ─ Nav ─ */}
      <nav className="sh-nav">
        <Link to="/" className="sh-nav__logo">
          <span className="sh-nav__logo-dot" />
          SmartHire
        </Link>
        <div className="sh-nav__links">
          {['Browse Jobs', 'For Employers', 'Pricing', 'Blog'].map(l => (
            <a key={l} href="#" className="sh-nav__link">{l}</a>
          ))}
        </div>
        <div className="sh-nav__actions">
          <Link to="/login"><button className="sh-btn-ghost">Sign In</button></Link>
          <Link to="/register"><button className="sh-btn-gold">Get Started →</button></Link>
        </div>
      </nav>

      {/* ─ Hero ─ */}
      <section className="sh-hero">
        <div className="sh-hero__content">
          <div className="sh-hero__eyebrow">
            <Sparkles /> AI-Powered Hiring · 2026
          </div>
          <h1 className="sh-hero__h1">
            Where Ambition<br />Meets <em>Opportunity.</em>
          </h1>
          <p className="sh-hero__sub">
            SmartHire uses advanced AI to connect the right talent with the right companies —
            faster, smarter, and more precisely than ever before.
          </p>
          <div className="sh-search">
            <input
              className="sh-search__input"
              placeholder="Job title, skill, or company..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="sh-search__btn">
              <Search /> Search
            </button>
          </div>
          <div className="sh-hero__tags">
            {['React Developer', 'Product Manager', 'UI Designer', 'Data Scientist', 'DevOps'].map(t => (
              <span key={t} className="sh-hero__tag">{t}</span>
            ))}
          </div>
        </div>
        <div className="sh-hero__visual">
          <JobCard title="Senior Frontend Engineer" company="Stripe" tag="Remote" salary="₹28–36 LPA" delay={0} />
          <JobCard title="Product Designer" company="Figma" tag="Hybrid" salary="₹22–30 LPA" delay={0.4} />
          <JobCard title="ML Engineer" company="OpenAI" tag="On-site" salary="₹40–55 LPA" delay={0.8} />
          <JobCard title="Backend Engineer" company="Razorpay" tag="Remote" salary="₹24–32 LPA" delay={1.2} />
        </div>
      </section>

      {/* ─ Stats ─ */}
      <div className="sh-stats">
        <div className="sh-stats__inner">
          {[
            { val: 10000, suffix: '+', label: 'Active Jobs' },
            { val: 2500, suffix: '+', label: 'Companies' },
            { val: 50000, suffix: '+', label: 'Candidates Hired' },
            { val: 94, suffix: '%', label: 'Placement Rate' },
          ].map(s => (
            <div key={s.label} className="sh-stat">
              <div className="sh-stat__val"><Counter target={s.val} suffix={s.suffix} /></div>
              <div className="sh-stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─ Features ─ */}
      <section className="sh-section">
        <span className="sh-section__badge">Why SmartHire</span>
        <h2 className="sh-section__h2">Built for modern hiring.</h2>
        <p className="sh-section__sub">
          Everything candidates and employers need — in one intelligent platform.
        </p>
        <div className="sh-features-grid">
          {[
            { icon: <Zap style={{ color: '#e8c06a' }} />, title: 'AI Resume Matching', desc: 'Our AI analyses your resume against thousands of roles and surfaces only the best fits — no spam, no noise.' },
            { icon: <Shield style={{ color: '#38d9c0' }} />, title: 'Verified Employers', desc: 'Every company on SmartHire is verified. Apply with confidence knowing the opportunity is real.' },
            { icon: <TrendingUp style={{ color: '#6c8aff' }} />, title: 'Real-Time Analytics', desc: 'Employers get live dashboards tracking applicants, views, and shortlist rate for every posting.' },
          ].map(f => (
            <div key={f.title} className="sh-feat">
              <div className="sh-feat__icon">{f.icon}</div>
              <h3 className="sh-feat__h3">{f.title}</h3>
              <p className="sh-feat__p">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─ How It Works ─ */}
      <section style={{ background: 'rgba(16,19,31,.5)', position: 'relative', zIndex: 1 }}>
        <div className="sh-section" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <span className="sh-section__badge">Process</span>
          <h2 className="sh-section__h2">From signup to hired.</h2>
          <p className="sh-section__sub">Four steps, zero friction.</p>
          <div className="sh-steps">
            {[
              { n: '01', icon: <CheckCircle />, title: 'Create Profile', desc: 'Sign up in 60 seconds. Build your professional presence with our guided flow.' },
              { n: '02', icon: <Search />, title: 'Explore Matches', desc: 'Browse AI-curated job matches or let employers discover you.' },
              { n: '03', icon: <Zap />, title: 'Apply or Shortlist', desc: 'One-click apply for candidates; instant shortlisting for employers.' },
              { n: '04', icon: <Star />, title: 'Get Hired', desc: 'Connect, interview, negotiate, and accept — all in one place.' },
            ].map(s => (
              <div key={s.n} className="sh-step">
                <div className="sh-step__num">{s.n}</div>
                <div className="sh-step__circle">{s.icon}</div>
                <h3 className="sh-step__title">{s.title}</h3>
                <p className="sh-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ Testimonials ─ */}
      <section className="sh-section">
        <span className="sh-section__badge">Testimonials</span>
        <h2 className="sh-section__h2">Loved by candidates<br />and teams alike.</h2>
        <p className="sh-section__sub" style={{ marginBottom: 48 }}>Real stories from real users.</p>
        <div className="sh-testimonials">
          {[
            { name: 'Arjun Mehta', role: 'Product Manager · Bangalore', init: 'A', quote: 'I found my current role at a Series B startup within 3 weeks. The AI matching is genuinely uncanny — every recommendation was relevant.' },
            { name: 'Priya Singh', role: 'Employer · TechCorp India', init: 'P', quote: 'We cut our time-to-hire by 40%. The resume analysis tools and shortlisting features are far ahead of anything else we\'ve tried.' },
            { name: 'Rahul Sharma', role: 'Full Stack Developer · Pune', init: 'R', quote: 'As a fresher, I was intimidated by the job market. SmartHire made it feel approachable. I had 4 interviews in my first week.' },
          ].map(t => (
            <div key={t.name} className="sh-testi">
              <div className="sh-testi__stars">{[...Array(5)].map((_, i) => <Star key={i} />)}</div>
              <p className="sh-testi__quote">"{t.quote}"</p>
              <div className="sh-testi__person">
                <div className="sh-testi__avatar">{t.init}</div>
                <div>
                  <p className="sh-testi__name">{t.name}</p>
                  <p className="sh-testi__role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─ CTA ─ */}
      <div className="sh-cta-wrap">
        <div className="sh-cta">
          <h2 className="sh-cta__h2">Ready to find your<br /><em>next great hire?</em></h2>
          <p className="sh-cta__sub">Join 50,000+ professionals already building their careers on SmartHire.</p>
          <div className="sh-cta__btns">
            <Link to="/register?role=candidate">
              <button className="sh-btn-primary">I'm Job Hunting <ArrowRight /></button>
            </Link>
            <Link to="/register?role=employer">
              <button className="sh-btn-outline"><Play size={16} /> I'm Hiring</button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─ Footer ─ */}
      <footer className="sh-footer">
        <div className="sh-footer__inner">
          <div>
            <div className="sh-footer__brand-name">
              <span className="sh-footer__brand-dot" /> SmartHire
            </div>
            <p className="sh-footer__brand-desc">
              AI-powered hiring for modern teams and ambitious candidates. Built to move fast.
            </p>
          </div>
          {[
            { title: 'Platform', links: ['Browse Jobs', 'Post a Job', 'Resume Builder', 'AI Matching'] },
            { title: 'Company', links: ['About Us', 'Blog', 'Press', 'Careers'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'] },
          ].map(col => (
            <div key={col.title}>
              <p className="sh-footer__col-title">{col.title}</p>
              <div className="sh-footer__links">
                {col.links.map(l => <a key={l} href="#" className="sh-footer__link">{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div className="sh-footer__bottom">
          <span>© 2026 SmartHire. All rights reserved.</span>
          <span>Made with precision ✦</span>
        </div>
      </footer>
    </>
  );
}