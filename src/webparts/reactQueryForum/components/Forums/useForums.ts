import { useQuery, useMutation, UseMutateFunction } from "@tanstack/react-query"
import { IItemAddResult } from "@pnp/sp/items"
import { qr_forums, queryKeys } from "../../../../constants"
import ListService from "../../../../services/ListService"
import { IForum } from "../../../../interfaces"
import { queryClient } from "../../queryClient"

export const useForums = (refetchInterval: number = 0) =>
    useQuery({
        queryKey: [queryKeys.forums],
        refetchInterval,
        queryFn: () => ListService.getForums(),
        staleTime: 600000, // 10 minutes
        cacheTime: 900000, // default cacheTime is 5 minutes; doesn't make sense for staleTime to exceed cacheTime
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

export const useForum = (forumId: number) =>
    forumId
        ? useQuery({
            queryKey: [queryKeys.forum, forumId],
            queryFn: () =>
                ListService.getListItem(qr_forums, forumId),
            initialData: () =>
                (queryClient.getQueryData([queryKeys.forums]) as any)?.filter(forum => forum.Id === forumId)
        })
        : { data: null }

export const useAddForum = (onSuccess):
    UseMutateFunction<IItemAddResult, unknown, IForum, unknown> => {

    const addForum = (forum: IForum) =>
        ListService.addForum(forum)

    const { mutate } = useMutation(addForum, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.forums]
            })
            onSuccess()
        }
    })

    return mutate
}

export const useUpdateForum = (onSuccess):
    UseMutateFunction<IForum, unknown, IForum, unknown> => {

    const updateForum = (forum: IForum) =>
        ListService.updateListItem(qr_forums, forum)

    const { mutate } = useMutation(updateForum, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.forums]
            })
            onSuccess()
        }
    })

    return mutate
}

export const useDeleteForum = (onSuccess):
    UseMutateFunction<void, unknown, IForum, unknown> => {

    const deleteForum = (forum: IForum) =>
        ListService.deleteForum(forum.Id)

    const { mutate } = useMutation(deleteForum, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.forums]
            })
            onSuccess()
        }
    })

    return mutate
}