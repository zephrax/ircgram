'use strict';

import {
    EventEmitter
} from 'events';

class TelegramBot extends EventEmitter {

    constructor(token, options) {
        super();

        this.token = token;
        this.options = options;
    }

    sendMessage(target, text) {
    }
}

export default TelegramBot;
