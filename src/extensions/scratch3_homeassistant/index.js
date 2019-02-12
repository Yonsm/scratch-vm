const ArgumentType = require('../../extension-support/argument-type')
const BlockType = require('../../extension-support/block-type')
// const Cast = require('../../util/cast');
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
_wsapi = 'wss://xxxx:8123/api/websocket' // WebSocket api url
_token = 'xxxx' // Access token or password

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
            var entity = json.event.data.new_state
            if (entity) {
                //handleEvent(entity)
            } else {
                console.log('事件错误 ' + (json.error.message || message.data))
            }
            break
        case 'auth_invalid':
            console.log('无效认证！')
            break
        default:
            console.log(json)
            break
    }
}

function findEntityId(friendly_name) {
    console.log('查找设备名称: ' + friendly_name)
    for (var i in _entities) {
        var entity = _entities[i]
        if (entity.attributes.friendly_name && entity.attributes.friendly_name == friendly_name) {
            return entity.entity_id
        }
    }
    console.log('未找到设备: ' + friendly_name)
    return null
}

function sendService(service, data) {
    var entity_id = data.entity_id
    var parts = entity_id.split('.')

    if (parts.length != 2) {
        entity_id = findEntityId(entity_id)
        if (entity_id == null) {
            return
        }
        data.entity_id = entity_id
        parts = entity_id.split('.')
    }

    var domain = parts[0]
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

function callService(service, data) {
    if (_ws == null) {
        connect()
    }
    if (_wsid >= 2) {
        sendService(service, data)
    } else {
        setTimeout(function() {
            sendService(service, data)
        }, 3000)
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
                        default: '调节 [ENTITY_ID] 为 [ON_OFF]',
                        description: 'Turn on/off the entify.'
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
                        ON_OFF: {
                            type: ArgumentType.STRING,
                            menu: 'ON_OFF',
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultActionToTurn',
                                default: 'turn_on',
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
                        default: '设置 [ENTITY_ID] 的灯光颜色为 [COLOR]',
                        description: 'set the light color to a particular (RGB) value'
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
                        COLOR: {
                            type: ArgumentType.COLOR
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
                        value: 'turn_on'
                    },
                    {
                        text: formatMessage({
                            id: 'homeassistant.off',
                            default: '关闭',
                            description: 'OFF'
                        }),
                        value: 'turn_off'
                    }
                ]
            }
        }
    }

    turn(args, util) {
        callService(args.ON_OFF, { entity_id: args.ENTITY_ID })
    }

    setLightColor(args, util) {
        if (_ws == null) {
            this._connect()
        }
        console.log(args.COLOR)
        // const rgb = Cast.toRgbColorObject(args.COLOR);
        // console.log(rgb);
    }
}

module.exports = Scratch3HomeAssistantBlocks
