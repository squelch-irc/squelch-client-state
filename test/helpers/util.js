const { createStore } = require('redux');
const merge = require('lodash.merge');

const reducer = require('../../src/reducer');
const channelReducer = require('../../src/channelReducer');

// Main reducer helpers
const makeStore = (initialState = {}) =>
    createStore(reducer, merge({}, defaultState, initialState));

const defaultState = {
    connected: false,
    connecting: false,
    iSupport: {
        PREFIX: {
            o: '@',
            v: '+'
        },
        CHANTYPES: '&#',
        CHANMODES: ['beI', 'k', 'l', 'aimnpqsrt']

    },
    channels: {}
};

// Channel reducer helpers
const makeChannelStore = (initialState = {}) =>
    createStore(channelReducer, merge({}, defaultChannelState, initialState));

const defaultChannelState = {
    joined: true,
    topic: '',
    topicwho: '',
    topictime: null,
    mode: [],
    users: {}
};

module.exports = {
    makeStore,
    defaultState,
    makeChannelStore,
    defaultChannelState
};
