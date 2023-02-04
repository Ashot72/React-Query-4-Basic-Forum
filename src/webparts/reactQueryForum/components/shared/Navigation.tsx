import * as React from 'react'
import { Link } from "react-router-dom";
import * as strings from 'ReactQueryForumWebPartStrings';

interface INavigationProp {
    forumName: string
    forumId?: number
    topicName?: string
}

const Navigation: React.FC<INavigationProp> = ({ forumName, forumId, topicName }) => {

    const forumLink = () =>
        <>
            <Link
                to={{
                    pathname: "/",
                    state: true
                }}>
                {strings.Forums}
            </Link> {'->'}
        </>

    return (
        <div style={{ marginBottom: '5px' }}>
            {
                (!forumId && !topicName) &&
                <>
                    {forumLink()} {forumName}
                </>
            }
            {
                forumId && topicName &&
                <>
                    {forumLink()}
                    <Link
                        to={{
                            pathname: `/topics/${forumId}`,
                            state: true
                        }}>
                        {forumName}
                    </Link> {'->'}{topicName}
                </>
            }
        </div>
    )
}

export default Navigation
