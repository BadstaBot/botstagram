import {PermissionResolvable} from 'discord.js';

export interface CommandOptions {
    /* If the command should be restricted to the bot owner */
    ownerOnly?: boolean;
    /* If the command requires the bot to be in the server */
    requiresBot?: boolean;
    /* If the command should be restricted to NSFW channels */
    nsfw?: boolean;
    /* The permissions the user needs to execute the command */
    userPerms?: PermissionResolvable[] | PermissionResolvable;
    /* The permissions the bot needs to execute the command */
    botPerms?: PermissionResolvable[] | PermissionResolvable;
    /* The permissions the user needs to execute the command */
    // guild?: string;
    /* An array of guild IDs to create the command in */
    guilds?: string[];
    /* The cooldown of the command in seconds */
    cooldown?: number;
}
