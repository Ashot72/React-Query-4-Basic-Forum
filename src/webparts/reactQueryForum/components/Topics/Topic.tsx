import * as React from 'react'
import Moment from 'react-moment'
import { Link } from "react-router-dom"
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import rqStyles from '../ReactQueryForum.module.scss'
import * as strings from 'ReactQueryForumWebPartStrings';
import { dateFormat } from '../../../../constants';
import useCurrentUser from '../../useCurrentUser';
import { ITopic } from '../../../../interfaces'

const Topic: React.FC<ITopic> = (topic: ITopic) => {
    const user = useCurrentUser();

    return (
        <>
            <div className="ms-Grid-col ms-sm5">
                <Link to={`/posts/${topic.ForumId}/${topic.Id}`}>{topic.Title}</Link>
                <div>{topic.Description}</div>
                <div>{strings.By} {topic.CreatorName}</div>
                <div>
                    <Moment format={dateFormat}>
                        {topic.CreatedDate}
                    </Moment>
                </div>
            </div>
            <div className="ms-Grid-col ms-sm2">
                <div>
                    {strings.Replies}:{' '}
                    <Link to={`/posts/${topic.ForumId}/${topic.Id}`}>{topic.Replies}</Link>
                </div>
                <div>
                    {strings.Views}:{' '}
                    <Link to={`/posts/${topic.ForumId}/${topic.Id}`}>{topic.Views}</Link>
                </div>
            </div>
            <div className="ms-Grid-col ms-sm4">
                {topic.LastPosterName && <div>{strings.By} {topic.LastPosterName} </div>}
                {topic.LastUpdate > 0 &&
                    <div>
                        <Moment format={dateFormat}>
                            {topic.LastUpdate}
                        </Moment>
                    </div>
                }
            </div>
            <div className="ms-Grid-col ms-sm1">
                {
                    ((user && user.IsSiteAdmin) || (user.Title === topic.CreatorName)) &&
                    <Icon
                        iconName='Edit'
                        className={rqStyles.icon}
                        title={strings.EditTopic}
                        onClick={() => topic.editTopic(topic.Id)}
                    />
                }
            </div>
        </>
    )
}

export default Topic