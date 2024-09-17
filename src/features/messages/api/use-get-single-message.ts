import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

interface useGetSingleMessageProps {
    id : Id<"messages">
}

export const useGetSingleMessage = ({id} : useGetSingleMessageProps) => {
    const data = useQuery(api.messages.getById, {id})
    const isLoading = data === undefined;

    return{data, isLoading}
}