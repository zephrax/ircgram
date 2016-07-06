'use strict';

class User {

    constructor(telegramData) {
        this._id = telegramData.id;
        this._username = telegramData.username;
        this._first_name = telegramData.first_name;
        this._last_name = telegramData.last_name;

        this._real_irc_nick = this.irc_nick;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    get username() {
        return this._username;
    }

    set username(username) {
        this._username = username;
    }

    get first_name() {
        return this._first_name;
    }

    set first_name(first_name) {
        this._first_name = first_name;
    }

    get last_name() {
        return this._last_name;
    }

    set last_name(last_name) {
        this._last_name = last_name;
    }

    get real_irc_nick() {
        return this._real_nick;
    }

    set real_irc_nick(nick) {
        this._real_irc_nick = nick;
    }

    get irc_nick() {
        if (this._username) {
            return this._username;
        }

        if (this._first_name && this._last_name) {
            return `${this._first_name}_${this._last_name}`;
        }

        if (this._first_name) {
            return this._first_name;
        }

        if (this._last_name) {
            return this._last_name;
        }
    }

    get telegram_name() {
        if (this._username) {
            return this._username;
        }

        if (this._first_name) {
            return this._first_name;
        }

        if (this._last_name) {
            return this._last_name;
        }
    }
}

export default User;