import {GuildMember, Role, User} from 'discord.js';
import {APIInteractionDataResolvedGuildMember, APIRole} from 'discord-api-types/v9';

export const zws = '\u200b';

export type MentionableType = User | GuildMember | APIInteractionDataResolvedGuildMember | Role | APIRole

export type ReportActionType =
    'ban' |
    'kick' |
    'warn' |
    'mute' |
    'ignore'

export const regexes = {
    imgur: {
        image: /^https?:\/\/i\.imgur\.com\/(\w+)\.(?:jpg|png)$/i,
        album: /^https?:\/\/imgur\.com(?:\/a)?\/(\w+)$/i
    }
};

export const noop = () => {
};
