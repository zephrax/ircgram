'use strict';
/* jshint esversion: 6, node: true */

import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import irc from 'irc';
import User from './user';

const _DEBUG_ = process.env.DEBUG || false;

class Bridge {

  constructor(options) {
    this.options = options;
    this.ircConnections = {};
    this.registeredCount = 0;
    this.usersCount = 0;
    this.irc2tgUserMapping = {};
    this.ircOwnUsernames = [];

    this.tgBot = new TelegramBot(options.telegram.token, {polling: true});

    this.setupMasterIRCUser();
    this.bindEvents();
  }

  setupMasterIRCUser() {
    let masterUserClient = new irc.Client(this.options.irc.server, this.options.irc.master_nick, {
      port: this.options.irc.port,
      secure : this.options.irc.ssl,
      autoConnect: true,
      channels: [ this.options.irc.channel ],
    });

    masterUserClient.addListener('message', ( (masterUserClient) => {
        return (from, to, message) => {
          if (_DEBUG_) {
            console.log(this.irc2tgUserMapping);
            console.log(from + ' => ' + to + ': ' + message);

            console.log(this.ircOwnUsernames);
            console.log(from);
          }

          if (to === this.options.irc.channel && this.ircOwnUsernames.indexOf(from) === -1) {
            let userNames = Object.keys(this.irc2tgUserMapping);
            for (let i=0;i<userNames.length;i++) {
              if (message.match(userNames[i])) {
                message = message.replace(userNames[i], (this.irc2tgUserMapping[userNames[i]].username ? '@' : '') + `${this.irc2tgUserMapping[userNames[i]].telegram_name}`);
              }
            }

            this.tgBot.sendMessage(this.options.telegram.group_id, `[IRC/${from}] ${message}`);
          }
        };
    })(masterUserClient));

    masterUserClient.addListener('registered', (data) => {
      let nick = data.args[0];
      this.options.irc.master_nick = nick;
    });

    masterUserClient.addListener('error', (message) => {
      if (_DEBUG_) {
        console.log('error: ', message);
      }
    });
  }

  addUser(userData) {
    let user = new User(userData);
    this.usersCount++;

    if (_DEBUG_) {
      console.log('-- ADD USER --');
      console.log(user);
      console.log('-- ADD USER --');
    }

    let thisUserClient = new irc.Client(this.options.irc.server, user.irc_nick, {
      port: this.options.irc.port,
      secure : this.options.irc.ssl,
      autoConnect: false,
      channels: [ this.options.irc.channel ],
    });

    thisUserClient.addListener('registered', ((data) => {
      return (data) => {
        let nick = data.args[0];
        user.real_irc_nick = nick;
        this.irc2tgUserMapping[nick] = user;

        this.ircOwnUsernames = [ this.options.irc.master_nick ].concat(Object.keys(this.irc2tgUserMapping));

        if (++this.registeredCount === this.usersCount) {
          this.updateUsersDb();
        }
      };
    })(user));

    thisUserClient.addListener('error', (message) => {
      if (_DEBUG_) {
        console.log('error: ', message);
      }
    });

    this.ircConnections[userData.id] = thisUserClient;
  }

  removeUser(userId) {
    this.ircConnections[userId].disconnect();
    delete this.ircConnections[userId];
  }

  start() {
    Object.keys(this.ircConnections).map((userId) => {
      this.ircConnections[userId].connect();
    });
  }

  bindEvents() {
    this.tgBot.on('message', (msg) => {
      let chatId = msg.chat.id;
      if (_DEBUG_) {
        console.log(msg);
      }

      if (!this.ircConnections[msg.from.id]) {
        this.addUser(new User(msg.from));
      }

      if (this.ircConnections[msg.from.id]) {
        this.ircConnections[msg.from.id].say(this.options.irc.channel, msg.text);
      }
    });

    this.tgBot.on('new_chat_participant', (msg) => {
      if (_DEBUG_) {
        console.log(msg);
      }

      if (!this.ircConnections[msg.new_chat_participant.id]) {
        this.addUser(new User(msg.new_chat_participant));

        this.updateUsersDb();
      }
    });

    this.tgBot.on('left_chat_participant', (msg) => {
      if (_DEBUG_) {
        console.log(msg);
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

    fs.writeFile(this.options.users_db, JSON.stringify(result, null, 2), (wrErr) => {
      if (_DEBUG_) {
        console.log(wrErr);
      }
    });
  }
}

export default Bridge;
