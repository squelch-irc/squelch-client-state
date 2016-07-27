const omit = require('lodash.omit');

const {
    SET_TOPIC,
    SET_TOPIC_WHO,
    UPDATE_NAMES,
    USER_JOIN,
    USER_LEAVE,
    USER_QUIT,
    CHANGE_NICK,
    ADD_CHANNEL_MODE,
    REMOVE_CHANNEL_MODE,
    DISCONNECT
} = require('./actions');

module.exports = (state, action) => {
    if(!state) {
        if(!(action.type === USER_JOIN && action.me)) {
            throw new Error('Can only instantiate channel state on self USER_JOIN');
        }
        state = {
            joined: true,
            topic: '',
            topicwho: '',
            topictime: null,
            mode: [],
            users: {}
        };
    }

    switch(action.type) {
        case USER_JOIN:
            if(action.me) {
                return {
                    ...state,
                    joined: true,
                    users: { [action.nick]: '' }
                };
            }

            return {
                ...state,
                users: {
                    ...state.users,
                    [action.nick]: ''
                }
            };

        case USER_LEAVE:
        case USER_QUIT:
        case DISCONNECT:
            if(action.me || action.type === DISCONNECT) {
                return {
                    ...state,
                    joined: false,
                    topic: '',
                    topicwho: '',
                    topictime: null,
                    mode: [],
                    users: {}
                };
            }

            if(!state.users[action.nick]) break;
            return {
                ...state,
                users: omit(state.users, action.nick)
            };

        case SET_TOPIC:
            return {
                ...state,
                topic: action.topic
            };

        case SET_TOPIC_WHO:
            return {
                ...state,
                topicwho: action.hostmask,
                topictime: action.time
            };

        case UPDATE_NAMES:
            return {
                ...state,
                users: action.names
            };

        case CHANGE_NICK:
            if(!state.users[action.oldNick]) break;
            return {
                ...state,
                users: {
                    ...omit(state.users, action.oldNick),
                    [action.newNick]: state.users[action.oldNick]
                }
            };

        case ADD_CHANNEL_MODE:
            if(action.prefix) {
                return {
                    ...state,
                    users: {
                        ...state.users,
                        [action.param]: action.prefix
                    }
                };
            }
            return {
                ...state,
                mode: [...state.mode, action.mode]
            };

        case REMOVE_CHANNEL_MODE:
            if(action.prefix) {
                return {
                    ...state,
                    users: {
                        ...state.users,
                        [action.param]: ''
                    }
                };
            }
            return {
                ...state,
                mode: state.mode.filter(m => m !== action.mode)
            };
    }

    return state;
};
