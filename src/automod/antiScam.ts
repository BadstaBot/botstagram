import {GuildMember} from 'discord.js';

export class AntiScam {
    private readonly member: GuildMember;

    constructor(member: GuildMember) {
        this.member = member;
    }

    async run(): Promise<boolean> {
        if (await this._checkUsername()) {
            return true;
        }

        return false;
    }

    async _checkUsername(): Promise<boolean> {
        const scamNames = [
            'discord staff',
            'discord mods',
            'discord partners',
            'discord testers'
        ];

        if (scamNames.includes(this.member.user.username.toLowerCase())) {
            await this.member.ban({
                reason: `[Anti-Scam] Suspicious Username [${this.member.user.username}]`
            }).catch(() => {
            });

            return true;
        }

        return false;
    }
}
