import {Awaited, ChatInputApplicationCommandData, CommandInteraction, PermissionResolvable} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import {CommandOptions} from '@src/lib/interfaces/CommandOptions';

type SlashCommandFunc = (client: BotClient, interaction: CommandInteraction) => Awaited<void>;

type CommandData = ChatInputApplicationCommandData & CommandOptions

export class SlashCommand{
    constructor(
        public data: CommandData,
        public func: SlashCommandFunc,
    ) {
    }
}

