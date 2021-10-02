import {
    ApplicationCommand,
    ButtonInteraction,
    Client as DjsClient,
    Collection,
    GuildResolvable,
    InviteScope,
    Options,
    Permissions
} from 'discord.js';
import {Logger} from '@src/lib/util/Logger';
import {SlashCommand} from '@src/lib/util/SlashCommand';
import {resolve} from 'path';
import {Event} from '@src/lib/util/Event';
import {ClientUtil} from '@src/lib/util/clientutil';
import {config as _config} from '@src/lib/config';
import {KSoftClient} from 'ksoft.js';
import {readdir} from 'fs/promises';
import {BotEvents} from '@src/lib/interfaces/BotEvents';
import {ButtonHandler} from '@src/lib/util/ButtonHandler';
import {PrismaClient} from '@prisma/client';
import {UserCommand} from '@src/lib/util/UserCommand';
import {MessageCommand} from '@src/lib/util/MessageCommand';
import {CooldownData, CooldownScope} from '@src/lib/interfaces/CooldownData';
import {Client as PgClient} from 'pg';
import {Dayjs} from 'dayjs';
import {Docker} from 'node-docker-api';
import dayjs = require('dayjs');
import Rollbar = require('rollbar');

const {database} = _config;

export class BotClient extends DjsClient {
    private readonly _logger: Logger;
    private readonly _clientUtil: ClientUtil;
    private readonly _slashCommands: Collection<ApplicationCommand['id'], SlashCommand>;
    private readonly _userCommands: Collection<ApplicationCommand['id'], UserCommand>;
    private readonly _messageCommands: Collection<ApplicationCommand['id'], MessageCommand>;
    private readonly _cooldowns: Collection<CooldownScope, CooldownData>;
    private readonly _buttons: Collection<string, ButtonHandler>;
    private readonly _ksoft: KSoftClient;
    private readonly _prisma: PrismaClient;
    private readonly _db: PgClient;
    private readonly _started: Dayjs;
    private readonly _rollbar: Rollbar;
    private readonly _docker: Docker;

    constructor() {
        super({
            intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'],
            makeCache: Options.cacheEverything()
        });

        this._logger = new Logger('Botstagram');
        this._started = dayjs();
        this._slashCommands = new Collection();
        this._userCommands = new Collection();
        this._messageCommands = new Collection();
        this._cooldowns = new Collection();
        this._buttons = new Collection();
        this._clientUtil = new ClientUtil(this);
        this._docker = new Docker({
            socketPath: 'localhost:2375'
        });
        this._ksoft = new KSoftClient(this.config.secrets.ksoft);
        this._db = new PgClient({
            database: database.database,
            password: database.login.password,
            user: database.login.username,
            port: database.port,
            host: database.host
        });
        this._prisma = new PrismaClient({
            log: [
                {
                    emit: 'stdout',
                    level: 'query'
                }
            ]
        });
        this._rollbar = new Rollbar({
            accessToken: this.config.secrets.rollbar,
            captureUncaught: true,
            captureUnhandledRejections: true,
            environment: process.env.NODE_ENV
        });
    }

    get logger(): Logger {
        return this._logger;
    }

    get config() {
        return _config;
    }

    get slashCommands(): Collection<ApplicationCommand['id'], SlashCommand> {
        return this._slashCommands;
    }

    get userCommands(): Collection<ApplicationCommand['id'], UserCommand> {
        return this._userCommands;
    }

    get messageCommands(): Collection<ApplicationCommand['id'], MessageCommand> {
        return this._messageCommands;
    }

    get buttonHandlers(): Collection<ButtonInteraction['customId'], ButtonHandler> {
        return this._buttons;
    }

    get cooldowns(): Collection<CooldownScope, CooldownData> {
        return this._cooldowns;
    }

    get util(): ClientUtil {
        return this._clientUtil;
    }

    get ksoft(): KSoftClient {
        return this._ksoft;
    }

    get prisma(): PrismaClient {
        return this._prisma;
    }

    get db() {
        return this._db;
    }

    get started() {
        return this._started;
    }

    get rollbar() {
        return this._rollbar;
    }

    get docker() {
        return this._docker;
    }

    async databaseStarted() {
        const containers = await this.docker.container.list();
        const db = containers[0];

        this.logger.debug(db.data);
    }

    async login(token?: string): Promise<string> {
        await this._db.connect();
        return super.login(token);
    }

    getSlashCommand(name: string): SlashCommand | undefined {
        return this.slashCommands.find((cmd, _) => cmd.data.name === name);
    }

    getUserCommand(name: string): UserCommand | undefined {
        return this.userCommands.find((cmd, _) => cmd.data.name === name);
    }

    getMessageCommand(name: string): MessageCommand | undefined {
        return this.messageCommands.find((cmd, _) => cmd.data.name === name);
    }

    invite(scopes?: InviteScope[], guild?: GuildResolvable): string | null {
        const {application} = this;
        if (!application) return null;

        const permissions = new Permissions().add(...this.slashCommands.map(c => c.data.botPerms!)).bitfield;

        return this.generateInvite({
            guild: guild,
            scopes: scopes || ['bot', 'applications.commands'],
            permissions: permissions
        });

    }


    async loadCommands() {

    }
    async loadButtons() {
        const paths = this.util.readdirRecursive(resolve(__dirname, '..', 'buttons'));
        const cmdFiles: string[] = [];

        for (const f of paths) {
            cmdFiles.push(resolve(f));
        }

        this.logger.info('Loading Button Handlers...');
        for (const file of cmdFiles) {
            const {default: button} = (await import(
                file
                )) as {
                default: ButtonHandler
            };

            this._buttons.set(button.customID, button);

            this.logger.info(`Successfully loaded handler for button ${button.customID}`);

        }
        this.logger.info(`Successfully loaded ${this.buttonHandlers.size} button handlers`);
    }

    async loadEvents(): Promise<void> {
        const files = await readdir(resolve(__dirname, '..', 'events'));
        const eventFiles = files.filter(f => !f.split('.')[2]);
        for (const eventFile of eventFiles) {
            const [event, execTime] = await Logger.calcExecTime(async () => {
                const {default: event} = (await import(`../events/${eventFile}`)) as {
                    default: Event<keyof BotEvents>;
                };
                if (Event.isEvent(event)) {
                    if (event.opts?.once) {
                        // @ts-expect-error typescript moment
                        this.once(event.name, (...args) => {
                            event.func(this, ...args);
                        });
                    } else {
                        // @ts-expect-error typescript moment
                        this.on(event.name, (...args) => {
                            event.func(this, ...args);
                        });
                    }
                }
                return event;
            });
            this.logger.debug(`Loaded Event: ${event.name}`, `(+${execTime}ms)`);
        }
        this.db.on('error', (e) => this.logger.error(e));
    }

    emit<K extends keyof BotEvents>(event: K, ...args: BotEvents[K]): boolean {
        // @ts-expect-error this does exist, just not in hte typings lol
        return super.emit(event, ...args);
    }
}
