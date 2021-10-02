import {Awaited, ClientEvents} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import {BotEvents} from '@src/lib/interfaces/BotEvents';

type EventFunc<E extends keyof BotEvents> = (
    client: BotClient,
    ...args: BotEvents[E]
) => Awaited<void>

interface EventOpts {
    once: boolean
}

export class Event<E extends keyof BotEvents> {
    constructor(
        public name: E,
        public func: EventFunc<E>,
        public opts?: EventOpts
    ) {
    }

    static isEvent(event: unknown): event is Event<keyof BotEvents> {
        return event instanceof Event;
    }
}
