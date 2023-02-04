import * as React from 'react'
import Moment from 'react-moment'
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import rqStyles from '../ReactQueryForum.module.scss'
import styles from './Posts.module.scss';
import * as strings from 'ReactQueryForumWebPartStrings';
import { dateFormat } from '../../../../constants';
import useCurrentUser from '../../useCurrentUser';
import { IPost } from '../../../../interfaces';

const Post: React.FC<IPost> = (post: IPost) => {
    const user = useCurrentUser()

    return (
        <div className={styles.item}>
            <div>{strings.By} <i>{post.PosterName}</i></div>
            <div>{post.PosterEmail}</div>
            <span className={styles.date}>
                <Moment format={dateFormat}>
                    {post.CreatedDate}
                </Moment>
            </span>
            <br />
            <div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: post.Content.split("\n").join("<br />") }} />
            <div className={styles.icons}>
                <>
                    {
                        ((user && user.IsSiteAdmin) || post.firstPost.PosterName === user.Title)
                            ? <Icon
                                iconName={post.Answered ? 'CompletedSolid' : 'Completed'}
                                className={rqStyles.icon}
                                title={post.Answered ? strings.NotAnswered : strings.Answered}
                                onClick={() => post.markAnswered(post)}
                            />
                            : <Icon
                                iconName={post.Answered ? 'CompletedSolid' : 'Completed'}
                                className={rqStyles.icon}
                                style={{ cursor: "not-allowed" }}
                                title={post.Answered ? strings.NotAnswered : strings.Answered}
                            />
                    }
                    {
                        ((user && user.IsSiteAdmin) || post.PosterName === user.Title) &&
                        <Icon
                            iconName='Edit'
                            className={rqStyles.icon}
                            title={strings.EditPost}
                            onClick={() => post.editPost(post.Id)}
                        />
                    }
                </>
            </div>
            <hr />
        </div>
    )
}

export default Post