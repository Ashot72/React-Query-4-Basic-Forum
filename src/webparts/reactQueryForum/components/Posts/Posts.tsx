import * as React from 'react'
import { useState } from 'react';
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Link, useParams } from "react-router-dom"
import * as strings from 'ReactQueryForumWebPartStrings';
import rqStyles from '../ReactQueryForum.module.scss'
import styles from './Posts.module.scss';
import { useAnswered, usePosts } from './usePosts';
import SidePanel from '../shared/SidePanel';
import Navigation from '../shared/Navigation';
import { useForum } from '../Forums/useForums';
import { useTopic } from '../Topics/useTopics';
import Post from './Post'
import Form from './Form';
import { IPost } from '../../../../interfaces';
import { Actions } from '../../../../constants'

const Posts: React.FC = () => {
    const { fid, tid } = useParams();

    const [isOpen, setIsOpen] = useState(false)
    const [postId, setPostId] = useState(0)

    const { data: forum } = useForum(+fid)
    const { data: topic } = useTopic(+tid)
    const { data, hasNextPage, fetchNextPage } = usePosts(+tid)
    const answerPost = useAnswered()

    const markAnswered = (post: IPost) => {
        answerPost(post)
    }

    const editPost = (id: number) => {
        setPostId(id)
        setIsOpen(true);
    }

    const forumName = (forum && forum.length > 0) ? forum[0].Title : ''
    const topicName = (topic && topic.length > 0) ? topic[0].Title : ''

    return (
        <div className={styles.posts}>
            <Navigation forumName={forumName} forumId={+fid} topicName={topicName} />
            <Link onClick={() => editPost(0)}>{strings.ReplyPost}</Link>
            <br /><br />
            <div className={rqStyles.headerContainer}>
                <div className={`ms-Grid-row ${rqStyles.header}`}>
                    <div className="ms-Grid-col ms-sm12">{topicName}</div>
                </div>
            </div>
            {
                data?.pages.map((postsGroup: { posts: IPost[], count: number }, i) =>
                    <React.Fragment key={i}>
                        {(postsGroup.posts as IPost[]).map((post: IPost) =>
                            <div className={`ms-Grid-row ${rqStyles.row}`} key={post.Id}>
                                <Post {...post} firstPost={postsGroup.posts[0]} editPost={editPost} markAnswered={markAnswered} />
                            </div>
                        )}
                    </React.Fragment>
                )}

            <div className={rqStyles.center}>
                <PrimaryButton onClick={() => fetchNextPage()} disabled={!hasNextPage}>{strings.LoadMore}</PrimaryButton>
            </div>
            <SidePanel isOpen={isOpen} setIsOpen={setIsOpen}>
                <Form
                    forumId={+fid}
                    topic={topic}
                    postId={postId}
                    action={postId ? Actions.Update : Actions.AddOrReply}
                    handleClose={() => setIsOpen(false)}
                />
            </SidePanel>
        </div >
    )
}

export default Posts