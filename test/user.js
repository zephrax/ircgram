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

});
