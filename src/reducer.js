const omit = require('lodash.omit');
const mapValues = require('lodash.mapvalues');

const channel = require('./channelReducer');
const {
    USER_JOIN,
    REMOVE_CHANNEL,
    SET_ISUPPORT,
    SET_CONNECTED,
    SET_CONNECTING,
    DISCONNECT
} = require('./actions');

module.exports = (state, action) => {
    if(!state) {
        state = {
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
    }
    switch(action.type) {
        // Create channel if we join a channel
        case USER_JOIN:
            if(action.me) {
                return {
                    ...state,
                    channels: {
                        ...state.channels,
                        [action.chan]: channel(undefined, action)
                    }
                };
            }
            break;

        // Delete channel data
        case REMOVE_CHANNEL:
            if(state.channels[action.chan] && state.channels[action.chan].joined) {
                throw new Error('Cannot remove a channel that is still joined.');
            }
            return {
                ...state,
                channels: omit(state.channels, action.chan)
            };

        case SET_ISUPPORT:
            return {
                ...state,
                iSupport: {
                    ...state.iSupport,
                    ...action.iSupport
                }
            };

        case SET_CONNECTED:
            return {
                ...state,
                connected: action.connected
            };

        case SET_CONNECTING:
            return {
                ...state,
                connecting: action.connecting
            };

        case DISCONNECT:
            return {
                ...state,
                connecting: false,
                connected: false,
                channels: mapValues(state.channels, ch => channel(ch, action))
            };
    }

    // Non chan-specific action, send to all channels
    if(!action.chan) {
        return {
            ...state,
            channels: mapValues(state.channels, ch => channel(ch, action))
        };
    }

    return {
        ...state,
        channels: {
            ...state.channels,
            [action.chan]: channel(state.channels[action.chan], action)

        }
    };
};
