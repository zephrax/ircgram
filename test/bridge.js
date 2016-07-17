'use strict';

import mocha from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
    irc as mockIrc,
    TelegramBot as mockTelegramBot
} from './mocks';
import User from '../src/libs/user';
import Bridge from '../src/libs/bridge';

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

const configFile = {
    telegram: {
        token: '_DUMMY_TELEGRAM_TOKEN_'
    },

    bridges: [{
        users_db: '../data/dummy_users.json',

        telegram: {
            group_id: '-111111111',
            ignore_users : [ 222 ]
        },
        irc: {
            server: 'irc.kernelpanic.com.ar',
            port: 6667,
            ssl: false,
            channel: '#ircgram',
            master_nick: 'ircgram_master',
            nick_prefix: '',
            nick_suffix: ''
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

    it('should register successfuly', () => {
        const data = {
            args: [ testBridge.irc.master_nick]
        };

        newBridge.masterUserClient.on('registered', (data) => {
            data.args[0].should.equal(testBridge.irc.master_nick);
        });

        newBridge.masterUserClient.connect();
    });

    it('should handle an error', () => {
        const data = {
            error: 'Test'
        };

        newBridge.masterUserClient.on('error', (err) => {
            err.should.equal(data);
        });

        newBridge.masterUserClient.emit('error', data);
    });

    it('should have the master irc connection configured nickname', () => {
        newBridge.ircOwnUsernames.should.be.instanceOf(Array);
        newBridge.ircOwnUsernames.should.include.members([testBridge.irc.master_nick]);
    });

    it('should add a recently joined telegram user', () => {
        newBridge.tgBot.emit('new_chat_participant', newUserMsg);

        newBridge.ircConnections.should.have.property(newUserMsg.new_chat_participant.id);
    });

    it('should add an active telegram user', () => {
        const testMessage = 'Testing active user';
        const theUser = {
            id: 778,
            username : 'newActiveUser',
            first_name: 'NewActive',
            last_name : 'User'
        };

        let spy = sinon.spy(newBridge, 'addUser');

        newBridge.tgBot.emit('message', {
            chat: {
                id: testBridge.telegram.group_id
            },
            from: theUser,
            text: testMessage
        });

        newBridge.addUser.should.have.been.calledWith(theUser);
        spy.restore();
    });

    it('should not add an active telegram user from non-mapped group', () => {
        const testMessage = 'Testing active user';
        const theUser = {
            id: 779,
            username : 'newActiveUser2',
            first_name: 'NewActive2',
            last_name : 'User2'
        };

        let dummyGroup = 112233;

        newBridge.tgBot.emit('message', {
            chat: {
                id: dummyGroup
            },
            from: theUser,
            text: testMessage
        });

        newBridge.ircConnections.should.not.have.property(112233);
    });

    it('should forward irc to telegram message', () => {
        const testMessage = 'Test forward message';
        let spy = sinon.spy(tgBot, 'sendMessage');
        newBridge.masterUserClient.emit('message', 'test_irc_user', testBridge.irc.channel, testMessage);
        tgBot.sendMessage.should.have.been.calledWith(testBridge.telegram.group_id, `[IRC/test_irc_user] ${testMessage}`);
        spy.restore();
    });

    it('should forward telegram to irc message', () => {
        const testMessage = 'Test forward message';
        let spy = sinon.spy(newBridge.ircConnections[newUserMsg.new_chat_participant.id], 'say');

        newBridge.tgBot.emit('message', {
            chat: {
                id: testBridge.telegram.group_id
            },
            from: {
                id: 777
            },
            text: testMessage
        });

        newBridge.ircConnections[newUserMsg.new_chat_participant.id].say.should.have.been.calledWith(testBridge.irc.channel, testMessage);
        spy.restore();
    });


    it('should map irc nick to telegram username mention', () => {
      const testMessage = 'Mention to new_chat_participant';
      let spy = sinon.spy(tgBot, 'sendMessage');
      newBridge.masterUserClient.emit('message', 'test_irc_user', testBridge.irc.channel, testMessage);
      tgBot.sendMessage.should.have.been.calledWith(testBridge.telegram.group_id, `[IRC/test_irc_user] Mention to @new_chat_participant`);
      spy.restore();
    });

    it('should map irc nick to telegram first_name mention', () => {
      const testMessage = 'Mention to new_chat_participant';
      let spy = sinon.spy(tgBot, 'sendMessage');
      newBridge.irc2tgUserMapping.new_chat_participant.username = '';
      newBridge.irc2tgUserMapping.new_chat_participant.first_name = 'New';
      newBridge.irc2tgUserMapping.new_chat_participant.last_name = '';
      newBridge.masterUserClient.emit('message', 'test_irc_user', testBridge.irc.channel, testMessage);
      tgBot.sendMessage.should.have.been.calledWith(testBridge.telegram.group_id, `[IRC/test_irc_user] Mention to New`);
      spy.restore();
    });

    it('should map irc nick to telegram last_name mention', () => {
      const testMessage = 'Mention to new_chat_participant';
      let spy = sinon.spy(tgBot, 'sendMessage');
      newBridge.irc2tgUserMapping.new_chat_participant.username = '';
      newBridge.irc2tgUserMapping.new_chat_participant.first_name = '';
      newBridge.irc2tgUserMapping.new_chat_participant.last_name = 'User';
      newBridge.masterUserClient.emit('message', 'test_irc_user', testBridge.irc.channel, testMessage);
      tgBot.sendMessage.should.have.been.calledWith(testBridge.telegram.group_id, `[IRC/test_irc_user] Mention to User`);
      spy.restore();
    });

    it('should remove an irc user when telegram user has left group', () => {
        const leftUserMsg = {
            chat: {
                id: testBridge.telegram.group_id
            },
            left_chat_participant: {
                id: 777,
                username: 'left_chat_participant',
                first_name: 'left',
                last_name: 'participant'
            }
        };

        newBridge.tgBot.emit('left_chat_participant', leftUserMsg);

        newBridge.ircConnections.should.not.have.property(leftUserMsg.left_chat_participant.id);
    });

    it('should add an irc user non-prefixed', () => {
        const userData = {
          id: 888,
          username : 'newUser',
          first_name : 'New',
          last_name : 'User'
        };

        newBridge.addUser(userData);

        newBridge.ircConnections[userData.id].on('registered', (data) => {
            data.args[0].should.equal(userData.username);
        });

        newBridge.ircConnections[userData.id].should.be.instanceOf(mockIrc.Client);
        newBridge.removeUser(888);
    });

    it('should add an irc user prefixed', () => {
        const userData = {
          id: 888,
          username : 'newUser',
          first_name : 'New',
          last_name : 'User'
        };

        newBridge.config.irc.nick_prefix = 'pre_';

        newBridge.addUser(userData);
        newBridge.ircConnections[userData.id].should.be.instanceOf(mockIrc.Client);
        newBridge.ircConnections[userData.id].nick.should.equal(newBridge.config.irc.nick_prefix + userData.username);

        newBridge.config.irc.nick_prefix = '';
        newBridge.removeUser(888);
    });

    it('should add an irc user suffixed', () => {
        const userData = {
          id: 888,
          username : 'newUser',
          first_name : 'New',
          last_name : 'User'
        };

        newBridge.config.irc.nick_suffix = '_suf';

        newBridge.addUser(userData);
        newBridge.ircConnections[userData.id].should.be.instanceOf(mockIrc.Client);
        newBridge.ircConnections[userData.id].nick.should.equal(userData.username + newBridge.config.irc.nick_suffix);

        newBridge.config.irc.nick_suffix = '';
        newBridge.removeUser(888);
    });

    it('should ignore user if in config.ignored_users', () => {
        const userData = {
          id: 222,
          username : 'ignoredUser',
          first_name : 'Ignored',
          last_name : 'User'
        };

        newBridge.addUser(userData);

        newBridge.ircConnections.should.have.not.property(userData.id);
    });
});
