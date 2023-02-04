import { useQuery, useMutation, UseMutateFunction } from "@tanstack/react-query"
import { queryClient } from "../../queryClient"
import ListService from "../../../../services/ListService"
import { queryKeys, pageItems, qr_topics } from "../../../../constants"
import { IPost, ITopic } from "../../../../interfaces"
import { useForum } from "../Forums/useForums"

export const useTopics = (forumId: number, skip: number) => {
    //demoing dependent queries, refresh topics page directly
    const { data: forum } = useForum(+forumId)

    return useQuery({
        queryKey: [queryKeys.topics, skip / pageItems],
        enabled: !!forum,
        queryFn: () => ListService.getTopics(forum[0].Id, skip),
        keepPreviousData: true
    })
}

export const useTopic = (topicId: number) =>
    topicId
        ? useQuery({
            queryKey: [queryKeys.topic, topicId],
            queryFn: () =>
                ListService.getListItem(qr_topics, topicId),
            initialData: () => {
                const queryInfo = queryClient.getQueryCache().findAll({ type: 'active' })

                if (queryInfo.length === 0) {
                    return { data: null }
                } else {
                    const topicQuery = queryInfo.find(f => f.queryKey[0] === "topics")
                    return topicQuery
                        ? (queryClient.getQueryData([queryKeys.topics, topicQuery.queryKey[1]]) as any)?.topics?.filter(topic => topic.Id === topicId)
                        : { data: null }
                }
            }
        })
        : { data: null }

export const useAddTopic = (onSuccess):
    UseMutateFunction<ITopic[], unknown, { topic: ITopic, post: IPost }, unknown> => {

    const addTopic = ({ topic, post }) =>
        ListService.addTopic(topic, post)

    const { mutate } = useMutation(addTopic, {
        onSuccess: ([topic]) => {
            const queryInfo = queryClient.getQueryCache().findAll({ type: 'active' })
            const topicQuery = queryInfo.find(f => f.queryKey[0] === "topics")

            queryClient.setQueryData([queryKeys.topics, topicQuery.queryKey[1]], ({ topics, count }) => {
                topics.push(topic)

                queryClient.removeQueries([queryKeys.forums])
                return { topics, count: count + 1 }
            })
            onSuccess()
        }
    })

    return mutate
}

export const useUpdateTopic = (onSuccess):
    UseMutateFunction<ITopic, unknown, ITopic, unknown> => {

    const updateTopic = (topic: ITopic) =>
        ListService.updateListItem(qr_topics, topic)

    const { mutate } = useMutation(updateTopic, {
        onSuccess: ({ Id, Title }: ITopic) => {
            const queryInfo = queryClient.getQueryCache().findAll({ type: 'active' })
            const topicQuery = queryInfo.find(f => f.queryKey[0] === "topics")

            queryClient.setQueryData([queryKeys.topics, topicQuery.queryKey[1]], ({ topics, count }) => {
                const topic: ITopic = topics.find(t => t.Id === Id)
                topic.Title = Title

                return { topics, count }
            })
            onSuccess()
        }
    })

    return mutate
}

export const useDeleteTopic = (onSuccess):
    UseMutateFunction<any, unknown, ITopic, unknown> => {

    const deleteTopic = (topic: ITopic) =>
        ListService.deleteTopic(topic)

    const { mutate } = useMutation(deleteTopic, {
        onSuccess: ({ id }) => {
            const queryInfo = queryClient.getQueryCache().findAll({ type: 'active' })
            const topicQuery = queryInfo.find(f => f.queryKey[0] === "topics")

            queryClient.setQueryData([queryKeys.topics, topicQuery.queryKey[1]], ({ topics, data }) => {
                const newTopics = topics.filter(t => t.Id !== id)
                return { topics: newTopics, data: data - 1 }
            })

            queryClient.removeQueries([queryKeys.forums])
            onSuccess()
        }
    })

    return mutate
}