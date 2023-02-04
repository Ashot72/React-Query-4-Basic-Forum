import * as React from 'react'
import { useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, Stack, IStackTokens, TextField, Checkbox } from 'office-ui-fabric-react'
import * as strings from 'ReactQueryForumWebPartStrings';
import ConfirmDelete from '../shared/ConfirmDelete';
import rqStyles from '../ReactQueryForum.module.scss'
import { useAddTopic, useUpdateTopic, useDeleteTopic, useTopic } from './useTopics';
import { Actions } from '../../../../constants';
import useCurrentUser from '../../useCurrentUser';
import { ITopic, IPost } from '../../../../interfaces';

const stackTokens: IStackTokens = { childrenGap: 15 }

export interface IForm {
    forumId: number
    topicId: number;
    action: Actions
    handleClose: () => void
}

const Topic: React.FC<IForm> = ({ forumId, topicId, action, handleClose }) => {
    const user = useCurrentUser()

    const onSuccess = () => handleClose()

    const addTopic = useAddTopic(onSuccess)
    const updateTopic = useUpdateTopic(onSuccess)
    const deleteTopic = useDeleteTopic(onSuccess)

    const [id, setId] = useState(0)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deleted, setDeleted] = useState(false)

    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState('')

    const { data: topic } = useTopic(topicId)

    useEffect(() => {
        if (topic && topic.length > 0) {
            const { Id, Title, Description } = topic[0];
            setId(Id)
            setTitle(Title)
            setDescription(Description)
        }
    }, [topic])

    const handleSubmit = () => {
        if (action === Actions.Update) {
            if (deleted) {
                deleteTopic(topic[0])
            } else {
                const topicUpdate: ITopic = {
                    Id: id,
                    Title: title,
                } as ITopic

                updateTopic(topicUpdate)
            }
        } else {
            const date = new Date().getTime()
            const { Title, Email } = user

            const topicAdd = {
                Title: title,
                ForumId: forumId,
                Views: 0,
                Replies: 0,
                CreatorName: Title,
                CreatorEmail: Email,
                LastPosterName: Title,
                LastPosterEmail: Email,
                CreatedDate: date
            } as ITopic

            const postAdd = {
                Title: title,
                ForumId: forumId,
                PosterName: Title,
                PosterEmail: Email,
                Content: description,
                Answered: false,
                CreatedDate: date
            } as IPost

            addTopic({ topic: topicAdd, post: postAdd })
        }
    }

    const onSave = () => {
        setError('')

        if (!title.trim()) {
            setError(strings.TitleRequired)
            return
        }

        if (action === Actions.AddOrReply && !description.trim()) {
            setError(strings.DescriptionRequired)
            return
        }

        deleted
            ? setIsOpen(true)
            : handleSubmit()
    }

    const onDelete = (shouldDelete: boolean) => {
        setIsOpen(false)

        if (shouldDelete) {
            handleSubmit()
        }
    }

    return (
        <>
            {error && <div className={rqStyles.error}>{error}</div>}
            <span className={rqStyles.header}>{action === Actions.AddOrReply ? strings.Add : strings.Update}</span>
            <Stack tokens={stackTokens}>
                <TextField
                    label={strings.TopicName}
                    name="title"
                    value={title}
                    onChange={(e: any) => setTitle(e.target.value)}
                />
                {action === Actions.AddOrReply &&
                    <TextField
                        multiline
                        label={strings.TopicDescription}
                        name="description"
                        value={description}
                        onChange={(e: any) => setDescription(e.target.value)}
                    />
                }
                {
                    action === Actions.Update && <Checkbox
                        label={strings.Delete}
                        name="deleted"
                        defaultChecked={deleted}
                        onChange={(e: any) => setDeleted(e.target.value)}
                    />
                }
            </Stack>
            <br />
            <Stack horizontal tokens={stackTokens}>
                <PrimaryButton text={strings.Save} onClick={onSave} />
                <DefaultButton text={strings.Cancel} onClick={handleClose} />
            </Stack>
            {
                isOpen && <ConfirmDelete
                    title={`${strings.ConfirmDelete} ${strings.Topic}?`}
                    onDelete={onDelete}
                />
            }
        </>
    )
}

export default Topic