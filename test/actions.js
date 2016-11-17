const test = require('ava')

const {
    REMOVE_CHANNEL,
    SET_ISUPPORT,
    SET_CONNECTED,
    SET_CONNECTING,
    SET_TOPIC,
    SET_TOPIC_WHO,
    UPDATE_NAMES,
    USER_JOIN,
    USER_LEAVE,
    USER_QUIT,
    CHANGE_NICK,
    ADD_CHANNEL_MODE,
    REMOVE_CHANNEL_MODE,
    DISCONNECT,

    removeChannel,
    setISupport,
    setConnected,
    setConnecting,
    setTopic,
    setTopicWho,
    updateNames,
    userJoin,
    userLeave,
    userQuit,
    changeNick,
    addChannelMode,
    removeChannelMode,
    disconnect

} = require('../src/actions')

test('removeChannel', t => {
  t.deepEqual(removeChannel({
    id: 123,
    chan: '#bdsmdungeon'
  }), {
    id: 123,
    type: REMOVE_CHANNEL,
    chan: '#bdsmdungeon'
  })
})

test('setISupport', t => {
  t.deepEqual(setISupport({
    id: 123,
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
      'CALLERID=g',
      'are supported by this server'
    ]
  }), {
    id: 123,
    type: SET_ISUPPORT,
    iSupport: {
      CHANTYPES: '#',
      EXCEPTS: true,
      INVEX: true,
      CHANMODES: ['eIbq', 'k', 'flj', 'CFPcgimnpstz'],
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
    }
  })
})

test('setConnected', t => {
  t.deepEqual(setConnected({
    id: 123,
    connected: true
  }), {
    id: 123,
    type: SET_CONNECTED,
    connected: true
  })
})

test('setConnecting', t => {
  t.deepEqual(setConnecting({
    id: 123,
    connecting: false
  }), {
    id: 123,
    type: SET_CONNECTING,
    connecting: false
  })
})

test('setTopic', t => {
  t.deepEqual(setTopic({
    id: 123,
    chan: '#bdsmdungeon',
    topic: 'AnalDawg Funeral this Sunday @ 9AM'
  }), {
    id: 123,
    type: SET_TOPIC,
    chan: '#bdsmdungeon',
    topic: 'AnalDawg Funeral this Sunday @ 9AM'
  })
})

test('setTopicWho', t => {
  const timestamp = new Date()
  t.deepEqual(setTopicWho({
    id: 123,
    chan: '#bdsmdungeon',
    hostmask: 'Hotpriest',
    time: timestamp
  }), {
    id: 123,
    type: SET_TOPIC_WHO,
    chan: '#bdsmdungeon',
    hostmask: 'Hotpriest',
    time: timestamp
  })
})

test('updateNames', t => {
  const names = {
    Hotpriest: '@',
    Sex_King: '',
    misterarson_: '',
    PATRIOT1959: '',
    PleasureKevin: '+',
    malediapered: '',
    DISABLEDMAN: '',
    BaseballTrivia: ''
  }
  t.deepEqual(updateNames({
    id: 123,
    chan: '#bdsmdungeon',
    names
  }), {
    id: 123,
    type: UPDATE_NAMES,
    chan: '#bdsmdungeon',
    names
  })
})

test('userJoin', t => {
  t.deepEqual(userJoin({
    id: 123,
    nick: 'AnalDawg',
    chan: '#bdsmdungeon',
    me: false
  }), {
    id: 123,
    type: USER_JOIN,
    nick: 'AnalDawg',
    chan: '#bdsmdungeon',
    me: false
  })
})

test('userLeave', t => {
  t.deepEqual(userLeave({
    id: 123,
    nick: 'BigHoleWoman',
    chan: '#bdsmdungeon',
    me: false
  }), {
    id: 123,
    type: USER_LEAVE,
    nick: 'BigHoleWoman',
    chan: '#bdsmdungeon',
    me: false
  })
})

test('userQuit', t => {
  t.deepEqual(userQuit({
    id: 123,
    nick: 'Sex_King',
    channels: ['#bdsmdungeon']
  }), {
    id: 123,
    type: USER_QUIT,
    nick: 'Sex_King',
    channels: ['#bdsmdungeon']
  })
})

test('changeNick', t => {
  t.deepEqual(changeNick({
    id: 123,
    oldNick: 'Sex_King',
    newNick: 'PleasureKevin'
  }), {
    id: 123,
    type: CHANGE_NICK,
    oldNick: 'Sex_King',
    newNick: 'PleasureKevin'
  })
})

test('addChannelMode', t => {
  const state = {
    iSupport: {
      PREFIX: {
        o: '@'
      }
    }
  }

  t.deepEqual(addChannelMode(state, {
    id: 123,
    chan: '#bdsmdungeon',
    mode: 'o',
    param: 'PleasureKevin'
  }), {
    id: 123,
    type: ADD_CHANNEL_MODE,
    chan: '#bdsmdungeon',
    mode: 'o',
    param: 'PleasureKevin',
    prefix: '@'
  })

  t.deepEqual(addChannelMode(state, {
    id: 123,
    chan: '#bdsmdungeon',
    mode: 'c',
    param: ''
  }), {
    id: 123,
    type: ADD_CHANNEL_MODE,
    chan: '#bdsmdungeon',
    mode: 'c',
    param: '',
    prefix: undefined
  })
})

test('removeChannelMode', t => {
  const state = {
    iSupport: {
      PREFIX: {
        o: '@'
      }
    }
  }

  t.deepEqual(removeChannelMode(state, {
    id: 123,
    chan: '#bdsmdungeon',
    mode: 'o',
    param: 'AnalDawg'
  }), {
    id: 123,
    type: REMOVE_CHANNEL_MODE,
    chan: '#bdsmdungeon',
    mode: 'o',
    param: 'AnalDawg',
    prefix: '@'
  })

  t.deepEqual(removeChannelMode(state, {
    id: 123,
    chan: '#bdsmdungeon',
    mode: 'c',
    param: ''
  }), {
    id: 123,
    type: REMOVE_CHANNEL_MODE,
    chan: '#bdsmdungeon',
    mode: 'c',
    param: '',
    prefix: undefined
  })
})

test('disconnect', t => {
  t.deepEqual(disconnect({ id: 123 }), {
    id: 123,
    type: DISCONNECT
  })
})
