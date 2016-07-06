'use strict';

import mocha from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
    irc as mockIrc,
    TelegramBot as mockTelegramBot
} from './mocks';
import User from '../src/libs/user';
import Bridge from '../src/libs/bridge';

chai.use(chaiAsPromised);
chai.should();

const configFile = {
    telegram: {
        token: '_DUMMY_TELEGRAM_TOKEN_'
    },

    bridges: [{
        users_db: '../data/dummy_users.json',

        telegram: {
            group_id: '-111111111'
        },
        irc: {
            server: 'irc.kernelpanic.com.ar',
            port: 6667,
            ssl: false,
            channel: '#ircgram',
            master_nick: 'ircgram_master',
            nick_prefix: '',
            nick_suffix: '_br'
        }
    }]
};

const testBridge = configFile.bridges[0];

var tgBot = new mockTelegramBot(configFile.telegram.token, {
    polling: true
});

describe('IRCGram Bridge', () => {
    const options = {
        config: testBridge,
        ircLib: mockIrc,
        tgBot: tgBot
    };

    const newUserMsg = {
        chat: {
            id: testBridge.telegram.group_id
        },
        new_chat_participant: {
            id: 777,
            username: 'new_chat_participant',
            first_name: 'new',
            last_name: 'participant'
        }
    };

    const newBridge = new Bridge(options);

    it('should create a Bridge Object', () => {
        newBridge.should.be.an.instanceOf(Bridge);
    });

    it('should create a master irc connection', () => {
        newBridge.masterUserClient.should.be.an.instanceOf(mockIrc.Client);
    });

    it('should should have the master irc connection configured nickname', () => {
        newBridge.ircOwnUsernames.should.be.instanceOf(Array);
        newBridge.ircOwnUsernames.should.include.members([testBridge.irc.master_nick]);
    });

    it('should should add an active telegram user', () => {
        newBridge.tgBot.emit('new_chat_participant', newUserMsg);

        newBridge.ircConnections.should.have.property(newUserMsg.new_chat_participant.id);
    });

    it('should forward irc to telegram message', () => {
        const testMessage = 'Test forward message';
        newBridge.tgBot.on('sendmessage_called', (target, msg) => {
            msg.should.equal(`[IRC/test_irc_user] ${testMessage}`);
            target.should.equal(testBridge.telegram.group_id);
        });

        newBridge.masterUserClient.emit('message', 'test_irc_user', testBridge.irc.channel, testMessage);
    });

    it('should forward telegram to irc message', () => {
        const testMessage = 'Test forward message';
        newBridge.ircConnections[777].on('say_called', (target, msg) => {
            msg.should.equal(testMessage);
            target.should.equal(testBridge.irc.channel);
        });

        newBridge.tgBot.emit('message', {
            chat: {
                id: testBridge.telegram.group_id
            },
            from: {
                id: 777
            },
            text: testMessage
        });
    });
});