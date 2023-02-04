import * as React from 'react'
import { useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, Stack, IStackTokens, TextField, Checkbox } from 'office-ui-fabric-react'
import * as strings from 'ReactQueryForumWebPartStrings';
import rqStyles from '../ReactQueryForum.module.scss'
import { useAddForum, useUpdateForum, useDeleteForum, useForum } from './useForums';
import ConfirmDelete from '../shared/ConfirmDelete';
import { Actions } from '../../../../constants';
import { IForum } from '../../../../interfaces';

const stackTokens: IStackTokens = { childrenGap: 15 }

export interface IForm {
    forumId: number;
    action: Actions
    handleClose: () => void
}

const Form: React.FC<IForm> = ({ forumId, action, handleClose }) => {

    const onSuccess = () => handleClose()

    const addForum = useAddForum(onSuccess)
    const updateForum = useUpdateForum(onSuccess)
    const deleteForum = useDeleteForum(onSuccess)

    const [id, setId] = useState(0)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deleted, setDeleted] = useState(false)

    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState('')

    const { data: forum } = useForum(forumId)

    useEffect(() => {
        if (forum && forum.length > 0) {
            const { Id, Title, Description } = forum[0];
            setId(Id)
            setTitle(Title)
            setDescription(Description)
        }
    }, [forum])

    const handleSubmit = () => {
        if (action === Actions.Update) {
            if (deleted) {
                const forumDelete = { Id: id } as IForum

                deleteForum(forumDelete)
            } else {
                const forumUpdate = {
                    Id: id,
                    Title: title,
                    Description: description
                } as IForum

                updateForum(forumUpdate)
            }
        } else {
            const forumAdd = {
                Title: title,
                Description: description,
                Posts: 0,
                Topics: 0,
                CreatedDate: new Date().getTime()
            } as IForum

            addForum(forumAdd)
        }
    }

    const onSave = () => {
        setError('')

        if (!title.trim()) {
            setError(strings.TitleRequired)
            return
        }

        if (!description.trim()) {
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
                    label={strings.ForumName}
                    name="title"
                    value={title}
                    onChange={(e: any) => setTitle(e.target.value)}
                />
                <TextField
                    multiline
                    label={strings.ForumDescription}
                    name="description"
                    value={description}
                    onChange={(e: any) => setDescription(e.target.value)}
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
                    title={`${strings.ConfirmDelete} ${strings.Forum}?`}
                    onDelete={onDelete}
                />
            }
        </>
    )
}

export default Form