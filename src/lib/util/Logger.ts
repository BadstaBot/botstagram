import {blue, cyan, gray, red, yellow} from 'ansi-colors';
import {performance} from 'perf_hooks';
import {config} from '@src/lib/config';
import {inspect} from 'util';
import {Constants, DiscordAPIError} from 'discord.js';
import dayjs = require('dayjs');

type Promised<T> = T extends PromiseLike<infer U> ? U : T;

export class Logger {
    constructor(protected name: string) {
    }

    static async calcExecTime<F extends () => ReturnType<F>>(
        func: F
    ): Promise<[Promised<ReturnType<F>>, number]> {
        const t1 = performance.now();
        const res = await func();
        const t2 = performance.now();
        return [res, Math.round(t2 - t1)];
    }

    forkInstance(name: string): Logger {
        return new Logger(name);
    }

    debug(message: any, ...args: string[]): void {
        if (!config.logging.debug) return;

        console.debug(this.formatMessage(gray(inspect(message, true, 3)), ...args));
    }

    info(message: any, ...args: string[]): void {
        if (!config.logging.info) return;

        console.log(this.formatMessage(blue(inspect(message, true, 3)), ...args));
    }

    warn(message: any, ...args: string[]): void {
        if (!config.logging.warn) return;

        console.warn(this.formatMessage(yellow(inspect(message, true, 3)), ...args));
    }

    error(error: Error, ...args: string[]): void {
        if (!config.logging.error) return;
        const ignoredCodes: number[] = [
            Constants.APIErrors.UNKNOWN_USER,
            Constants.APIErrors.CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL,
            Constants.APIErrors.INVALID_ROLE,
            Constants.APIErrors.UNKNOWN_BAN,
            Constants.APIErrors.UNKNOWN_GUILD,
        ];

        if (error instanceof DiscordAPIError && ignoredCodes.includes(error.code)) {
            return;
        }

        console.error(
            this.formatMessage(red(error.stack ?? error.message), ...args)
        );
    }

    private formatMessage(message: string, ...args: string[]): string {
        return `${cyan(dayjs().format('DD:MM:YYYY hh:mm:ss'))} ${this.name}: ${message} ${args.join(' ')}`;
    }
}
