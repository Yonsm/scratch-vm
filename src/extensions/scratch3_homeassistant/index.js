// Home Assistant
_ws = null // WebSocket handle
_wsid = 0 // WebSocket session id
// _wsapi = 'wss://xxx.xxx.xxx:8123/api/websocket' // TODO: Replace with yours
// _token = null // TODO: Replace with HomeAssiatant long-live token, or enabled trusted_networks auth

_entities = null // All Entity from Home Assistant
_entity_menu = [] // Updated entity menu
_states_changed = {} // State changed entities

function connect() {
    _ws = new WebSocket(_wsapi)
    _ws.onopen = handleOpen
    _ws.onclose = handleClose
    _ws.onmessage = handleMessage
}

function handleOpen() {
    if (_token) {
        _ws.send('{"type": "auth", "' + (_token.length < 20 ? 'api_password' : 'access_token') + '": "' + _token + '"}')
    }
    _ws.send('{"id": 1, "type": "get_states"}')
    _ws.send('{"id": 2, "type": "subscribe_events", "event_type": "state_changed"}')
    _wsid = 2
}

function handleClose() {
    _ws = null
    _wsid = 0
    _entities = null
    _entity_menu = []
}

function handleMessage(message) {
    var json = JSON.parse(message.data)
    console.log('handleMessage: ' + json.type)
    switch (json.type) {
        case 'result':
            if (json.success) {
                if (json.id == 1) {
                    // Responed to get_states
                    _entities = json.result
                    buildEntityMenu()
                    break
                } else if (json.id == 2) {
                    // Responed to subscribe_events
                    break
                } else if (json.id == _wsid) {
                    // Correct response for call_service
                    break
                }
            }
            console.log('Unknown result: ' + (json.error ? json.error.message : message.data))
            break
        case 'event':
            handleEvent(json)
            break
        case 'auth_invalid':
            console.log('Invalid auth!')
            break
        default:
            console.log(json)
            break
    }
}

function handleEvent(json) {
    var entity = json.event.data.new_state
    if (!entity) {
        console.log('Event without entity: ' + (json.error.message || JSON.stringify(json)))
        return
    }

    for (var i in _entities) {
        var old_entity = _entities[i]
        if (old_entity.entity_id == entity.entity_id) {
            if (entity.state != old_entity.state) {
                console.log(entity.attributes.friendly_name + ' state changed from ' + old_entity.state + ' to ' + entity.state)
                _states_changed[entity.entity_id] = entity.state
            } else {
                console.log(entity.attributes.friendly_name + ' state received: ' + entity.state)
            }
            _entities.splice(i, 1, entity)
            return
        }
    }

    // New entity found
    _entities.push(entity)
    _states_changed[entity.entity_id] = entity.state
    console.log('New entity found：' + entity.attributes.friendly_name + ', state: ' + entity.state)
    buildEntityMenu()
}

const _valid_domains = ['sensor', 'binary_sensor', 'device_tracker', 'light', 'switch', 'media_player', 'cover', 'vacuum', 'fan', 'climate']
function buildEntityMenu() {
    _entity_menu = []
    for (var i in _entities) {
        var entity = _entities[i]
        if (_valid_domains.indexOf(entity.entity_id.split('.')[0]) != -1 && !entity.attributes.hidden) {
            _entity_menu.push({ text: entity.attributes.friendly_name, value: entity.entity_id })
        }
    }
    _entity_menu.sort(function(a, b) {
        var index1 = _valid_domains.indexOf(a.value.split('.')[0])
        var index2 = _valid_domains.indexOf(b.value.split('.')[0])
        return index1 == index2 ? a.text.localeCompare(b.text) : index1 - index2
    })
}

function filterEntityMenu(filter) {
    if (_ws == null) connect()

    if (filter) {
        var menu = []
        for (var i in _entity_menu) {
            var item = _entity_menu[i]
            if (filter(item.value.split('.')[0])) {
                menu.push(item)
            }
        }
    } else {
        var menu = _entity_menu
    }

    return menu.length ? menu : [{ text: '暂无', value: 'NA' }]
}

function findEntity(entity_id) {
    for (var i in _entities) {
        var entity = _entities[i]
        if (entity.entity_id == entity_id) {
            return entity
        }
    }
    console.log('Entity id not found: ' + entity_id)
    return null
}

function _callService(service, data) {
    var parts = service.split('.')
    if (parts.length == 2) {
        var domain = parts[0]
        service = parts[1]
    } else {
        var domain = data.entity_id.split('.')[0]
        if (domain == 'cover' /* || data.entity_id == 'group.all_covers'*/) {
            // Replace cover service
            if (service == 'turn_on') {
                service = 'open_cover'
            } else if (service == 'turn_off') {
                service = 'close_cover'
            }
        }
    }
    var command = JSON.stringify({
        id: ++_wsid,
        type: 'call_service',
        domain: domain,
        service: service,
        service_data: data
    })
    _ws.send(command)
    console.log('Call service: ' + command)
}

function callService(service, data) {
    if (_ws == null) connect()

    if (_wsid >= 2) {
        _callService(service, data)
    } else {
        setTimeout(function() {
            _callService(service, data)
        }, 2000)
    }
}

const ArgumentType = require('../../extension-support/argument-type')
const BlockType = require('../../extension-support/block-type')
const Cast = require('../../util/cast')
const formatMessage = require('format-message')

class Scratch3HomeAssistantBlocks {
    constructor(runtime) {
        this.runtime = runtime

        if (_ws == null) connect()
    }

    static get STATE_KEY() {
        return 'Scratch.HomeAssistant'
    }

    getInfo() {
        return {
            id: 'homeassistant',
            name: formatMessage({
                id: 'homeassistant.categoryName',
                default: '家居助手'
            }),
            menuIconURI:
                'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'turnOnOff',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.turnOnOff',
                        default: '设置 [ENTITY] 的状态为 [ONOFF]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'TURNONOFF_ENTITY'
                        },
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'ONOFF',
                            defaultValue: 'on'
                        }
                    }
                },
                {
                    opcode: 'setLightColor',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.setLightColor',
                        default: '设置灯光 [ENTITY] 的颜色为 [COLOR]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'LIGHT_ENTITY'
                        },
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    }
                },
                {
                    opcode: 'setLightTemperature',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.setLightTemperature',
                        default: '设置灯光 [ENTITY] 的色温为 [TEMPERATURE]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'LIGHT_ENTITY'
                        },
                        TEMPERATURE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultTemperatureForSetLightTemperature',
                                default: '4000'
                            })
                        }
                    }
                },
                {
                    opcode: 'setLightBrightness',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.setLightBrightness',
                        default: '设置灯光 [ENTITY] 的亮度为 [BRIGHTNESS]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'LIGHT_ENTITY'
                        },
                        BRIGHTNESS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultBrightnessForSetLightBrightness',
                                default: '255'
                            })
                        }
                    }
                },
                {
                    opcode: 'speechInMiAi',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.miaiSpeech',
                        default: '让小爱音箱说 [TEXT]'
                    }),
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultTextForSpeechInMiAi',
                                default: '你好，我是小爱同学'
                            })
                        }
                    }
                },
                {
                    opcode: 'speech',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.speech',
                        default: '让 [ENTITY] 说 [TEXT]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'MEDIA_PLAYER_ENTITY'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultTextForSpeech',
                                default: '你好，我是 Scratch'
                            })
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenStateChanged',
                    text: formatMessage({
                        id: 'homeassistant.whenStateChanged',
                        default: '当 [ENTITY] 的状态变化'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'ENTITY'
                        }
                    }
                },
                {
                    opcode: 'whenStateChangedToOnOff',
                    text: formatMessage({
                        id: 'homeassistant.whenStateChangedToOnOff',
                        default: '当 [ENTITY] 的状态变为 [ONOFF]'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'ISSTATEON_ENTITY'
                        },
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'ONOFF',
                            defaultValue: 'on'
                        }
                    }
                },
                '---',
                {
                    opcode: 'getState',
                    text: formatMessage({
                        id: 'homeassistant.getState',
                        default: '[ENTITY] 的状态'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'ENTITY'
                        }
                    }
                },
                {
                    opcode: 'isStateOn',
                    text: formatMessage({
                        id: 'homeassistant.isStateOn',
                        default: '[ENTITY] 已打开?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'ISSTATEON_ENTITY'
                        }
                    }
                }
            ],
            menus: {
                ONOFF: [
                    {
                        text: formatMessage({
                            id: 'homeassistant.on',
                            default: '打开'
                        }),
                        value: 'on'
                    },
                    {
                        text: formatMessage({
                            id: 'homeassistant.off',
                            default: '关闭'
                        }),
                        value: 'off'
                    }
                ],
                ENTITY: 'getEntityMenu',
                LIGHT_ENTITY: 'getLightEntityMenu',
                TURNONOFF_ENTITY: 'getTurnOnOffEntityMenu',
                ISSTATEON_ENTITY: 'getIsStateOnEntityMenu',
                MEDIA_PLAYER_ENTITY: 'getMediaPlayerEntityMenu'
            }
            // TODO: ??? translation_map: {
            //     de: {
            //         'homeassistant.categoryName': '家居助手'
            //     }
            // }
        }
    }

    turnOnOff(args, util) {
        callService('turn_' + args.ONOFF, { entity_id: args.ENTITY })
    }

    setLightColor(args, util) {
        const rgb = Cast.toRgbColorObject(args.COLOR)
        callService('turn_on', { entity_id: args.ENTITY, rgb_color: [rgb.r, rgb.g, rgb.b] })
    }

    setLightTemperature(args, util) {
        callService('turn_on', { entity_id: args.ENTITY, kelvin: args.TEMPERATURE })
    }

    setLightBrightness(args, util) {
        callService('turn_on', { entity_id: args.ENTITY, brightness: args.BRIGHTNESS })
    }

    speechInMiAi(args, util) {
        callService('hello_miai.send', { message: args.TEXT })
    }

    speech(args, util) {
        callService('tts.baidu_say', { entity_id: args.ENTITY, message: args.TEXT })
    }

    whenStateChanged(args, util) {
        if (_ws == null) connect()

        var entity_id = args.ENTITY
        if (entity_id && _states_changed[entity_id] != null && (args.ONOFF == null || _states_changed[entity_id] == args.ONOFF)) {
            delete _states_changed[entity_id]
            console.log(args.ENTITY + ' 状态变化 ' + _states_changed[entity_id])
            return true
        }
        return false
    }

    whenStateChangedToOnOff(args, util) {
        return this.whenStateChanged(args)
    }

    getState(args) {
        if (_ws == null) connect()

        var entity = findEntity(args.ENTITY)
        if (entity) {
            return entity.state
        }
        return '未知'
    }

    isStateOn(args) {
        var state = this.getState(args)
        return state == 'on'
    }

    getEntityMenu() {
        return filterEntityMenu()
    }

    getLightEntityMenu() {
        return filterEntityMenu(function(domain) {
            return domain == 'light'
        })
    }

    getTurnOnOffEntityMenu() {
        return filterEntityMenu(function(domain) {
            return domain != 'sensor' && domain != 'binary_sensor' && domain != 'device_tracker'
        })
    }

    getIsStateOnEntityMenu() {
        return filterEntityMenu(function(domain) {
            return domain != 'sensor'
        })
    }

    getMediaPlayerEntityMenu() {
        return filterEntityMenu(function(domain) {
            return domain == 'media_player'
        })
    }
}

module.exports = Scratch3HomeAssistantBlocks
