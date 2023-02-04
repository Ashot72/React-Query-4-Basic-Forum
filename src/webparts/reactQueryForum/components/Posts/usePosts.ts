import { IItemUpdateResult } from "@pnp/sp/items"
import { useQuery, useMutation, UseMutateFunction, useInfiniteQuery } from "@tanstack/react-query"
import { qr_posts, pageItems, queryKeys } from "../../../../constants"
import ListService from "../../../../services/ListService"
import { IPost } from "../../../../interfaces"
import { queryClient } from "../../queryClient"

export const usePosts = (postId: number) =>
    useInfiniteQuery({
        queryKey: [queryKeys.posts],
        queryFn: ({ pageParam = 1 }) => ListService.getPosts(postId, pageParam),
        getNextPageParam: (lastPage: { posts: IPost[], count: number }, pages) =>
            ((pages.length * pageItems) < lastPage.count)
                ? pages.length + 1
                : undefined
    })

export const usePost = (postId: number) =>
    postId
        ? useQuery({
            queryKey: [queryKeys.post, postId],
            queryFn: () =>
                ListService.getListItem(qr_posts, postId),
            initialData: () => {
                const mapped = (queryClient.getQueryData([queryKeys.posts]) as any)?.pages.map(d => d.posts)
                return mapped.flat().filter(post => post.Id === postId)
            }
        })
        : { data: null }

export const useAddPost = (onSuccess):
    UseMutateFunction<void, unknown, IPost, unknown> => {

    const addPost = (post: IPost) => ListService.addPost(post)

    const { mutate } = useMutation(addPost, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.posts]
            })

            queryClient.removeQueries([queryKeys.forums]);
            onSuccess()
        }
    })

    return mutate
}

export const useUpdatePost = (onSuccess):
    UseMutateFunction<IPost, unknown, IPost, unknown> => {

    const updatePost = (post: IPost) =>
        ListService.updateListItem(qr_posts, post)

    const { mutate } = useMutation(updatePost, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.posts]
            })

            onSuccess()
        }
    })

    return mutate
}

export const useDeletePost = (onSuccess):
    UseMutateFunction<void, unknown, IPost, unknown> => {

    const deletePost = (post: IPost) =>
        ListService.deletePost(post)

    const { mutate } = useMutation(deletePost, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.posts]
            })

            queryClient.removeQueries([queryKeys.forums]);
            onSuccess()
        }
    })

    return mutate
}

export const useAnswered = ():
    UseMutateFunction<IItemUpdateResult, unknown, IPost, unknown> => {

    const answerPost = (post: IPost) =>
        ListService.markAsAnswered(post)

    const { mutate } = useMutation(answerPost, {
        onMutate: async (newPost: IPost) => {
            await queryClient.cancelQueries([queryKeys.posts])
            const previousPosts = queryClient.getQueriesData([queryKeys.posts])

            queryClient.setQueriesData([queryKeys.posts], (group: any) => {
                const mapped = group.pages.map(d => d.posts)
                const post: IPost = mapped.flat().find(p => p.Id == newPost.Id)
                post.Answered = !newPost.Answered

                return group
            })
            return { previousPosts }
        },
        onError: (error: any, post: IPost, context) => {
            queryClient.setQueriesData([queryKeys.posts], context.previousPosts)
        },
        onSettled: () => {
            queryClient.invalidateQueries([queryKeys.posts])
        }
    })

    return mutate
}