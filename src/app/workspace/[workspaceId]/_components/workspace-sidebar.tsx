import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetSingleWorkspace } from "@/features/workspaces/api/use-get-single-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } =
    useGetSingleWorkspace({ id: workspaceId });

  if (workspaceLoading || memberLoading) {
    return (
      <div className="flex flex-col bg-[#532c5f] h-full items-center justify-center ">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col gap-y-2bg-[#532c5f] h-full items-center justify-center ">
        <AlertTriangle className="size-5 text-white text-sm" />
        <p>Workspace not found</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-2bg-[#532c5f] h-full">
        <WorkspaceHeader workspace={workspace} isAdmin={member.role === 'admin'}/>
    </div>
  );
};
