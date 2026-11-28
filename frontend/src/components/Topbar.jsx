import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export function Topbar({ title, subtitle }) {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [toast, setToast] = useState("");

  function toggleMic() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast("Voice commands require Chrome or Edge.");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setToast(`Heard: "${transcript}"`);
      setTimeout(() => setToast(""), 3500);

      if (transcript.includes("scan") || transcript.includes("launch")) navigate("/launcher");
      else if (transcript.includes("monitor") || transcript.includes("live")) navigate("/monitor");
      else if (transcript.includes("explorer") || transcript.includes("bug")) navigate("/explorer");
      else if (transcript.includes("fix")) navigate("/fixer");
      else if (transcript.includes("regress")) navigate("/regression");
      else if (transcript.includes("history")) navigate("/history");
      else if (transcript.includes("setting")) navigate("/settings");
      else if (transcript.includes("github")) navigate("/github");
      else if (transcript.includes("dashboard") || transcript.includes("home")) navigate("/dashboard");
    };

    recognition.onerror = () => {
      setToast("Could not hear clearly. Try again.");
      setTimeout(() => setToast(""), 2500);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <header className="h-[60px] border-b border-hairline flex items-center px-6 gap-4 sticky top-0 z-10 bg-void/85 backdrop-blur-md">
      <div>
        <div className="font-display font-semibold text-[16px]">{title}</div>
        <div className="text-[12px] text-text-dim -mt-0.5">{subtitle}</div>
      </div>

      {toast && (
        <div className="ml-4 font-mono text-[11px] bg-panel-raised border border-signal/40 text-signal px-2.5 py-1 rounded-md">
          {toast}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 bg-panel border border-hairline rounded-md px-2.5 py-1.5 w-[260px] text-text-dim">
        <Search className="w-3.5 h-3.5" />
        <input
          placeholder="Search bugs, files, runs…"
          className="bg-transparent border-none text-[12px] text-text w-full outline-none placeholder:text-text-dim"
        />
        <span className="font-mono text-[10px] bg-panel-raised border border-hairline rounded px-1.5 text-text-dim">
          ⌘K
        </span>
      </div>

      <button
        onClick={toggleMic}
        title="Voice command (say: new scan, open explorer, open fixer...)"
        className={cn(
          "w-8 h-8 rounded-full border flex items-center justify-center transition-colors relative",
          listening
            ? "bg-crit-dim border-crit text-crit pulse-ring"
            : "bg-panel border-hairline text-text-muted hover:border-signal hover:text-signal"
        )}
      >
        <Mic className="w-[15px] h-[15px]" />
      </button>

      <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-signal to-pass flex items-center justify-center font-display font-semibold text-[12px] text-void">
        D
      </div>
    </header>
  );
}