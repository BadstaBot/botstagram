export interface ServerSuggestion {
    sid: number;
    gid: string;
    uid: string;
    content?: string;
    upvotes?: number;
    downvotes?: number;
}
