const test = require('ava');

const reducer = require('../src/reducer');
const {
    setConnected,
    setConnecting,
    userJoin,
    removeChannel,
    setISupport,
    disconnect
} = require('../src/actions');
const { makeStore, defaultState } = require('./helpers/util');

test('unrecognized action', t => {
    const store = makeStore();
    const oldState = store.getState();
    store.dispatch({ type: 'NOOP' });
    const newState = store.getState();

    t.deepEqual(oldState, newState);
});

test('initial state', t => {
    t.deepEqual(reducer(undefined, { type: 'FAKE_ACTION' }), defaultState);
});

test('setConnected', t => {
    const store = makeStore();

    store.dispatch(setConnected(true));
    t.true(store.getState().connected);

    store.dispatch(setConnected(false));
    t.false(store.getState().connected);
});

test('setConnecting', t => {
    const store = makeStore();

    store.dispatch(setConnecting(true));
    t.true(store.getState().connecting);

    store.dispatch(setConnecting(false));
    t.false(store.getState().connecting);
});

test('userJoin', t => {
    const store = makeStore({ connected: true });

    // Own client joining new channel
    store.dispatch(userJoin({
        nick: 'PATRIOT1959',
        chan: '#bdsmdungeon',
        me: true
    }));
    t.deepEqual(store.getState().channels, { '#bdsmdungeon': {
        joined: true,
        topic: '',
        topicwho: '',
        topictime: null,
        mode: [],
        users: { PATRIOT1959: '' }
    } });

    // Other user joining existing channel
    store.dispatch(userJoin({
        nick: 'BaseballTrivia',
        chan: '#bdsmdungeon',
        me: false
    }));
    t.deepEqual(store.getState().channels, { '#bdsmdungeon': {
        joined: true,
        topic: '',
        topicwho: '',
        topictime: null,
        mode: [],
        users: { PATRIOT1959: '', BaseballTrivia: '' }
    } });

});

test('removeChannel', t => {
    const store = makeStore({
        connected: true,
        channels: {
            '#bdsmdungeon': {
                joined: false,
                topic: '',
                topicwho: '',
                topictime: null,
                mode: [],
                users: {}
            }
        }
    });

    store.dispatch(removeChannel({
        chan: '#bdsmdungeon',
    }));
    t.deepEqual(store.getState().channels, {});
});


test('removeChannel throws if still joined', t => {
    const store = makeStore({
        connected: true,
        channels: {
            '#bdsmdungeon': {
                joined: true,
                topic: '',
                topicwho: '',
                topictime: null,
                mode: [],
                users: { PATRIOT1959: '' }
            }
        }
    });

    // Own client joining new channel
    t.throws(() => store.dispatch(removeChannel({
        chan: '#bdsmdungeon',
    })));
});

test('iSupport', t => {
    const store = makeStore({ connected: true });

    store.dispatch(setISupport({
        params: [
            'Hotpriest',
            'CHANTYPES=#',
            'EXCEPTS',
            'INVEX',
            'CHANMODES=eIbq,k,flj,CFPcgimnpstz',
            'CHANLIMIT=#:50',
            'PREFIX=(ov)@+',
            'MAXLIST=bqeI:100',
            'MODES=4',
            'NETWORK=IRCNet',
            'KNOCK',
            'STATUSMSG=@+',
            'CALLERID=g'
        ]
    }));

    t.deepEqual(store.getState().iSupport, {
        CHANTYPES: '#',
        EXCEPTS: true,
        INVEX: true,
        CHANMODES: ['eIbq','k','flj','CFPcgimnpstz'],
        CHANLIMIT: '#:50',
        PREFIX: {
            o: '@',
            v: '+'
        },
        MAXLIST: 'bqeI:100',
        MODES: '4',
        NETWORK: 'IRCNet',
        KNOCK: true,
        STATUSMSG: '@+',
        CALLERID: 'g'
    });
});

test('disconnect', t => {
    const store = makeStore({
        connected: true,
        channels: {
            '#bdsmdungeon': {
                topic: 'AnalDawg Funeral this Sunday @ 9AM',
                topicwho: '~Hotpriest@irc.somethingawful.com',
                topictime: new Date(),
                mode: ['n', 'p', 't'],
                users: {
                    Hotpriest: '@',
                    Sex_King: '',
                    misterarson_: '',
                    PATRIOT1959: '',
                    PleasureKevin: '+',
                    malediapered: '',
                    DISABLEDMAN: '',
                    BaseballTrivia: ''
                }
            }
        }
    });

    store.dispatch(disconnect());
    const { channels, connected, connecting } = store.getState();
    t.false(connected);
    t.false(connecting);
    t.deepEqual(channels, {
        '#bdsmdungeon': {
            joined: false,
            topic: '',
            topicwho: '',
            topictime: null,
            mode: [],
            users: {}
        }
    });
});
