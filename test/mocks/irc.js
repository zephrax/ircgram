'use strict';

import {
    EventEmitter
} from 'events';

class Client extends EventEmitter {

    constructor(server, nick, options) {
        super();

        this.server = server;
        this.nick = nick;
        this.options = options;

        if (options.autoConnect === true) {
            this.connect();
        }
    }

    connect() {
        const data = {
            args: [this.nick]
        };

        this.emit('registered', data);
    }

    disconnect() {
        return true;
    }

    say(target, text) {
        this.emit('say_called', target, text);
    }

}

export default {
    Client
}