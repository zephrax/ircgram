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

        this.addListener('registered', (data) => {
            this.nick = data.args[0];
        });
    }

    connect() {
        const data = {
            args: [this.nick]
        };

        this.emit('registered', data);
    }

    disconnect() {
    }

    say(target, text) {
    }

}

export default {
    Client
};
