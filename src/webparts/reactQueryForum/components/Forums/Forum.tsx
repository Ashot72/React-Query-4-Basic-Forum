import * as React from 'react'
import { Link } from "react-router-dom"
import Moment from 'react-moment'
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import * as strings from 'ReactQueryForumWebPartStrings';
import rqStyles from '../ReactQueryForum.module.scss'
import { dateFormat } from '../../../../constants';
import useCurrentUser from '../../useCurrentUser';
import { IForum } from '../../../../interfaces'

const Forum: React.FC<IForum> = (forum: IForum) => {
    const user = useCurrentUser();

    return (
        <>
            <div className="ms-Grid-col ms-sm5">
                <Link to={`/topics/${forum.Id}`}>{forum.Title}</Link>
                <div>{forum.Description}</div>
            </div>
            <div className="ms-Grid-col ms-sm2">
                <div>
                    {strings.Topics}:{' '}
                    <Link to={`/topics/${forum.Id}`}>{forum.Topics}</Link>
                </div>
                <div>
                    {strings.Posts}:{' '}
                    <Link to={`/topics/${forum.Id}`}>{forum.Posts}</Link>
                </div>
            </div>
            <div className="ms-Grid-col ms-sm4">
                {forum.LastTopic && <Link to={`/posts/${forum.Id}/${forum.LastTopicId}`}>{forum.LastTopic}</Link>}
                {forum.LastPosterName && <div>{strings.By} {forum.LastPosterName} </div>}
                {forum.LastUpdate > 0 &&
                    <div>
                        <Moment format={dateFormat}>
                            {forum.LastUpdate}
                        </Moment>
                    </div>
                }
            </div>
            <div className="ms-Grid-col ms-sm1">
                {
                    user && user.IsSiteAdmin &&
                    <Icon
                        iconName='Edit'
                        className={rqStyles.icon}
                        title={strings.EditForum}
                        onClick={() => forum.editForum(forum.Id)}
                    />
                }
            </div>
        </>
    )
}

export default Forum