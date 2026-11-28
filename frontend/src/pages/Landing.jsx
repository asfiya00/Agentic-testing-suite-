import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ShieldCheck,
  ScanSearch,
  Bug,
  GitPullRequest,
  Sparkles,
  Activity,
  CheckCircle2,
  ChevronRight,
  TerminalSquare,
} from "lucide-react";

const features = [
  {
    icon: ScanSearch,
    title: "Explore every path",
    text: "Let browser agents crawl your app and surface issues in real user journeys.",
  },
  {
    icon: Bug,
    title: "Pinpoint the cause",
    text: "Connect each finding to the source file, line, and context behind it.",
  },
  {
    icon: GitPullRequest,
    title: "Fix with confidence",
    text: "Review generated patches, then verify fixes with a fresh run.",
  },
];

export default function Landing() {
  return (
    <div className="landing min-h-screen overflow-hidden relative">
      {/* Background effects */}
      <div className="landing-orb orb-one" />
      <div className="landing-orb orb-two" />

      {/* Navigation */}
      <header className="landing-nav relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="brand-mark">
            <ShieldCheck size={21} />
          </div>

          <div>
            <div className="font-display text-lg font-semibold tracking-tight">
              Sentinel
            </div>
            <div className="text-[10px] uppercase tracking-[.22em] text-slate-400">
              Agent QA platform
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#capabilities" className="hover:text-white transition">
            Capabilities
          </a>

          <a href="#workflow" className="hover:text-white transition">
            How it works
          </a>

          <Link to="/dashboard" className="hover:text-white transition">
            Console
          </Link>
        </nav>

        <div className="landing-auth-actions">
          <Link to="/login" className="landing-signin">
            Sign in
          </Link>

          <Link to="/signup" className="landing-nav-cta">
            Get started <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        {/* Hero section */}
        <section className="landing-hero grid items-center gap-12 py-14 md:grid-cols-[1.05fr_.95fr] md:py-24">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              AUTONOMOUS QUALITY ENGINEERING
            </div>

            <h1>
              Ship better software.
              <br />
              <span>Without the guesswork.</span>
            </h1>

            <p className="hero-lead">
              Sentinel explores your app, finds what breaks, traces issues to
              the code, and helps your team verify the fix — all in one
              intelligent workflow.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link to="/signup" className="hero-primary">
                Start a scan <ArrowUpRight size={17} />
              </Link>

              <Link to="/dashboard" className="hero-secondary">
                Explore dashboard <ChevronRight size={16} />
              </Link>
            </div>

            <div className="hero-proof">
              <span>
                <CheckCircle2 size={15} />
                Browser-based testing
              </span>

              <span>
                <CheckCircle2 size={15} />
                Reviewable fixes
              </span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div
            className="hero-visual"
            aria-label="Sentinel scan dashboard preview"
          >
            <div className="preview-window glass-panel">
              <div className="preview-top">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>

                <span className="mono-label">SENTINEL / RUN #142</span>

                <span className="live-pill">
                  <span />
                  LIVE
                </span>
              </div>

              <div className="preview-body">
                <div className="preview-heading">
                  <div>
                    <div className="small-label">SCAN OVERVIEW</div>
                    <h3>Storefront health</h3>
                  </div>

                  <div className="health-score">
                    <strong>92</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className="scan-track">
                  <span />
                </div>

                <div className="scan-status">
                  <Activity size={14} />
                  Agents working
                  <span>3 of 4 stages</span>
                </div>

                <div className="agent-stack">
                  <div className="agent-row">
                    <div className="agent-icon blue">
                      <ScanSearch size={15} />
                    </div>

                    <div>
                      <b>Explorer</b>
                      <small>18 findings detected</small>
                    </div>

                    <span className="status-check">
                      <CheckCircle2 size={16} />
                    </span>
                  </div>

                  <div className="agent-row">
                    <div className="agent-icon violet">
                      <TerminalSquare size={15} />
                    </div>

                    <div>
                      <b>Localizer</b>
                      <small>15 issues mapped to code</small>
                    </div>

                    <span className="status-check">
                      <CheckCircle2 size={16} />
                    </span>
                  </div>

                  <div className="agent-row">
                    <div className="agent-icon amber">
                      <Sparkles size={15} />
                    </div>

                    <div>
                      <b>Patcher</b>
                      <small>Drafting verified patch</small>
                    </div>

                    <span className="mini-loader" />
                  </div>
                </div>

                <div className="preview-footer">
                  <span>Latest activity</span>
                  <span className="activity-dot" />
                  <span>Checkout flow · issue resolved</span>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="floating-chip chip-top">
              <span className="chip-icon">
                <ShieldCheck size={15} />
              </span>

              <div>
                <b>Protected run</b>
                <small>Sandbox enabled</small>
              </div>
            </div>

            <div className="floating-chip chip-bottom">
              <span className="chip-icon green">
                <CheckCircle2 size={15} />
              </span>

              <div>
                <b>Fix verified</b>
                <small>Ready for review</small>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="capabilities" className="landing-features py-10 md:py-16">
          <div className="section-kicker">BUILT FOR THE FULL FIX CYCLE</div>

          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }, index) => (
              <article
                className="feature-card glass-panel"
                key={title}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="feature-icon">
                  <Icon size={19} />
                </div>

                <h3>{title}</h3>

                <p>{text}</p>

                <div className="feature-index">0{index + 1}</div>
              </article>
            ))}
          </div>
        </section>

        {/* Workflow section */}
        <section
          id="workflow"
          className="workflow-panel glass-panel my-10 md:my-16"
        >
          <div>
            <div className="section-kicker">FROM SIGNAL TO SOLUTION</div>

            <h2>
              One workflow.
              <br />
              <span>Four focused agents.</span>
            </h2>

            <p>
              Move from noisy bug reports to actionable, review-ready fixes with
              a clear trail at every step.
            </p>
          </div>

          <div className="workflow-steps">
            {["Explore", "Localize", "Patch", "Verify"].map((label, index) => (
              <div className="workflow-step" key={label}>
                <span>{String(index + 1).padStart(2, "0")}</span>

                <b>{label}</b>

                {index < 3 && <div className="workflow-line" />}
              </div>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section className="landing-bottom flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
          <div>
            <div className="section-kicker">READY WHEN YOU ARE</div>

            <h2>Make quality your advantage.</h2>
          </div>

          <Link to="/signup" className="hero-primary">
            Launch your first scan <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer relative z-10 flex flex-wrap justify-between gap-3 px-6 py-6 md:px-10">
        <span>© Sentinel · Agent QA Console</span>
        <span>Explore · Understand · Fix · Verify</span>
      </footer>
    </div>
  );
}