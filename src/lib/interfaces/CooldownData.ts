export interface CooldownData {
    command: string;
    guildId: string
    userId: string
    expire: Date
}

export interface CooldownScope {
    /* The guild id */
    gid?: string;
    /* The user id */
    uid?: string;
    /* The command id */
    cid: string;
}
