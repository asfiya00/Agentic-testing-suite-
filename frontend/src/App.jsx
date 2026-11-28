import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import Launcher from "@/pages/Launcher";
import Monitor from "@/pages/Monitor";
import Explorer from "@/pages/Explorer";
import BugDetail from "@/pages/BugDetail";
import Fixer from "@/pages/Fixer";
import GithubPanel from "@/pages/GithubPanel";
import Regression from "@/pages/Regression";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";

function Page({ title, subtitle, children }) {
  return (
    <Layout title={title} subtitle={subtitle}>
      {children}
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signin" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route
          path="/dashboard"
          element={
            <Page title="Dashboard" subtitle="Overview across all scans">
              <Dashboard />
            </Page>
          }
        />
        <Route
          path="/launcher"
          element={
            <Page title="New scan" subtitle="Point Sentinel at a repository">
              <Launcher />
            </Page>
          }
        />
        <Route
          path="/monitor"
          element={
            <Page title="Live agent monitor" subtitle="Real-time feed for run #142">
              <Monitor />
            </Page>
          }
        />
        <Route
          path="/explorer"
          element={
            <Page title="Error explorer" subtitle="Every finding, filterable">
              <Explorer />
            </Page>
          }
        />
        <Route
          path="/explorer/:id"
          element={
            <Page title="Bug report" subtitle="Detail view">
              <BugDetail />
            </Page>
          }
        />
        <Route
          path="/fixer"
          element={
            <Page title="Code fixer" subtitle="Patches, PRs, and verification">
              <Fixer />
            </Page>
          }
        />
        <Route
          path="/github"
          element={
            <Page title="GitHub integration" subtitle="Repository and route mapping">
              <GithubPanel />
            </Page>
          }
        />
        <Route
          path="/regression"
          element={
            <Page title="Regression view" subtitle="Run-over-run comparison">
              <Regression />
            </Page>
          }
        />
        <Route
          path="/history"
          element={
            <Page title="History & trends" subtitle="Every past scan">
              <History />
            </Page>
          }
        />
        <Route
          path="/settings"
          element={
            <Page title="Settings" subtitle="Account and guardrails">
              <Settings />
            </Page>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
