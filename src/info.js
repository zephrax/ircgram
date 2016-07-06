'use strict';

import config from './config';
import TelegramBot from 'node-telegram-bot-api';

const tgBot = new TelegramBot(config.telegram.token, {polling: true});

tgBot.on('message', (msg) => {
  if (msg.chat && msg.chat.type === 'group') {
    console.log('--- GROUP DETECTED ---');
    console.log(`ID: ${msg.chat.id}`);
    console.log(`Title: ${msg.chat.title}`);
  }
});

tgBot.on('new_chat_participant', (msg) => {
  if (msg.chat && msg.chat.type === 'group') {
    console.log('--- GROUP DETECTED ---');
    console.log(`ID: ${msg.chat.id}`);
    console.log(`Title: ${msg.chat.title}`);
  }
});
