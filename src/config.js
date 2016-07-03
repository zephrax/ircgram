'use strict'

let config = {
  users_db: '../data/users.json',

  telegram : {
    group_id: '_INSERT_GROUP_ID_',
    token: '_TELEGRAM_BOT_TOKEN_'
  },

  irc : {
    server : 'irc.kernelpanic.com.ar',
    port : 6667,
    ssl : false,
    channel : '#ircgram',
    master_nick : 'ircgram_guest'
  }
};

export default config;
