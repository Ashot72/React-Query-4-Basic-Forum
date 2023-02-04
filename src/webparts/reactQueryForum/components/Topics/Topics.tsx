import * as React from 'react'
import { useState } from 'react';
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Link, useParams } from "react-router-dom"
import rqStyles from '../ReactQueryForum.module.scss'
import * as strings from 'ReactQueryForumWebPartStrings';
import { useTopics } from './useTopics';
import Topic from './Topic';
import Form from './Form';
import Navigation from '../shared/Navigation';
import { useForum } from '../Forums/useForums';
import SidePanel from '../shared/SidePanel';
import { Actions, pageItems } from '../../../../constants'
import { ITopic } from '../../../../interfaces';

const Topics: React.FC = () => {
    const { fid } = useParams();

    const [isOpen, setIsOpen] = useState(false)
    const [topicId, setTopicId] = useState(0)
    const [skip, setSkip] = useState(0)

    const { data: forum } = useForum(+fid)


    const { data } = useTopics(+fid, skip)

    const editTopic = (id: number) => {
        setTopicId(id)
        setIsOpen(true);
    }

    const forumName = (forum && forum.length > 0) ? forum[0].Title : ''

    return (
        <div>
            <Navigation forumName={forumName} />
            <Link onClick={() => editTopic(0)}>{strings.NewTopic}</Link>
            <br /><br />
            <div className={rqStyles.headerContainer}>
                <div className={`ms-Grid-row ${rqStyles.header}`}>
                    <div className="ms-Grid-col ms-sm5">{strings.Name}</div>
                    <div className="ms-Grid-col ms-sm2">{strings.RepliesViews}</div>
                    <div className="ms-Grid-col ms-sm4">{strings.LastPost}</div>
                    <div className="ms-Grid-col ms-sm1">&nbsp;</div>
                </div>
            </div>
            {
                data?.topics?.map((topic: ITopic) =>
                    <div className={`ms-Grid-row ${rqStyles.row}`} key={topic.Id}>
                        <Topic {...topic} editTopic={editTopic} />
                    </div>)
            }
            <div className={rqStyles.center}>
                <PrimaryButton onClick={() => setSkip(prev => prev - pageItems)} disabled={skip === 0}>{strings.PrevPage}</PrimaryButton>&nbsp;&nbsp;
                <PrimaryButton onClick={() => setSkip(prev => prev + pageItems)} disabled={(data?.count - skip) <= pageItems}>{strings.NextPage}</PrimaryButton>
            </div>

            <SidePanel isOpen={isOpen} setIsOpen={setIsOpen}>
                <Form
                    forumId={+fid}
                    topicId={topicId}
                    action={topicId ? Actions.Update : Actions.AddOrReply}
                    handleClose={() => setIsOpen(false)}
                />
            </SidePanel>
        </div>
    )
}

export default Topics