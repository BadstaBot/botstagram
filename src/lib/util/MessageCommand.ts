import {
    Awaited,
    CommandInteraction,
    ContextMenuInteraction,
    MessageApplicationCommandData,
    UserApplicationCommandData
} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import {CommandOptions} from '@src/lib/interfaces/CommandOptions';

type UserCommandFunc = (client: BotClient, interaction: ContextMenuInteraction) => Awaited<void>;

type CommandData = MessageApplicationCommandData & CommandOptions

export class MessageCommand{
    constructor(
        public data: CommandData,
        public func: UserCommandFunc,
    ) {
    }
}

