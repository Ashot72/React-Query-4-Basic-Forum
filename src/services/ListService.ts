import { sp } from '@pnp/sp'
import { IItemAddResult, IItemUpdateResult } from '@pnp/sp/items'
import { IForum, ITopic, IPost } from '../interfaces'
import { qr_forums, qr_posts, qr_topics, pageItems } from '../constants'

export default class ListService {
    public static getListItem = <T>(title: string, id: number): Promise<T> =>
        sp.web.lists
            .getByTitle(title)
            .items
            .filter(`Id eq ${id}`)
            .get()

    public static updateListItem = <T>(title: string, item: any): Promise<T> =>
        sp.web.lists
            .getByTitle(title)
            .items
            .getById(item.Id)
            .update(item)
            .then(async () => {
                const [getItem] = await ListService.getListItem(title, item.Id) as T[]
                return getItem
            })

    public static getForums = () =>
        sp.web.lists
            .getByTitle(qr_forums)
            .items
            .get()

    public static addForum = (item: any): Promise<IItemAddResult> =>
        sp.web.lists
            .getByTitle(qr_forums)
            .items
            .add(item)

    public static deleteForum = async (forumId: number): Promise<void> => {
        const lists = sp.web.lists

        await lists.getByTitle(qr_topics).items.filter(`ForumId eq ${forumId}`).get()
            .then(topics => {
                let batch = sp.web.createBatch()
                topics.forEach(topic => {
                    lists.getByTitle(qr_topics).items.getById(topic.Id).inBatch(batch).delete()
                });
                batch.execute()
            })

        await lists.getByTitle(qr_posts).items.filter(`ForumId eq ${forumId}`).get()
            .then(posts => {
                let batch = sp.web.createBatch()
                posts.forEach(post => {
                    lists.getByTitle(qr_posts).items.getById(post.Id).inBatch(batch).delete()
                });
                batch.execute()
            })

        await lists.getByTitle(qr_forums).items.getById(forumId).delete()
    }

    public static getTopics = async (forumId: number, skip = 0): Promise<{ topics: ITopic[], count: number }> => {
        // imitate paging
        const items: ITopic[] = await sp.web.lists
            .getByTitle(qr_topics)
            .items
            .filter(`ForumId eq ${forumId}`)
            .get()

        const topics: ITopic[] = []

        for (var i = skip; i < skip + pageItems; i++) {
            const item: ITopic = items[i]

            if (item) {
                topics.push(item)
            }
        }

        return { topics, count: items.length }
    }

    public static addTopic = (topic: ITopic, post: IPost): Promise<ITopic[]> => {
        const lists = sp.web.lists
        const topicFilter = `ForumId eq ${topic.ForumId}`

        const updateForumLastInfo = (p: Partial<IPost> = {}, topics: number = 0, posts: number = 0): Promise<ITopic[]> => {

            const forum =
                {
                    LastTopic: p.Title || '',
                    LastForumId: p.ForumId || 0,
                    LastTopicId: p.TopicId || 0,
                    LastPosterName: p.PosterName || '',
                    LastPosterEmail: p.PosterEmail || '',
                    LastUpdate: p.CreatedDate || 0,
                    Topics: topics,
                    Posts: posts
                } as IForum

            return lists.getByTitle(qr_forums).items.getById(post.ForumId).update(forum)
                .then(async () =>
                    await ListService.getListItem(qr_topics, post.TopicId) as ITopic[]
                )
        }

        return lists.getByTitle(qr_topics).items.add(topic)
            .then((res: IItemAddResult) => {
                post.TopicId = res.data.Id;
                return lists.getByTitle(qr_posts).items.add(post)
                    .then(() => lists.getByTitle(qr_topics).items
                        .filter(topicFilter)
                        .get()
                        .then(topics => {
                            const topicsPosts = []

                            let batch = sp.web.createBatch()
                            topics.forEach(t =>
                                lists.getByTitle(qr_posts).items
                                    .filter(`TopicId eq ${t.Id}`)
                                    .inBatch(batch).get()
                                    .then(posts => topicsPosts.push(...posts))
                            );

                            return batch.execute()
                                .then(() => {
                                    const forumTopics = topics.filter(t => t.ForumId === post.ForumId)
                                    const forumPosts = topicsPosts.filter(p => p.ForumId === post.ForumId)

                                    if (forumPosts.length > 0) {
                                        const lastPost = forumPosts[forumPosts.length - 1]
                                        return updateForumLastInfo(lastPost, forumTopics.length, forumPosts.length)
                                    }
                                    else {
                                        return updateForumLastInfo()
                                    }
                                })
                        }))
            })
    }

    public static deleteTopic = (topic: ITopic): Promise<{ id: number }> => {
        const lists = sp.web.lists
        const updateForumLastInfo = (post: Partial<IPost> = {}, topics: number = 0, posts: number = 0): Promise<{ id: number }> => {

            const forum = {
                LastTopic: post.Title || '',
                LastForumId: post.ForumId || 0,
                LastTopicId: post.TopicId || 0,
                LastPosterName: post.PosterName || '',
                LastPosterEmail: post.PosterEmail || '',
                LastUpdate: post.CreatedDate || 0,
                Topics: topics,
                Posts: posts
            }

            return lists.getByTitle(qr_forums).items.getById(topic.ForumId).update(forum)
                .then(() => ({ id: topic.Id }))
        }

        const topicFilter = `ForumId eq ${topic.ForumId}`

        return lists.getByTitle(qr_posts).items.filter(`TopicId eq ${topic.Id}`).get()
            .then(posts => {
                let batch = sp.web.createBatch()
                posts.forEach(post => {
                    lists.getByTitle(qr_posts).items.getById(post.Id).inBatch(batch).delete()
                });
                return batch.execute()
                    .then(() => lists.getByTitle(qr_topics).items.getById(topic.Id).delete()
                        .then(() => lists.getByTitle(qr_topics).items.filter(topicFilter).get()
                            .then(topics => {
                                const topicsPosts = []

                                batch = sp.web.createBatch()
                                topics.forEach(t =>
                                    lists.getByTitle(qr_posts).items.filter(`TopicId eq ${t.Id}`).inBatch(batch).get()
                                        .then(p => {
                                            topicsPosts.push(...p)
                                        })
                                );

                                return batch.execute()
                                    .then(() => {
                                        const forumTopics = topics.filter(t => t.ForumId === topic.ForumId)
                                        const forumPosts = topicsPosts.filter(p => p.ForumId === topic.ForumId)

                                        if (forumPosts.length > 0) {
                                            const lastPost = forumPosts.slice(-1).pop()
                                            return updateForumLastInfo(lastPost, forumTopics.length, forumPosts.length)

                                        } else {
                                            return updateForumLastInfo()
                                        }
                                    })
                            })
                        )
                    )
            })
    }

    public static getPosts = async (topicId: number, pageParam: number): Promise<{ posts: IPost[], count: number }> => {
        // imitate paging
        const items: IPost[] = await sp.web.lists
            .getByTitle(qr_posts)
            .items
            .filter(`TopicId eq ${topicId}`)
            .get()

        const posts: IPost[] = []
        for (var i = (pageParam - 1) * pageItems; i < (pageParam - 1) * pageItems + pageItems; i++) {
            const item: IPost = items[i]

            if (item) {
                posts.push(item)
            }
        }

        return { posts, count: items.length }
    }

    public static addPost = (post: IPost): Promise<void> => {
        const lists = sp.web.lists
        const topicFilter = `ForumId eq ${post.ForumId}`

        return lists.getByTitle(qr_posts).items.add(post)
            .then(() => lists.getByTitle(qr_topics).items.filter(topicFilter).get()
                .then(topics => {
                    const topicsPosts = []

                    let batch = sp.web.createBatch()
                    topics.forEach(topic =>
                        lists.getByTitle(qr_posts).items.filter(`TopicId eq ${topic.Id}`).inBatch(batch).get()
                            .then(posts => topicsPosts.push(...posts))
                    );

                    return batch.execute()
                        .then(() => {
                            batch = sp.web.createBatch()

                            const forumTopics = topics.filter(t => t.ForumId === post.ForumId)
                            const forumPosts = topicsPosts.filter(p => p.ForumId === post.ForumId)
                            const topicPosts = topicsPosts.filter(p => p.TopicId === post.TopicId)

                            const topic = {
                                Replies: topicPosts.length - 1,
                                LastPosterName: post.PosterName,
                                LastPosterEmail: post.PosterEmail,
                                LastUpdate: post.CreatedDate
                            } as ITopic

                            lists.getByTitle(qr_topics).items.getById(post.TopicId).inBatch(batch).update(topic)

                            const forum = {
                                LastTopic: post.Title,
                                LastForumId: post.ForumId,
                                LastTopicId: post.TopicId,
                                LastPosterName: post.PosterName,
                                LastPosterEmail: post.PosterEmail,
                                LastUpdate: post.CreatedDate,
                                Topics: forumTopics.length,
                                Posts: forumPosts.length
                            } as IForum

                            lists.getByTitle(qr_forums).items.getById(post.ForumId).inBatch(batch).update(forum)

                            return batch.execute()
                        })
                })
            )
    }

    public static markAsAnswered = (post: IPost): Promise<IItemUpdateResult> =>
        sp.web.lists
            .getByTitle(qr_posts)
            .items
            .getById(post.Id)
            .update({ Answered: !post.Answered })


    public static deletePost = (post: IPost): Promise<void> => {
        const lists = sp.web.lists

        const updateLastInfo = (forumInfo, topicInfo): Promise<void> => {
            const { post: p, topics, posts } = forumInfo
            const { topic, replies } = topicInfo

            let batch = sp.web.createBatch()

            const forum: Partial<IForum> = {
                LastTopic: p.Title || '',
                LastForumId: p.ForumId || 0,
                LastTopicId: p.TopicId || 0,
                LastPosterName: p.PosterName || '',
                LastPosterEmail: p.PosterEmail || '',
                LastUpdate: p.CreatedDate || 0,
                Topics: topics,
                Posts: posts
            }

            const t: Partial<ITopic> = {
                Replies: replies,
                LastPosterName: topic.PosterName,
                LastPosterEmail: topic.PosterEmail,
                LastUpdate: topic.CreatedDate
            }

            lists.getByTitle(qr_forums).items.getById(post.ForumId).inBatch(batch).update(forum)
            lists.getByTitle(qr_topics).items.getById(post.TopicId).inBatch(batch).update(t)

            return batch.execute()
        }

        const topicFilter = `ForumId eq ${post.ForumId}`

        return lists.getByTitle(qr_posts).items.getById(post.Id).delete()
            .then(() => lists.getByTitle(qr_topics).items.filter(topicFilter).get()
                .then(topics => {
                    const topicsPosts = []

                    let batch = sp.web.createBatch()
                    topics.forEach(t =>
                        lists.getByTitle(qr_posts).items.filter(`TopicId eq ${t.Id}`).inBatch(batch).get()
                            .then(p => {
                                topicsPosts.push(...p)
                            })
                    );

                    return batch.execute()
                        .then(() => {
                            const forumTopics = topics.filter(t => t.ForumId === post.ForumId)
                            const forumPosts = topicsPosts.filter(p => p.ForumId === post.ForumId)
                            const topicPosts = topicsPosts.filter(p => p.TopicId === post.TopicId)

                            const lastPost = forumPosts.length > 0 ? forumPosts.slice(-1).pop() : {}
                            const lastTopic = topicPosts.length > 0 ? topicPosts.slice(-1).pop() : {}

                            const forumInfo = { post: lastPost, topics: forumTopics.length, posts: forumPosts.length }
                            const topicInfo = { topic: lastTopic, replies: topicPosts.length - 1 }

                            return updateLastInfo(forumInfo, topicInfo)
                        })
                })
            )
    }
}