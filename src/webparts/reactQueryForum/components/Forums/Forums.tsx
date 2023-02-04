import * as React from 'react'
import { useState } from 'react';
import { Link } from "react-router-dom"
import { Icon } from 'office-ui-fabric-react';
import rqStyles from '../ReactQueryForum.module.scss'
import styles from './Forums.module.scss';
import * as strings from 'ReactQueryForumWebPartStrings';
import Form from './Form';
import { useForums } from './useForums';
import Forum from './Forum';
import SidePanel from '../shared/SidePanel';
import { Actions } from '../../../../constants'
import { IForum } from '../../../../interfaces';

interface IForums {
    refreshInterval: number
}

const Forums: React.FC<IForums> = ({ refreshInterval }) => {

    const [isOpen, setIsOpen] = useState(false)
    const [forumId, setForumId] = useState(0)

    const { data: forums, isLoading, isFetching, refetch } = useForums(refreshInterval * 1000)

    const editForum = (id: number) => {
        setForumId(id)
        setIsOpen(true);
    }

    //You can test isLoading/isFetching by clicking refresh button to refetch data
    console.log({ isLoading }, { isFetching })

    return (
        <div className={styles.forums}>
            <Link onClick={() => editForum(0)}>{strings.NewForum}</Link>
            <br /> <br />
            <div className={rqStyles.headerContainer}>
                <div className={`ms-Grid-row ${rqStyles.header}`}>
                    <div className="ms-Grid-col ms-sm5">{strings.Name}</div>
                    <div className="ms-Grid-col ms-sm2">{strings.TopicsPosts}</div>
                    <div className="ms-Grid-col ms-sm4">{strings.LastPost}</div>
                    <div className="ms-Grid-col ms-sm1">
                        <Icon
                            iconName='Refresh'
                            className={`${rqStyles.icon} ${styles.reload}`}
                            title={strings.Reload}
                            onClick={() => refetch()}
                        />
                    </div>
                </div>
            </div>
            {
                forums?.map((forum: IForum) =>
                    <div className={`ms-Grid-row ${rqStyles.row}`} key={forum.Id}>
                        <Forum {...forum} editForum={editForum} />
                    </div>)
            }
            <SidePanel isOpen={isOpen} setIsOpen={setIsOpen}>
                <Form
                    forumId={forumId}
                    action={forumId ? Actions.Update : Actions.AddOrReply}
                    handleClose={() => setIsOpen(false)}
                />
            </SidePanel>
        </div>
    )
};

export default Forums