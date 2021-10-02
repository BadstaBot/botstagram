import {Awaited,  ContextMenuInteraction, UserApplicationCommandData} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import {CommandOptions} from '@src/lib/interfaces/CommandOptions';

type UserCommandFunc = (client: BotClient, interaction: ContextMenuInteraction) => Awaited<void>;

type CommandData = UserApplicationCommandData & CommandOptions

export class UserCommand{
    constructor(
        public data: CommandData,
        public func: UserCommandFunc,
    ) {
    }
}

