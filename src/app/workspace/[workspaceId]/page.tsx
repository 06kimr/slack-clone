//Server Component
// interface WorkspaceIdPageProps{
//     params: {
//         workspaceId: string
//     }
// }

// const WorkspaceIdPage = ({params}: WorkspaceIdPageProps) => {

//     return(<div>
//         ID: {params.workspaceId}
//     </div>)
// }

// export default WorkspaceIdPage

"use client"

import { useGetSingleWorkspace } from "@/features/workspaces/api/use-get-single-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const WorkspaceIdPage = () => {
    const workspaceId = useWorkspaceId();
    const {data} = useGetSingleWorkspace({id: workspaceId})

    return(<div>
        Workspace ID page
    </div>)
}

export default WorkspaceIdPage
