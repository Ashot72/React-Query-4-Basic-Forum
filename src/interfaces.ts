export interface IForum {
    Id: number
    Title: string;
    Description: string;
    LastTopic: string;
    LastForumId: number;
    LastTopicId: number;
    LastPosterName: string;
    LastPosterEmail: string;
    LastUpdate: number,
    Topics: number;
    Posts: number;
    CreatedDate: number;
    editForum: (id: number) => void
}

export interface ITopic {
    Id: number
    Title: string;
    ForumId: number;
    Description: string;
    CreatorName: string;
    CreatorEmail: string;
    LastPosterName: string;
    LastPosterEmail: string;
    LastUpdate: number,
    Views: number,
    Replies: number,
    CreatedDate: number,
    editTopic: (id: number) => void
}

export interface IPost {
    Id: number
    Title: string;
    firstPost: IPost
    ForumId: number;
    TopicId: number;
    PosterName: string;
    PosterEmail: string;
    Content: string;
    Answered: boolean;
    CreatedDate: number,
    editPost: (id: number) => void,
    markAnswered: (post: IPost) => void
}
