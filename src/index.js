'use strict';
/* jshint esversion: 6, node: true */

import config from './config';
import fs from 'fs';
import Bridge from './libs/bridge';
import TelegramBot from 'node-telegram-bot-api';
import irc from 'irc';

const _DEBUG_ = process.env.DEBUG || false;

let bridges = [];

const tgBot = new TelegramBot(config.telegram.token, { polling : true });

const bridgeTasks = config.bridges.map((bridge) => {
  return new Promise((resolve, reject) => {
      let options = {
        config : bridge,
        tgBot : tgBot,
        ircLib : irc
      };

      let ircGramBridge = new Bridge(options);

      fs.readFile(bridge.users_db, (err, data) => {
        if (err) {
          data = [];
        }

        try {
          let users = JSON.parse(data);

          users.forEach((user) => {
            console.log(`Configuring ${user.username}...`);

            ircGramBridge.addUser(user);
          });
        } catch (e) {
          reject(e);
        }

        bridges.push(ircGramBridge);

        resolve();
      });
    });
});

Promise.all(bridgeTasks).then((values) => {
  console.log('Bridges ready');
}).catch((err) => {
  console.log(err.stack);
  process.exit(1);
});
