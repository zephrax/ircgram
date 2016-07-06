'use strict'

let config = {

  telegram : {
    token: '_TELGRAM_BOT_TOKEN_'
  },

  bridges : [
    {
      users_db: '../data/this_bridge_db.json',

      telegram : {
        /*
        * To get this ID invite the bot to a group and run: npm run info
        *   then write a text to the group and you will see the group_id in the console
        */
        group_id: '_TELEGRAM_GROUP_ID_'
      },
      irc : {
        server : 'irc.kernelpanic.com.ar',
        port : 6667,
        ssl : false,
        channel : '#ircgram_guest',
        master_nick : 'ircgram_guest',
        nick_prefix: '',
        nick_suffix: '_ig'
      }
    },
    /**
     * You can add as many bridges as you want
     */
    // {
    //   users_db: '../data/other_bridge_db.json',
    //
    //   telegram : {
    //     group_id: '_TELEGRAM_GROUP_ID_'
    //   },
    //   irc : {
    //     server : 'irc.kernelpanic.com.ar',
    //     port : 6667,
    //     ssl : false,
    //     channel : '#ircgram_guest',
    //     master_nick : 'ircgram_guest',
    //     nick_prefix: '',
    //     nick_suffix: '_ig'
    //   }
    // }
  ]
};

export default config;
