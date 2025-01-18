import { Sidebar } from "@/components/workspace/Sidebar";
import { WorkspaceMain } from "@/components/workspace/WorkspaceMain";
import { UserButton } from '@/components/UserButton';
import { AuthWrapper } from '@/components/providers/AuthWrapper';

export default function WorkspacePage() {
  return (
    <AuthWrapper>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <WorkspaceMain />
        <UserButton />
      </div>
    </AuthWrapper>
  );
} 