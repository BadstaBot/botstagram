import {Awaited, ButtonInteraction} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';

type ButtonFunc = (client: BotClient, interaction: ButtonInteraction) => Awaited<void>;

export class ButtonHandler {
    constructor(
        public customID: string,
        public func: ButtonFunc,
    ) {
    }
}

