'use strict';
/* jshint esversion: 6, node: true */

import config from './config';
import fs from 'fs';
import Bridge from './libs/bridge';

const _DEBUG_ = process.env.DEBUG || false;

var ircGramBridge = new Bridge(config);

fs.readFile(config.users_db, (err, data) => {
  if (err) {
    throw err;
  }

  try {
    let users = JSON.parse(data);

    users.forEach((user) => {
      console.log(`Configuring ${user.username}...`);

      ircGramBridge.addUser(user);
    });
  } catch (e) {
    console.log('Error loading data from users.json, it will be fixed automatically when users chat.');
  }

  ircGramBridge.start();
});
