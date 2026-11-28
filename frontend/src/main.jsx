import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Sentinel render error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: "100vh", background: "#080c13", color: "#e8eef8", padding: "48px 24px", fontFamily: "Inter, sans-serif" }}>
          <section style={{ maxWidth: 760, margin: "0 auto", padding: 28, border: "1px solid #263449", borderRadius: 18, background: "#101925" }}>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>Sentinel could not render this page</h1>
            <p style={{ color: "#9bacbf", marginBottom: 18 }}>A component threw a runtime error. Copy this message and share it to troubleshoot:</p>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: "#fca5a5", background: "#090f18", padding: 16, borderRadius: 10 }}>{String(this.state.error?.stack || this.state.error)}</pre>
            <button onClick={() => window.location.reload()} style={{ marginTop: 18, padding: "10px 16px", borderRadius: 9, background: "#4778c8", color: "white", border: 0, cursor: "pointer" }}>Reload app</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
