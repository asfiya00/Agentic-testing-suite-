import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { askChatbot } from "@/lib/api";

const initialMessages = [
  { from: "bot", text: "Ask me about any bug, scan, or paste a code snippet — I read from your stored MongoDB results." },
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { from: "user", text }]);
    setSending(true);
    try {
      const reply = await askChatbot(text);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: "bot", text: `Error: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Ask Sentinel"
        className="fixed bottom-6 right-6 w-[52px] h-[52px] rounded-full bg-signal flex items-center justify-center shadow-[0_8px_24px_rgba(91,141,239,0.35)] z-50 text-void"
      >
        <MessageSquare className="w-5 h-5" fill="currentColor" strokeWidth={0} />
      </button>

      <div
        className={cn(
          "fixed bottom-[90px] right-6 w-[340px] h-[440px] bg-panel border border-hairline rounded-xl z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex-col",
          open ? "flex" : "hidden"
        )}
      >
        <div className="px-4 py-3.5 border-b border-hairline flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-pass shadow-[0_0_0_3px_var(--color-pass-dim)]" />
          <div>
            <div className="font-semibold text-[13px]">Sentinel assistant</div>
            <div className="font-mono text-[10px] text-text-dim">answers from MongoDB scan data</div>
          </div>
        </div>

        <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] px-3 py-2 rounded-[10px] text-[12.5px] leading-relaxed whitespace-pre-wrap",
                m.from === "bot"
                  ? "bg-panel-raised border border-hairline self-start rounded-bl-[2px]"
                  : "bg-signal-dim self-end rounded-br-[2px]"
              )}
            >
              {m.text}
            </div>
          ))}
          {sending && (
            <div className="max-w-[85%] px-3 py-2 rounded-[10px] text-[12px] bg-panel-raised border border-hairline self-start text-text-dim">
              Thinking...
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-hairline">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a bug or run…"
            className="flex-1 bg-void border border-hairline rounded-full px-3.5 py-2 text-[12.5px] outline-none focus:border-signal"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-8 h-8 rounded-full bg-signal flex-shrink-0 flex items-center justify-center text-void"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </>
  );
}