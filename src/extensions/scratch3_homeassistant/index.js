const ArgumentType = require('../../extension-support/argument-type')
const BlockType = require('../../extension-support/block-type')
const Cast = require('../../util/cast')
// const Color = require('../../util/color');
const formatMessage = require('format-message')

// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI =
    'data:image/png;base64,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'
const menuIconURI = blockIconURI

// Home Assistant
_ws = null // WebSocket handle
_wsid = 0 // WebSocket session id

_entities = null

function connect() {
    console.log('connect')
    _ws = new WebSocket(_wsapi)
    _ws.onopen = handleOpen
    _ws.onclose = handleClose
    _ws.onmessage = handleMessage
}

function handleOpen() {
    console.log('handleOpen')
    if (_token) {
        _ws.send('{"type": "auth", "' + (_token.length < 20 ? 'api_password' : 'access_token') + '": "' + _token + '"}')
    }
    _ws.send('{"id": 1, "type": "get_states"}')
    _ws.send('{"id": 2, "type": "subscribe_events", "event_type": "state_changed"}')
    _wsid = 2
}

function handleClose() {
    console.log('handleClose')
    _ws = null
    _wsid = 0
    _entities = null
}

_states = {}
function handleMessage(message) {
    var json = JSON.parse(message.data)
    console.log('handleMessage: ' + json.type)
    switch (json.type) {
        case 'result':
            if (json.success) {
                if (json.id == 1) {
                    // Responed to get_states
                    _entities = json.result
                    break
                } else if (json.id == 2) {
                    // Responed to subscribe_events
                    break
                } else if (json.id == _wsid) {
                    break
                }
            }
            console.log('未知结果 ' + (json.error ? json.error.message : message.data))
            break
        case 'event':
            handleEvent(json)
            break
        case 'auth_invalid':
            console.log('无效认证！')
            break
        default:
            console.log(json)
            break
    }
}

function handleEvent(json) {
    var entity = json.event.data.new_state
    if (entity) {
        for (var i in _entities) {
            var old_entity = _entities[i]
            if (old_entity.entity_id == entity.entity_id) {
                if (entity.state != old_entity.state) {
                    console.log(entity.entity_id + ' 状态从 ' + old_entity.state + ' 变化为 ' + entity.state)
                    _states[entity.entity_id] = entity.state
                } else {
                    console.log(entity.entity_id + ' 事件 ' + entity.state)
                }
                _entities.splice(i, 1, entity)
                return
            }
        }

        _entities.push(entity)
        _states[entity.entity_id] = entity.state
        console.log('新增设备：' + entity.entity_id + '，状态为：' + entity.state)
    } else {
        console.log('事件错误 ' + (json.error.message || JSON.stringify(json)))
    }
}

function findEntityId(friendly_name) {
    if (friendly_name.split('.').length == 2) {
        return friendly_name
    }

    //console.log('查找设备名称: ' + friendly_name)
    for (var i in _entities) {
        var entity = _entities[i]
        if (entity.attributes.friendly_name && entity.attributes.friendly_name == friendly_name) {
            return entity.entity_id
        }
    }
    console.log('未找到设备: ' + friendly_name)
    return null
}

function callService(service, data) {
    var entity_id = findEntityId(data.entity_id)
    if (entity_id == null) {
        return
    } else {
        data.entity_id = entity_id
    }

    var domain = entity_id.split('.')[0]
    if (domain == 'cover' /* || entity_id == 'group.all_covers'*/) {
        // Replace cover service
        if (service == 'turn_on') {
            service = 'open_cover'
        } else if (service == 'turn_off') {
            service = 'close_cover'
        }
    }

    console.log('Processing: ' + domain + '/' + service + '/' + entity_id)
    _ws.send(
        JSON.stringify({
            id: ++_wsid,
            type: 'call_service',
            domain: domain,
            service: service,
            service_data: data
        })
    )
}

function execService(service, data) {
    if (_ws == null) {
        connect()
    }
    if (_wsid >= 2) {
        callService(service, data)
    } else {
        setTimeout(function() {
            callService(service, data)
        }, 2000)
    }
}

class Scratch3HomeAssistantBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime
    }

    /**
     * The key to load & store a target's pen-related state.
     * @type {string}
     */
    static get STATE_KEY() {
        return 'Scratch.HomeAssistant'
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'homeassistant',
            name: formatMessage({
                id: 'homeassistant.categoryName',
                default: '家居助手',
                description: 'Label for the Home Assistant extension category'
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'turn',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.turn',
                        default: '设置 [ENTITY_ID] 的状态 [STATE]',
                        description: 'Turn on/off the entity.'
                    }),
                    arguments: {
                        ENTITY_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultEntityToTurn',
                                default: '壁灯',
                                description: 'default entity to turn.'
                            })
                        },
                        STATE: {
                            type: ArgumentType.STRING,
                            menu: 'ON_OFF',
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultActionToTurn',
                                default: 'on',
                                description: 'default action to turn.'
                            })
                        }
                    }
                },
                {
                    opcode: 'setLightColor',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.setLightColor',
                        default: '设置灯光 [ENTITY_ID] 的颜色为 [COLOR]',
                        description: 'set the light color to a particular (RGB) value'
                    }),
                    arguments: {
                        ENTITY_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultEntityToSetColor',
                                default: '壁灯',
                                description: 'default entity to set color.'
                            })
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
                        default: '设置灯光 [ENTITY_ID] 的色温为 [TEMPERATURE]',
                        description: 'set color temperature for the light.'
                    }),
                    arguments: {
                        ENTITY_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultEntityToSetTemperature',
                                default: '壁灯',
                                description: 'default entity to set temperature.'
                            })
                        },
                        TEMPERATURE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultLightTemperature',
                                default: '4000',
                                description: 'default light temperature.'
                            })
                        }
                    }
                },
                {
                    opcode: 'setLightBrightness',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.setLightBrightness',
                        default: '设置灯光 [ENTITY_ID] 的亮度为 [BRIGHTNESS]',
                        description: 'set brightness for the light.'
                    }),
                    arguments: {
                        ENTITY_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultEntityToSetBrightness',
                                default: '壁灯',
                                description: 'default entity to set brightness.'
                            })
                        },
                        BRIGHTNESS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultLightBrightness',
                                default: '255',
                                description: 'default light brightness.'
                            })
                        }
                    }
                },
                {
                    opcode: 'whenStateChanged',
                    text: formatMessage({
                        id: 'videoSensing.whenStateChanged',
                        default: '当 [ENTITY_ID] 变为 [STATE]',
                        description: 'Event that triggers when state changed.'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        ENTITY_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultEntityToStateChanged',
                                default: '餐厅亮度',
                                description: 'default entity for state changed.'
                            })
                        },
                        STATE: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultStateToStateChanged',
                                default: 'on',
                                description: 'default state for state changed.'
                            })
                        }
                    }
                },
                {
                    opcode: 'whenStateChangedToOnOff',
                    text: formatMessage({
                        id: 'videoSensing.whenStateChangedToOnOff',
                        default: '当 [ENTITY_ID] 变为 [STATE]',
                        description: 'Event that triggers when state changed to on/off.'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        ENTITY_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultEntityToStateChangedToOnOff',
                                default: '过道人体感应',
                                description: 'default entity for state changed to on/off.'
                            })
                        },
                        STATE: {
                            type: ArgumentType.STRING,
                            menu: 'ON_OFF',
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultStateToStateChangedToOnOff',
                                default: 'on',
                                description: 'default state for state changed to on/off.'
                            })
                        }
                    }
                }
            ],
            menus: {
                ON_OFF: [
                    {
                        text: formatMessage({
                            id: 'homeassistant.on',
                            default: '打开',
                            description: 'ON'
                        }),
                        value: 'on'
                    },
                    {
                        text: formatMessage({
                            id: 'homeassistant.off',
                            default: '关闭',
                            description: 'OFF'
                        }),
                        value: 'off'
                    }
                ]
            }
        }
    }

    turn(args, util) {
        execService('turn_' + args.STATE.toUpperCase(), { entity_id: args.ENTITY_ID })
    }

    setLightColor(args, util) {
        const rgb = Cast.toRgbColorObject(args.COLOR)
        execService('turn_on', { entity_id: args.ENTITY_ID, rgb_color: [rgb.r, rgb.g, rgb.b] })
    }

    setLightTemperature(args, util) {
        execService('turn_on', { entity_id: args.ENTITY_ID, kelvin: args.TEMPERATURE })
    }

    setLightBrightness(args, util) {
        execService('turn_on', { entity_id: args.ENTITY_ID, brightness: args.BRIGHTNESS })
    }

    whenStateChanged(args, util) {
        if (_ws == null) {
            connect()
        }
        var entity_id = findEntityId(args.ENTITY_ID)
        if (entity_id && _states[entity_id] == args.STATE) {
            delete _states[entity_id]
            console.log('触发事件啦: ' + args.ENTITY_ID + ' 状态: ' + args.STATE)
            return true
        }
        return false
    }

    whenStateChangedToOnOff(args, util) {
        return whenStateChanged(args, util)
    }
}

module.exports = Scratch3HomeAssistantBlocks
