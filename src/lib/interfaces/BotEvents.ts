import {ClientEvents, CommandInteraction, Guild, User} from 'discord.js';
import {SlashCommand} from '@src/lib/util/SlashCommand';
import {PunishmentType} from '@prisma/client';
import {UserCommand} from '@src/lib/util/UserCommand';
import {MessageCommand} from '@src/lib/util/MessageCommand';


export interface BotEvents extends ClientEvents {
    slashCommandLoaded: [command: SlashCommand];
    userCommandLoaded: [command: UserCommand];
    messageCommandLoaded: [command: MessageCommand];
    commandError: [interaction: CommandInteraction, command: SlashCommand | UserCommand | MessageCommand, error: Error]
    commandBlocked: [command: SlashCommand, reason: string]
    userPunished: [user: User, mod: User, guild: Guild, reason: string, type: PunishmentType, caseID: number, silent: boolean]
}
