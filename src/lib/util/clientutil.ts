import {BotClient} from '@src/lib/BotClient';
import {
    ButtonInteraction,
    CommandInteraction,
    ContextMenuInteraction,
    DefaultMessageNotificationLevel,
    ExplicitContentFilterLevel,
    Guild,
    GuildFeatures,
    InviteGuild,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MFALevel,
    PermissionString,
    SelectMenuInteraction,
    SplitOptions,
    User,
    UserFlagsString,
    Util,
    VerificationLevel
} from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import {Options} from 'humanize-duration';
import dayjs = require('dayjs');
import humanizeDuration = require('humanize-duration');

export class ClientUtil {
    private client: BotClient;

    constructor(client: BotClient) {
        this.client = client;
    }

    isOwner(user: User) {
        return this.client.config.owners.includes(user.id);
    }

    randomElement<T>(arr: T[]) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    lastElement<T>(arr: T[]) {
        return arr[arr.length - 1];
    }

    readdirRecursive(directory: string): string[] {
        const result = [];

        (function read(dir) {
            const files = fs.readdirSync(dir);

            for (const file of files) {
                const filepath = path.join(dir, file);

                if (fs.statSync(filepath).isDirectory()) {
                    read(filepath);
                } else {
                    result.push(filepath);
                }
            }
        }(directory));

        return result;
    }

    async paginate(interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction | SelectMenuInteraction, pages: MessageEmbed[]) {
        const firstButton = new MessageButton()
            .setStyle('PRIMARY')
            .setCustomId('first')
            .setEmoji('⏪');
        const previousPageButton = new MessageButton()
            .setStyle('PRIMARY')
            .setCustomId('prev')
            .setEmoji('⬅️');
        const nextPageButton = new MessageButton()
            .setStyle('PRIMARY')
            .setCustomId('next')
            .setEmoji('➡️');
        const lastButton = new MessageButton()
            .setStyle('PRIMARY')
            .setCustomId('last')
            .setEmoji('⏩');
        const trashButton = new MessageButton()
            .setStyle('DANGER')
            .setCustomId('stop')
            .setEmoji('⏹️');

        const row = new MessageActionRow({
            components: [firstButton.setDisabled(true), previousPageButton.setDisabled(true), trashButton, nextPageButton, lastButton]
        });

        let currentPage = 0;
        let msg;

        if (interaction.replied || interaction.deferred) {
            msg = await interaction.editReply({
                embeds: [pages[currentPage].setFooter(`Page ${currentPage + 1}/${pages.length}`)],
                components: [row],
            }) as Message;
        } else {
            msg = await interaction.reply({
                embeds: [pages[currentPage].setFooter(`Page ${currentPage + 1}/${pages.length}`)],
                components: [row],
                fetchReply: true
            }) as Message;
        }

        const collector = msg.createMessageComponentCollector({
            componentType: 'BUTTON',
            filter: button => button.user.id === interaction.user.id
        });

        collector.on('collect', async button => {
            switch (button.customId) {
                case 'prev':
                    this.client.logger.forkInstance('ClientUtil').debug('aaaaa');
                    nextPageButton.setDisabled(false);
                    firstButton.setDisabled(false);
                    if (currentPage !== 0) {
                        --currentPage;
                        if (currentPage === 0) {
                            previousPageButton.setDisabled(true);
                            firstButton.setDisabled(true);
                            lastButton.setDisabled(false);
                        }

                        await button.update({
                            embeds: [pages[currentPage].setFooter(`Page ${currentPage + 1}/${pages.length}`)],
                            components: [new MessageActionRow({components: [firstButton, previousPageButton, trashButton, nextPageButton, lastButton]})]
                        });
                    }
                    break;

                case 'next':
                    previousPageButton.setDisabled(false);
                    lastButton.setDisabled(false);
                    firstButton.setDisabled(false);
                    if (currentPage < pages.length - 1) {
                        currentPage++;
                    }
                    if (currentPage === pages.length - 1) {
                        nextPageButton.setDisabled(true);
                        lastButton.setDisabled(true);
                    }

                    await button.update({
                        embeds: [pages[currentPage].setFooter(`Page ${currentPage + 1}/${pages.length}`)],
                        components: [new MessageActionRow({components: [firstButton, previousPageButton, trashButton, nextPageButton, lastButton]})]
                    });
                    break;

                case 'stop':
                    await button.update({
                        embeds: [pages[currentPage].setFooter(`Page ${currentPage + 1}/${pages.length}`)],
                        components: []
                    });
                    break;
                case 'first':
                    lastButton.setDisabled(false);
                    nextPageButton.setDisabled(false);
                    previousPageButton.setDisabled(true);
                    firstButton.setDisabled(true);

                    currentPage = 0;
                    await button.update({
                        embeds: [pages[currentPage].setFooter(`Page ${currentPage + 1}/${pages.length}`)],
                        components: [new MessageActionRow({components: [firstButton, previousPageButton, trashButton, nextPageButton, lastButton]})]
                    });
                    break;
                case 'last':
                    lastButton.setDisabled(true);
                    nextPageButton.setDisabled(true);
                    previousPageButton.setDisabled(false);
                    firstButton.setDisabled(false);

                    currentPage = pages.length - 1;
                    await button.update({
                        embeds: [pages[currentPage].setFooter(`Page ${currentPage + 1}/${pages.length}`)],
                        components: [new MessageActionRow({components: [firstButton, previousPageButton, trashButton, nextPageButton, lastButton]})]
                    });
            }
        });
    }

    async confirmation({question, responseIfNo, responseIfYes, userId, interaction}: ConfirmOptions): Promise<boolean> {
        type ButtonIds = 'confirmYes' | 'confirmNo';
        const embed = new MessageEmbed()
            .setTitle('Confirmation')
            .setDescription(`${question}${question.endsWith('?') ? '' : '?'}`)
            .setColor(this.client.config.colors.warning);

        let msg;

        if (interaction.replied || interaction.deferred) {
            msg = await interaction.editReply({
                embeds: [embed],
                components: [
                    new MessageActionRow().addComponents([
                        new MessageButton()
                            .setEmoji('✅')
                            .setStyle('SUCCESS')
                            .setCustomId('confirmYes'),
                        new MessageButton()
                            .setEmoji('❌')
                            .setStyle('DANGER')
                            .setCustomId('confirmNo')
                    ])
                ]
            }) as Message;
        } else {
            msg = await interaction.reply({
                embeds: [embed],
                components: [
                    new MessageActionRow().addComponents([
                        new MessageButton()
                            .setEmoji('✅')
                            .setStyle('SUCCESS')
                            .setCustomId('confirmYes'),
                        new MessageButton()
                            .setEmoji('❌')
                            .setStyle('DANGER')
                            .setCustomId('confirmNo')
                    ])
                ],
                fetchReply: true
            }) as Message;
        }

        const id = (await msg.awaitMessageComponent({
            componentType: 'BUTTON',
            filter: args => args.user.id === userId
        })).customId as ButtonIds;

        if (id === 'confirmNo') {
            if (responseIfNo) {
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Cancelled')
                            .setDescription(responseIfNo)
                            .setColor(this.client.config.colors.error)
                    ]
                });
            }
            return false;
        } else {
            if (responseIfYes) {
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Confirmed')
                            .setDescription(responseIfYes)
                            .setColor(this.client.config.colors.success)
                    ]
                });
            }
            return true;
        }
    }

    async splitOrPaginate(interaction: CommandInteraction, text: string, opts?: SplitOptions) {
        const split = Util.splitMessage(text, opts);

        if (split.length === 1) {
            await interaction.reply({
                embeds: [
                    new MessageEmbed().setDescription(split[0])
                ]
            });
            return;
        }

        const embeds: MessageEmbed[] = [];

        for (const s of split) {
            embeds.push(new MessageEmbed().setDescription(s));
        }

        await this.paginate(interaction, embeds);
    }

    parseGuildFeatures(guild?: Guild | InviteGuild | null, delim = ', '): string {
        if (!guild) return 'Unknown';


        const features = guild.features;
        this.client.logger.debug(`${features}`);
        if (!features.length) return 'None';

        const mapping: Record<GuildFeatures | 'THREADS_ENABLED', string> = {
            ANIMATED_ICON: 'Animated Icon',
            BANNER: 'Banner',
            COMMERCE: 'Commerce',
            COMMUNITY: 'Community',
            DISCOVERABLE: 'Discoverable',
            FEATURABLE: 'Featurable',
            INVITE_SPLASH: 'Invite Splash',
            MEMBER_VERIFICATION_GATE_ENABLED: 'Member Screening',
            MONETIZATION_ENABLED: 'Monetization Enabled',
            MORE_STICKERS: 'More Stickers',
            NEWS: 'News',
            PARTNERED: 'Partnered',
            PREVIEW_ENABLED: 'Preview Enabled',
            PRIVATE_THREADS: 'Private Threads',
            THREE_DAY_THREAD_ARCHIVE: '3 Day Thread Archive',
            SEVEN_DAY_THREAD_ARCHIVE: '7 Day Thread Archive',
            TICKETED_EVENTS_ENABLED: 'Ticketed Events',
            VANITY_URL: 'Vanity URL',
            VERIFIED: 'Verified',
            VIP_REGIONS: 'VIP Regions',
            WELCOME_SCREEN_ENABLED: 'Welcome Screen Enabled',
            THREADS_ENABLED: 'Threads Enabled'
        };

        const parsed = features.map(f => mapping[f] || f);

        return parsed.join(delim);
    }

    parseVerificationLevel(guild?: Guild | InviteGuild | null): string {
        if (!guild) return 'Unknown';

        const verifLevel = guild.verificationLevel;

        const mapping: Record<VerificationLevel, string> = {
            VERY_HIGH: 'Very High',
            HIGH: 'High',
            LOW: 'Low',
            MEDIUM: 'Medium',
            NONE: 'None'
        };

        return mapping[verifLevel];
    }

    parsePermissionString(perms: PermissionString | PermissionString[], delim = ', ') {
        const mapping: Record<PermissionString, string> = {
            ADD_REACTIONS: 'Add Reactions',
            ADMINISTRATOR: 'Administrator',
            ATTACH_FILES: 'Attach Files',
            BAN_MEMBERS: 'Ban Members',
            CHANGE_NICKNAME: 'Change Nickname',
            CONNECT: 'Connect',
            CREATE_INSTANT_INVITE: 'Create Invites',
            DEAFEN_MEMBERS: 'Deafen Members',
            EMBED_LINKS: 'Embed Links',
            KICK_MEMBERS: 'Kick Members',
            MANAGE_CHANNELS: 'Manage Channels',
            MANAGE_EMOJIS_AND_STICKERS: 'Manage Emojis And Stickers',
            MANAGE_GUILD: 'Manage Server',
            MANAGE_MESSAGES: 'Manage Messages',
            MANAGE_NICKNAMES: 'Manage Nicknames',
            MANAGE_ROLES: 'Manage Roles',
            MANAGE_THREADS: 'Manage Threads',
            MANAGE_WEBHOOKS: 'Manage Webhooks',
            MENTION_EVERYONE: 'Mention @\u200beveryone, @\u200bhere and all roles',
            MOVE_MEMBERS: 'Move Members',
            MUTE_MEMBERS: 'Mute Members',
            PRIORITY_SPEAKER: 'Priority Speaker',
            READ_MESSAGE_HISTORY: 'Read Message History',
            REQUEST_TO_SPEAK: 'Request To Speak',
            SEND_MESSAGES: 'Send Messages',
            SEND_TTS_MESSAGES: 'Send Text To Speak Messages',
            SPEAK: 'Speak',
            STREAM: 'Video',
            USE_APPLICATION_COMMANDS: 'Use Application Commands',
            USE_EXTERNAL_EMOJIS: 'Use External Emojis',
            USE_EXTERNAL_STICKERS: 'Use External Stickers',
            USE_PRIVATE_THREADS: 'Use Private Threads',
            USE_PUBLIC_THREADS: 'Use Public Threads',
            USE_VAD: 'Use Voice Activity',
            VIEW_AUDIT_LOG: 'View Audit Log',
            VIEW_CHANNEL: 'View Channel',
            VIEW_GUILD_INSIGHTS: 'View Guild Insights',
            START_EMBEDDED_ACTIVITIES: 'Start Embedded Activities'
        };

        if (!Array.isArray(perms)) return mapping[perms];

        return perms.map(p => mapping[p]).join(delim);
    }

    parseUserFlags(user: User): string {
        const mapping: Record<UserFlagsString, string> = {
            BUGHUNTER_LEVEL_1: '<:BadgeBugHunter:842194493750640650> ',
            BUGHUNTER_LEVEL_2: '<:BadgeBugHunterLvl2:714835631452192789>',
            DISCORD_CERTIFIED_MODERATOR: '<:BadgeCertifiedMod:847961875463667762> ',
            DISCORD_EMPLOYEE: '<:BadgeStaff:842194494065082390> ',
            EARLY_SUPPORTER: '<:BadgeEarlySupporter:714860883880443985> ',
            EARLY_VERIFIED_BOT_DEVELOPER: '<:BadgeEarlyVerifiedBotDeveloper:714835632077144064> ',
            HOUSE_BALANCE: '<:BadgeBalance:778877245753786368> ',
            HOUSE_BRAVERY: '<:BadgeBravery:778877338988707841> ',
            HOUSE_BRILLIANCE: '<:BadgeBrilliance:778877104712056832> ',
            HYPESQUAD_EVENTS: '<:BadgeHypeSquadEvents:714835064822956104> ',
            PARTNERED_SERVER_OWNER: '<:BadgePartner:842194493608427571>',
            TEAM_USER: '',
            VERIFIED_BOT: '<:BadgeEarlyVerifiedBotDeveloper:714835632077144064> '
        };

        return user.flags?.toArray().map(f => mapping[f]).join(' ') || '';
    }

    parseMfaLevel(guild: Guild) {
        const mapping: Record<MFALevel, string> = {
            NONE: 'Disabled',
            ELEVATED: 'Enabled'
        };

        return mapping[guild.mfaLevel];
    }

    parseExplicitFilterLevel(guild: Guild) {
        const mapping: Record<ExplicitContentFilterLevel, string> = {
            ALL_MEMBERS: 'All Members',
            MEMBERS_WITHOUT_ROLES: 'Only Members Without Roles',
            DISABLED: 'Disabled'
        };

        return mapping[guild.explicitContentFilter];
    }

    parseNotificationLevel(guild: Guild) {
        const mapping: Record<DefaultMessageNotificationLevel, string> = {
            ALL_MESSAGES: 'All Members',
            ONLY_MENTIONS: 'Only Members Without Roles'
        };

        return mapping[guild.defaultMessageNotifications as DefaultMessageNotificationLevel];
    }

    humanize(ms: number, includeMs = false) {
        this.client.logger.debug(ms);
        const opts: Options = {
            largest: 3,
            delimiter: ', ',
            maxDecimalPoints: 0
        };
        if (includeMs) {
            opts.units = ['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms'];
        }

        return humanizeDuration(ms, opts);
    }

    formatDate(date?: Date | number) {
        return dayjs(date).format('HH:MM:YYYY hh:mm:ss');
    }

    formatDateRelative(date?: Date | number) {
        return `${this.formatDate(date)} (${this.humanize(dayjs().diff(date))} ago)`;
    }

    randInt(min = 1, max = 6): number {
        return Math.floor(Math.random() * max) + min;
    }
}

interface ConfirmOptions {
    question: string;
    responseIfNo?: string;
    responseIfYes?: string;
    userId: string;
    interaction: CommandInteraction;
}

