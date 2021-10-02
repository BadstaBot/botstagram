export interface PronounPage {
    id: string,
    username: string,
    avatarSource: string,
    bannedReason: string | null,
    bannedTerms: string[] // i think,
    team: number,
    emailHash: string,
    avatar: string,
    profiles: Record<ProfileKey, Profile>
}

export interface Profile {
    names: Record<string, number>
    pronouns: Record<string, number>
    links: string[]
    flags: string[]
    customFlags: Record<string, unknown>
    words: Record<string, number>[]
    teamName: string
    credentials: unknown[]
    credentialsLevels: unknown | null
    credentialsName: unknown | null
    card: string | null
    description: string
}

export type ProfileKey = 'de'
    | 'en'
    | 'es'
    | 'fr'
    | 'nl'
    | 'no'
    | 'pl'
    | 'pt'
    | 'zh'

export const pronounMapping: Record<string, string> = {
    '-1': ':thumbsdown:',
    '0': ':thumbsup:',
    '1': ':heart:'
};

export const nameMapping: Record<string, string> = {
    '-1': ':thumbsdown:',
    '0': ':thumbsup:',
    '1': ':heart:'
};

export const titleMapping: Record<string, string> = {
    '-1': ':thumbsdown:',
    '0': ':thumbsup:',
    '1': ':heart:',
    '2': ':joy:'
};
