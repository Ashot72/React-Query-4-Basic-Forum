import { Dialog } from '@microsoft/sp-dialog'
import * as strings from 'ReactQueryForumWebPartStrings';
import {
    sp,
    IListAddResult,
    CalendarType,
    DateTimeFieldFormatType
} from "@pnp/sp/presets/all";
import { qr_forums, qr_topics, qr_posts } from '../constants';

enum FieldTypes {
    Text,
    Boolean,
    MultiLine,
    Number,
    DateTime,
    Url
}

interface IFieldStructure {
    title: string
    type: FieldTypes
    required: boolean
}

interface IListStructure {
    title: string
    description: string
    template: number
    hidden: boolean
    fields?: IFieldStructure[]
}

export default class CustomListGenerator {
    public static generateLists(): Promise<void> {
        return this.listExists().then((exists: boolean) =>
            exists
                ? Promise.resolve()
                : new Promise<void>(resolve => {
                    Dialog.alert(strings.WaitListGeneration)

                    this.createForumsLists()
                        .then(() => this.createTopicsLists())
                        .then(() => this.createPostsLists())
                        .then(() => resolve())
                })
        )
    }

    private static listExists(): Promise<boolean> {
        return sp.web.lists
            .getByTitle(qr_forums)
            .items.get()
            .then(() => Promise.resolve(true))
            .catch(() => Promise.resolve(false))
    }

    public static createForumsLists(): Promise<any> {
        return this.createListSP({
            title: qr_forums,
            description: 'Forums Hooks Forums',
            template: 100,
            hidden: false,
            fields: [
                { title: 'Description', type: FieldTypes.Text, required: true },
                { title: 'LastTopic', type: FieldTypes.Text, required: false },
                { title: 'LastForumId', type: FieldTypes.Number, required: false },
                { title: 'LastTopicId', type: FieldTypes.Number, required: false },
                { title: 'LastPosterName', type: FieldTypes.Text, required: false },
                { title: 'LastPosterEmail', type: FieldTypes.Text, required: false },
                { title: 'LastUpdate', type: FieldTypes.Number, required: false },
                { title: 'Topics', type: FieldTypes.Number, required: true },
                { title: 'Posts', type: FieldTypes.Number, required: true },
                { title: 'CreatedDate', type: FieldTypes.Number, required: true }
            ]
        })
    }

    public static createTopicsLists(): Promise<any> {
        return this.createListSP({
            title: qr_topics,
            description: 'Forums Hooks Topics',
            template: 100,
            hidden: false,
            fields: [
                { title: 'ForumId', type: FieldTypes.Number, required: true },
                //   { title: 'Description', type: FieldTypes.Text, required: true },
                { title: 'CreatorName', type: FieldTypes.Text, required: true },
                { title: 'CreatorEmail', type: FieldTypes.Text, required: false },
                { title: 'LastPosterName', type: FieldTypes.Text, required: false },
                { title: 'LastPosterEmail', type: FieldTypes.Text, required: false },
                { title: 'LastUpdate', type: FieldTypes.Number, required: false },
                { title: 'Views', type: FieldTypes.Number, required: true },
                { title: 'Replies', type: FieldTypes.Number, required: true },
                { title: 'CreatedDate', type: FieldTypes.Number, required: true }
            ]
        })
    }

    public static createPostsLists(): Promise<any> {
        return this.createListSP({
            title: qr_posts,
            description: 'Forums Hooks Posts',
            template: 100,
            hidden: false,
            fields: [
                { title: 'ForumId', type: FieldTypes.Number, required: true },
                { title: 'TopicId', type: FieldTypes.Number, required: true },
                { title: 'PosterName', type: FieldTypes.Text, required: true },
                { title: 'PosterEmail', type: FieldTypes.Text, required: false },
                { title: 'Content', type: FieldTypes.MultiLine, required: true },
                { title: 'Answered', type: FieldTypes.Boolean, required: true },
                { title: 'CreatedDate', type: FieldTypes.Number, required: true }
            ]
        })
    }

    private static createListSP(element: IListStructure): Promise<any> {
        const { title, description, template, hidden, fields } = element

        return sp.web.lists
            .add(title, description, template, false, { Hidden: hidden })
            .then((result: IListAddResult) => {
                if (fields) {
                    const batch = sp.web.createBatch()

                    for (let field of fields) {
                        switch (field.type) {
                            case FieldTypes.Boolean:
                                result.list.fields
                                    .inBatch(batch)
                                    .addBoolean(field.title, { Required: field.required })
                                break
                            case FieldTypes.Text:
                                result.list.fields
                                    .inBatch(batch)
                                    .addText(field.title, 255, { Required: field.required })
                                break
                            case FieldTypes.MultiLine:
                                result.list.fields.inBatch(batch).add(field.title, 'SP.Field', {
                                    FieldTypeKind: 3,
                                    Required: field.required
                                })
                                break
                            case FieldTypes.Number:
                                result.list.fields.inBatch(batch).add(field.title, 'SP.Field', {
                                    FieldTypeKind: 9,
                                    Required: field.required
                                })
                                break
                            case FieldTypes.DateTime:
                                result.list.fields
                                    .inBatch(batch)
                                    .addDateTime(
                                        field.title,
                                        DateTimeFieldFormatType.DateTime,
                                        CalendarType.Gregorian,
                                        1,
                                        { Required: field.required }
                                    )
                                break
                        }
                    }
                    return batch.execute()
                }
            })
    }
}