import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Chatbot } from "@/components/Chatbot";

export function Layout({ title, subtitle, children }) {
  return (
    <div className="grid grid-cols-[236px_1fr] min-h-screen">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="px-7 pt-6 pb-20 flex-1 animate-fadein">{children}</main>
      </div>
      <Chatbot />
    </div>
  );
}
