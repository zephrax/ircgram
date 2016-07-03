A complexly simple [Telegram](https://telegram.org/) ↔ IRC gateway.

* Official IRC channel: [#kernelpanic @ irc.kernelpanic.com.ar](https://kernelpanic.com.ar/chat/)

#### Features:

* Supports single IRC channel ↔ Telegram group, with multiple users.
* Telegram user -> irc user mapping (one connection per user joined to the group)


Quick start
-----------

Make sure you've installed Node.js.

1. Set up your bot with [BotFather](https://telegram.me/botfather)
2. Use the `/setprivacy` command with `BotFather` to allow your bot to see all
   messages in your group (NOTE on usage: bot name is preceded by @ sign and
   'Disable' is case-sensitive)
3. Install dependencies `npm install`
4. Clone the repository `git clone https://github.com/zephrax/ircgram.git`
5. Run `npm build && npm run info` and invite the bot to the group, then you can grab the group_id
6. Edit config `cd ircgram/ && $EDITOR src/config.js` configuring the token, group_id and IRC connection info.
7. Start service `npm run build && npm start`
