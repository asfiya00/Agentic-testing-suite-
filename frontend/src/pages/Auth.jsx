import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function Auth({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setNotice("");

    if (isSignup && !accepted) {
      setNotice("Please accept the terms to continue.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.name.trim(),
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          navigate("/dashboard");
        } else {
          setNotice(
            "Account created successfully! Please check your email to verify your account, then sign in.",
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      const message = error.message || "";

      if (message.toLowerCase().includes("already registered")) {
        setNotice("This email is already registered. Please sign in.");
      } else if (message.toLowerCase().includes("invalid login credentials")) {
        setNotice("Incorrect email or password.");
      } else if (message.toLowerCase().includes("password")) {
        setNotice(message);
      } else {
        setNotice(message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGithub() {
    setNotice("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setNotice(error.message || "GitHub sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-a" />
      <div className="auth-glow auth-glow-b" />

      <header className="auth-header">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">
            <ShieldCheck size={21} />
          </span>

          <span>
            <b>Sentinel</b>
            <small>Agent QA platform</small>
          </span>
        </Link>

        <Link to="/" className="auth-back">
          Back to home
        </Link>
      </header>

      <section className="auth-shell">
        <div className="auth-card glass-panel">
          <div className="auth-card-top">
            <span className="auth-mini-mark">
              <ShieldCheck size={17} />
            </span>

            <span className="auth-secure">
              <span />
              Secure workspace
            </span>
          </div>

          <div className="auth-heading">
            <div className="auth-overline">
              {isSignup ? "GET STARTED" : "WELCOME BACK"}
            </div>

            <h1>{isSignup ? "Create your account" : "Sign in to Sentinel"}</h1>

            <p>
              {isSignup
                ? "Start finding issues and shipping reliable software."
                : "Continue to your quality engineering workspace."}
            </p>
          </div>

          <div className="auth-switch">
            <Link className={!isSignup ? "active" : ""} to="/login">
              Sign in
            </Link>

            <Link className={isSignup ? "active" : ""} to="/signup">
              Create account
            </Link>
          </div>

          <button
            type="button"
            className="auth-social"
            onClick={signInWithGithub}
            disabled={loading}
          >
            <FaGithub size={17} />
            Continue with GitHub
          </button>

          <div className="auth-divider">
            <span />
            <small>or continue with email</small>
            <span />
          </div>

          <form className="auth-form" onSubmit={submit}>
            {isSignup && (
              <label>
                Full name
                <div className="auth-input-wrap">
                  <input
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />

                  <CheckCircle2 size={16} className="auth-input-icon" />
                </div>
              </label>
            )}

            <label>
              Email address
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label>
              Password
              <div className="auth-input-wrap">
                <LockKeyhole size={16} className="auth-input-icon" />

                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update}
                  placeholder={
                    isSignup ? "At least 6 characters" : "Enter your password"
                  }
                  minLength={6}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                />

                <button
                  className="auth-eye"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {!isSignup && (
              <div className="auth-form-meta">
                <label className="auth-check">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="auth-text-button"
                  onClick={() =>
                    setNotice(
                      "To reset your password, use the password reset option in your Supabase authentication setup.",
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>
            )}

            {isSignup && (
              <label className="auth-check auth-terms">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                />

                <span>
                  I agree to the{" "}
                  <a href="#terms" onClick={(event) => event.preventDefault()}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#privacy"
                    onClick={(event) => event.preventDefault()}
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}

              {!loading && <ArrowRight size={17} />}
            </button>

            {notice && (
              <p className="auth-notice" role="status">
                {notice}
              </p>
            )}
          </form>

          <p className="auth-footnote">
            {isSignup ? "Already have an account?" : "New to Sentinel?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>

        <aside className="auth-side-note">
          <div className="auth-side-icon">
            <ShieldCheck size={20} />
          </div>

          <h2>Quality you can trust.</h2>

          <p>
            Explore, localize, patch, and verify with a clear audit trail across
            every run.
          </p>

          <div className="auth-side-points">
            <span>
              <CheckCircle2 size={15} />
              Reviewable code changes
            </span>

            <span>
              <CheckCircle2 size={15} />
              Isolated test runs
            </span>

            <span>
              <CheckCircle2 size={15} />
              One connected workflow
            </span>
          </div>

          <div className="auth-side-caption">
            SENTINEL · AUTONOMOUS QUALITY ENGINEERING
          </div>
        </aside>
      </section>

      <footer className="auth-footer">
        <span>© Sentinel</span>
        <span>Secure access to your QA workspace</span>
      </footer>
    </main>
  );
}
