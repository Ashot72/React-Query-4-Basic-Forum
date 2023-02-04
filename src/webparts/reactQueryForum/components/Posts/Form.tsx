import * as React from 'react'
import { useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, Stack, IStackTokens, TextField, Checkbox } from 'office-ui-fabric-react'
import * as strings from 'ReactQueryForumWebPartStrings';
import rqStyles from '../ReactQueryForum.module.scss'
import ConfirmDelete from '../shared/ConfirmDelete';
import { useAddPost, useUpdatePost, useDeletePost, usePost } from './usePosts';
import { Actions } from '../../../../constants';
import { IPost, ITopic } from '../../../../interfaces';
import useCurrentUser from '../../useCurrentUser';

const stackTokens: IStackTokens = { childrenGap: 15 }

export interface IForm {
    forumId: number;
    topic: ITopic[],
    postId: number;
    action: Actions
    handleClose: () => void
}

const Form: React.FC<IForm> = ({ forumId, topic, postId, action, handleClose }) => {
    const user = useCurrentUser()

    const onSuccess = () => handleClose()

    const addPost = useAddPost(onSuccess)
    const updatePost = useUpdatePost(onSuccess)
    const deletePost = useDeletePost(onSuccess)

    const [id, setId] = useState(0)
    const [content, setContent] = useState('')
    const [deleted, setDeleted] = useState(false)

    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState('')

    const { data: post } = usePost(postId)

    useEffect(() => {
        if (post && post.length > 0) {
            const { Id, Content } = post[0];
            setId(Id)
            setContent(Content)
        }
    }, [post])

    const handleSubmit = () => {
        if (action === Actions.Update) {
            if (deleted) {
                deletePost(post[0])
            } else {
                const postUpdate = {
                    Id: id,
                    Content: content
                } as IPost

                updatePost(postUpdate)
            }
        } else {
            const postAdd = {
                Title: topic[0].Title,
                ForumId: forumId,
                TopicId: topic[0].Id,
                Content: content,
                PosterName: user.Title,
                PosterEmail: user.Email,
                Answered: false,
                CreatedDate: new Date().getTime()
            } as IPost

            addPost(postAdd)
        }
    }

    const onSave = () => {
        setError('')

        if (!content.trim()) {
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
            <span className={rqStyles.header}>{action === Actions.AddOrReply ? strings.ReplyPost : strings.Update}</span>
            <Stack tokens={stackTokens}>
                <TextField
                    multiline
                    label={strings.PostContent}
                    name="content"
                    value={content}
                    onChange={(e: any) => setContent(e.target.value)}
                />
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
                    title={`${strings.ConfirmDelete} ${strings.Post}?`}
                    onDelete={onDelete}
                />
            }
        </>
    )
}

export default Form