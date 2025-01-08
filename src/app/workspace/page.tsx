import { Sidebar } from "@/components/workspace/Sidebar";
import { WorkspaceMain } from "@/components/workspace/WorkspaceMain";

export default function WorkspacePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <WorkspaceMain />
    </div>
  );
} 