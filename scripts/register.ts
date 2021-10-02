import {BotClient} from '@src/lib/BotClient';
import {Logger} from '@src/lib/util/Logger';
import {resolve} from 'path';
import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageCommand} from '@src/lib/util/MessageCommand';
import {UserCommand} from '@src/lib/util/UserCommand';
import {ApplicationCommand} from 'discord.js';

const logger = new Logger('Register');
const guildId = process.argv[3];
export const registerAllCommands = async (client: BotClient) => {
    await registerUserCommands(client);
    await registerMessageCommands(client);
    await registerSlashCommands(client);
};

export const registerSlashCommands = async (client: BotClient) => {
    logger.info('Registering slash commands...');
    const slashCommandPaths = client.util.readdirRecursive(resolve(__dirname, '..', 'src', 'commands'));
    const cmdFiles: string[] = [];

    for (const f of slashCommandPaths) {
        cmdFiles.push(resolve(f));
    }

    for (const file of cmdFiles) {
        const {default: command} = (await import(file)) as {
            default: SlashCommand
        };

        if (!command) {
            logger.warn(`Unknown slash command file: ${file}`);
            continue;
        }

        const {application} = client;

        if (!application) return;

        const allCommands = await client.application!.commands.fetch();

        const reRegister = process.argv[2] === '--re-register';

        if (!reRegister) {
            const cmd = allCommands.find((c, _) => c.name === command.data.name);

            if (!cmd) {
                const {name, description, options, guilds} = command.data;
                logger.warn(`Command ${name} not made yet... Making it now...`);

                if (guilds && guilds.length !== 0) {
                    for (const id of guilds) {
                        const tmp = await application.commands.create({
                            name: name,
                            description: description,
                            options: options,
                            type: 'CHAT_INPUT',
                        }, id);
                        client.slashCommands.set(tmp.id, command);
                    }
                } else {
                    if (client.config.development) {
                        const tmp = await application.commands.create({
                            name: name,
                            description: description,
                            options: options,
                            type: 'CHAT_INPUT',
                        }, client.config.supportServer.guildId);

                        client.slashCommands.set(tmp.id, command);
                    } else {
                        const tmp = await application.commands.create({
                            name: name,
                            description: description,
                            options: options,
                            type: 'CHAT_INPUT',
                        });
                        client.slashCommands.set(tmp.id, command);
                    }
                    client.emit('slashCommandLoaded', command);
                }
                continue;
            }
            client.slashCommands.set(cmd.id, command);
            client.emit('slashCommandLoaded', command);
            continue;
        }

        const {name, description, options, guilds} = command.data;

        if (guilds && guilds.length !== 0) {
            for (const id of guilds) {
                const tmp = await application.commands.create({
                    name: name,
                    description: description,
                    options: options,
                    type: 'CHAT_INPUT',
                }, id);
                client.slashCommands.set(tmp.id, command);
            }
        } else {
            if (client.config.development) {
                const tmp = await application.commands.create({
                    name: name,
                    description: description,
                    options: options,
                    type: 'CHAT_INPUT',
                }, client.config.supportServer.guildId);

                client.slashCommands.set(tmp.id, command);
            } else {
                const tmp = await application.commands.create({
                    name: name,
                    description: description,
                    options: options,
                    type: 'CHAT_INPUT',
                });
                client.slashCommands.set(tmp.id, command);
            }
            client.emit('slashCommandLoaded', command);
        }
        client.emit('slashCommandLoaded', command);
    }
};

export const registerUserCommands = async (client: BotClient) => {
    logger.info('Registering user commands...');

    const userCommandPaths = client.util.readdirRecursive(resolve(__dirname, '..', 'src', 'usercommands'));

    const userCmdFiles: string[] = [];

    for (const f of userCommandPaths) {
        userCmdFiles.push(resolve(f));
    }

    for (const file of userCmdFiles) {
        const {default: command} = (await import(file)) as {
            default: UserCommand
        };

        if (!command) {
            logger.warn(`Unknown user command file: ${file}`);
            continue;
        }

        const {application} = client;

        if (!application) return;

        const {name} = command.data;
        let cmd: ApplicationCommand;
        if (guildId) {
            cmd = await application.commands.create({
                name: name,
                type: 'USER',
            }, guildId);
        } else {
            cmd = await application.commands.create({
                name: name,
                type: 'USER',
            });
        }

        client.userCommands.set(cmd.id, command);

        client.emit('userCommandLoaded', command);
    }
};

export const registerMessageCommands = async (client: BotClient) => {

    logger.info('Registering message commands...');
    const messageCommandPaths = client.util.readdirRecursive(resolve(__dirname, '..', 'src', 'messagecommands'));
    const messageCmdFiles: string[] = [];


    for (const f of messageCommandPaths) {
        messageCmdFiles.push(resolve(f));
    }


    for (const file of messageCmdFiles) {
        const {default: command} = (await import(file)) as {
            default: MessageCommand
        };

        if (!command) {
            logger.warn(`Unknown message command file: ${file}`);
            continue;
        }

        const {application} = client;

        if (!application) return;

        const {name} = command.data;
        let cmd: ApplicationCommand;
        if (guildId) {
            cmd = await application.commands.create({
                name: name,
                type: 'MESSAGE',
            }, guildId);
        } else {
            cmd = await application.commands.create({
                name: name,
                type: 'MESSAGE',
            });
        }

        client.messageCommands.set(cmd.id, command);
        client.emit('messageCommandLoaded', command);
    }
};
