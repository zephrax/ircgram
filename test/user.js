'use strict';

import mocha from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import User from '../src/libs/user';

chai.use(chaiAsPromised);
chai.should();

describe('IRCGram User', () => {
    let fullUser = new User({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe'
    });

    let incompleteUser = new User({
        id: 2,
        first_name: 'John',
        last_name: 'Doe'
    });

    it('should create a user', () => {
        return fullUser.should.be.an.instanceOf(User);
    });

    it('should have all of the properties', () => {
        fullUser.should.have.property('id', 1);
        fullUser.should.have.property('first_name', 'John');
        fullUser.should.have.property('last_name', 'Doe');
        fullUser.should.have.property('username', 'johndoe');
    });

    it('should get irc nickname', () => {
        fullUser.should.have.property('irc_nick', 'johndoe');
        incompleteUser.should.have.property('irc_nick', 'John_Doe');
    });

    it('should get telegram mention name', () => {
        fullUser.should.have.property('telegram_name', 'johndoe');
        incompleteUser.should.have.property('telegram_name', 'John');
    });

    it('should set properties correctly', () => {
        fullUser.id = 3;
        fullUser.first_name = "John2";
        fullUser.last_name = "Doe2";
        fullUser.username = "johndoe2";
        fullUser.real_irc_nick = "john_doe2";

        fullUser.should.have.property('id', 3);
        fullUser.should.have.property('first_name', 'John2');
        fullUser.should.have.property('last_name', 'Doe2');
        fullUser.should.have.property('username', 'johndoe2');
        fullUser.should.have.property('real_irc_nick', 'john_doe2');
    });

    it('should get irc nickname if has no username', () => {
        fullUser.first_name = "John";
        fullUser.last_name = "Doe";
        fullUser.username = "";
        fullUser.real_irc_nick = "";

        fullUser.should.have.property('irc_nick', 'John_Doe');
    });

    it('should get irc nickname if has only first_name', () => {
        fullUser.first_name = "John";
        fullUser.last_name = "";
        fullUser.username = "";
        fullUser.real_irc_nick = "";

        fullUser.should.have.property('irc_nick', 'John');
    });

    it('should get irc nickname if has only last_name', () => {
        fullUser.first_name = "";
        fullUser.last_name = "Doe";
        fullUser.username = "";
        fullUser.real_irc_nick = "";

        fullUser.should.have.property('irc_nick', 'Doe');
    });

    it('should get telegram mention name if has only first_name', () => {
        fullUser.first_name = "John";
        fullUser.last_name = "";
        fullUser.username = "";
        fullUser.real_irc_nick = "";

        fullUser.should.have.property('telegram_name', 'John');
    });

    it('should get telegram mention name if has only last_name', () => {
        fullUser.first_name = "";
        fullUser.last_name = "Doe";
        fullUser.username = "";
        fullUser.real_irc_nick = "";

        fullUser.should.have.property('telegram_name', 'Doe');
    });
});
