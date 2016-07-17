'use strict';

import fs from 'fs';
import User from './user';
import debugLib from 'debug';

const debug = {
    irc : debugLib('irc'),
    telegram : debugLib('telegram'),
    bridge : debugLib('bridge'),
};

class Bridge {

    constructor(options) {
        this.config = options.config;
        this.ircConnections = {};
        this.registeredCount = 0;
        this.usersCount = 0;
        this.masterUserClient = false;
        this.irc2tgUserMapping = {};
        this.ircOwnUsernames = [];

        this.tgBot = options.tgBot;
        this.ircLib = options.ircLib;

        this.setupMasterIRCUser();
        this.bindEvents();
    }

    setupMasterIRCUser() {
        this.masterUserClient = new this.ircLib.Client(this.config.irc.server, this.config.irc.master_nick, {
            port: this.config.irc.port,
            secure: this.config.irc.ssl,
            autoConnect: true,
            channels: [this.config.irc.channel],
        });

        this.masterUserClient.addListener('message', (from, to, message) => {
            debug.irc(this.irc2tgUserMapping);
            debug.irc(from + ' => ' + to + ': ' + message);

            debug.irc(this.ircOwnUsernames);
            debug.irc(from);

            if (to === this.config.irc.channel && this.ircOwnUsernames.indexOf(from) === -1) {
                let userNames = Object.keys(this.irc2tgUserMapping);
                for (let i = 0; i < userNames.length; i++) {
                    if (message.match(userNames[i])) {
                        message = message.replace(userNames[i], (this.irc2tgUserMapping[userNames[i]].username ? '@' : '') + `${this.irc2tgUserMapping[userNames[i]].telegram_name}`);
                    }
                }

                this.tgBot.sendMessage(this.config.telegram.group_id, `[IRC/${from}] ${message}`);
            }
        });

        this.masterUserClient.addListener('registered', (data) => {
            const nick = data.args[0];
            this.config.irc.master_nick = nick;
        });

        /* istanbul ignore next */
        this.masterUserClient.addListener('error', (message) => {
            debug.irc('error: ', message);
        });

        this.ircOwnUsernames = [this.config.irc.master_nick];
    }

    addUser(userData) {
        if (this.config.telegram.ignore_users && this.config.telegram.ignore_users.indexOf(userData.id) > -1) {
            return false;
        }

        let user = new User(userData);
        this.usersCount++;

        debug.bridge('-- ADD USER --');
        debug.bridge(user);
        debug.bridge('-- ADD USER --');

        let userNick = this.config.irc.nick_prefix ? this.config.irc.nick_prefix : '';
        userNick += user.irc_nick + (this.config.irc.nick_suffix ? this.config.irc.nick_suffix : '');

        this.ircConnections[userData.id] = new this.ircLib.Client(this.config.irc.server, userNick, {
            port: this.config.irc.port,
            secure: this.config.irc.ssl,
            autoConnect: false,
            channels: [this.config.irc.channel],
        });

        this.ircConnections[userData.id].addListener('registered', ((user) => {
            return (data) => {
                let nick = data.args[0];
                user.real_irc_nick = nick;
                this.irc2tgUserMapping[nick] = user;

                this.ircOwnUsernames = [this.config.irc.master_nick].concat(Object.keys(this.irc2tgUserMapping));

                if (++this.registeredCount === this.usersCount) {
                    this.updateUsersDb();
                }
            };
        })(user));

        /* istanbul ignore next */
        this.ircConnections[userData.id].addListener('error', (message) => {
            debug.irc('error: ', message);
        });

        this.ircConnections[userData.id].connect();
    }

    removeUser(userId) {
        this.ircConnections[userId].disconnect();
        delete this.ircConnections[userId];
    }

    bindEvents() {
        this.tgBot.on('message', (msg) => {
            let chatId = msg.chat.id;

            if (chatId != this.config.telegram.group_id) {
                return false;
            }

            debug.telegram(msg);

            if (!this.ircConnections[msg.from.id]) {
                this.addUser(msg.from);
            }

            if (this.ircConnections[msg.from.id]) {
                this.ircConnections[msg.from.id].say(this.config.irc.channel, msg.text);
            }
        });

        this.tgBot.on('new_chat_participant', (msg) => {
            debug.telegram(msg);

            let chatId = msg.chat.id;

            if (chatId != this.config.telegram.group_id) {
                return;
            }

            if (!this.ircConnections[msg.new_chat_participant.id]) {
                this.addUser(msg.new_chat_participant);

                this.updateUsersDb();
            }
        });

        this.tgBot.on('left_chat_participant', (msg) => {
            debug.telegram(msg);

            let chatId = msg.chat.id;

            if (chatId != this.config.telegram.group_id) {
                return;
            }

            if (this.ircConnections[msg.left_chat_participant.id]) {
                this.removeUser(msg.left_chat_participant.id);
            }
        });
    }

    updateUsersDb() {

        let result = Object.keys(this.irc2tgUserMapping).map((userKey) => {
            return {
                id: this.irc2tgUserMapping[userKey].id,
                username: this.irc2tgUserMapping[userKey].username,
                first_name: this.irc2tgUserMapping[userKey].first_name,
                last_name: this.irc2tgUserMapping[userKey].last_name
            };
        });

        fs.writeFile(this.config.users_db, JSON.stringify(result, null, 2), (wrErr) => {
            debug.bridge(wrErr);
        });
    }
}

export default Bridge;
