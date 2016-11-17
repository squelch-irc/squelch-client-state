const test = require('ava')

const reducer = require('../src/channelReducer')
const {
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

const {
    makeChannelStore: makeStore,
    defaultChannelState: defaultState
} = require('./helpers/util')

// Make a store where we have already joined the channel and received all
// dispatches associated with joining a channel
const makePresetStore = (initialState = {}) => makeStore({
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
  },
  ...initialState
})

test('unrecognized action', t => {
  const store = makeStore()
  const oldState = store.getState()
  store.dispatch({ type: 'NOOP' })
  const newState = store.getState()

  t.deepEqual(oldState, newState)

  t.throws(() => reducer(undefined, { type: 'NOOP' }))
})

test('initial state/userJoin', t => {
  const store = makeStore()

  store.dispatch(userJoin({ chan: '#bdsmdungeon', nick: 'BaseballTrivia', me: true }))

  t.deepEqual(store.getState(), { ...defaultState, users: { BaseballTrivia: '' } })
})

test('userJoin (other user)', t => {
  const store = makePresetStore()

  store.dispatch(userJoin({ chan: '#bdsmdungeon', nick: 'spambot2000', me: false }))

  t.is(store.getState().users.spambot2000, '')
})

test('userLeave (self)', t => {
  const store = makePresetStore()

  store.dispatch(userLeave({ chan: '#bdsmdungeon', nick: 'BaseballTrivia', me: true }))

  const { joined, topic, topicwho, topictime, mode, users } = store.getState()
  t.false(joined)
  t.is(topic, '')
  t.is(topicwho, '')
  t.is(topictime, null)
  t.deepEqual(mode, [])
  t.deepEqual(users, {})
})

test('userLeave (other user)', t => {
  const store = makePresetStore()

  store.dispatch(userLeave({ chan: '#bdsmdungeon', nick: 'PleasureKevin', me: false }))

  t.is(store.getState().users.PleasureKevin, undefined)
})

test('userQuit (other user)', t => {
  const store = makePresetStore()
  const oldState = store.getState()

    // User quit that isn't in this channel
  store.dispatch(userQuit({ nick: 'DarkPleasureKevin' }))

  t.is(store.getState(), oldState)

    // User quit that is in this channel
  store.dispatch(userQuit({ nick: 'PleasureKevin' }))

  t.is(store.getState().users.PleasureKevin, undefined)
})

test('disconnect', t => {
  const store = makePresetStore()

  store.dispatch(disconnect())

  const { joined, topic, topicwho, topictime, mode, users } = store.getState()
  t.false(joined)
  t.is(topic, '')
  t.is(topicwho, '')
  t.is(topictime, null)
  t.deepEqual(mode, [])
  t.deepEqual(users, {})
})

test('setTopic', t => {
  const store = makePresetStore()

  store.dispatch(setTopic({ chan: '#bdsmdungeon', topic: 'nno' }))

  t.is(store.getState().topic, 'nno')
})

test('setTopicWho', t => {
  const store = makePresetStore()
  const timestamp = new Date()

  store.dispatch(setTopicWho({ chan: '#bdsmdungeon', hostmask: '~PleasureKevin@irc.somethingawful.com', time: timestamp }))

  t.is(store.getState().topicwho, '~PleasureKevin@irc.somethingawful.com')
  t.is(store.getState().topictime, timestamp)
})

test('updateNames', t => {
  const store = makePresetStore({ users: {} })
  const names = {
    Hotpriest: '@',
    PATRIOT1959: '',
    PleasureKevin: '+',
    DISABLEDMAN: '',
    AnalDawg: '@'
  }
  t.deepEqual(store.getState().users, {})

  store.dispatch(updateNames({
    chan: '#bdsmdungeon',
    names
  }))

  t.deepEqual(store.getState().users, names)
})

test('changeNick', t => {
  const store = makePresetStore()
  const oldState = store.getState()

  t.is(oldState.users.PleasureKevin, '+')
  t.is(oldState.users.PleasureKevin2, undefined)

    // Dispatch nicks that didn't change in this channel
  store.dispatch(changeNick({ oldNick: 'DarkPleasureKevin', newNick: 'DarkPleasureKevin2' }))

  t.is(store.getState(), oldState)

    // Dispatch a nick that changed in this channel
  store.dispatch(changeNick({ oldNick: 'PleasureKevin', newNick: 'PleasureKevin2' }))

  t.is(store.getState().users.PleasureKevin, undefined)
  t.is(store.getState().users.PleasureKevin2, '+')
})

test('addChannelMode', t => {
  const store = makePresetStore()
    // Need a fake parent state to get the iSupport.PREFIX data
  const parentState = { iSupport: { PREFIX: { o: '@', v: '+' } } }

  const oldState = store.getState()

  store.dispatch(addChannelMode(parentState, { chan: '#bdsmdungeon', mode: 'o', param: 'PleasureKevin' }))

  t.is(store.getState().users.PleasureKevin, '@')
  t.deepEqual(store.getState().mode, oldState.mode)

  store.dispatch(addChannelMode(parentState, { chan: '#bdsmdungeon', mode: 'q', param: '' }))

  t.is(store.getState().mode[3], 'q')
})

test('removeChannelMode', t => {
  const store = makePresetStore()
    // Need a fake parent state to get the iSupport.PREFIX data
  const parentState = { iSupport: { PREFIX: { o: '@', v: '+' } } }

  const oldState = store.getState()

  store.dispatch(removeChannelMode(parentState, { chan: '#bdsmdungeon', mode: 'v', param: 'PleasureKevin' }))

  t.is(store.getState().users.PleasureKevin, '')
  t.deepEqual(store.getState().mode, oldState.mode)

  store.dispatch(removeChannelMode(parentState, { chan: '#bdsmdungeon', mode: 'n', param: '' }))

  t.deepEqual(store.getState().mode, ['p', 't'])
})
