import events from 'events';
import parser from "../services/parser";
import SocketClient from "./socketClient";
import isBuffer from "./parser/isBuffer";

export default class RemoteConnection extends events.EventEmitter {

    constructor(config) {
        super();
        this.id = null;
        this._conn = null;
        this._config = config;
        this._receiveChannel = null;
        this._decoder = null;
        this._acks = {};
        this._mid = 0;
    }

    accept(id, offer, callback) {
        this.id = id;
        this._createConnection();
        this._conn.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
            this._conn.createAnswer().then(answer => {
                this._conn.setLocalDescription(answer).then(() => {
                    callback(answer);
                }).catch(err => {
                    this._error(err);
                })
            }).catch(err => {
                this._error(err);
            })
        }).catch(err => {
            this._error(err);
        })
    }

    _send(data) {
        if (this._receiveChannel == null) return false;
        if (this._receiveChannel.readyState !== 'open') return false;
        this._receiveChannel.send(data);
        return true;
    }

    _sendAck(id, data) {
        const packet = {
            id,
            data
        };
        const isBuf = isBuffer(data);
        packet.type = isBuf ? parser.BINARY_ACK : parser.ACK;
        const encoder = new parser.Encoder();
        return new Promise((resolve, reject) => {
            encoder.encode(packet, items => {
                for (const item of items) {
                    const isSent = this._send(item);
                    if (!isSent) {
                        return reject();
                    }
                }
                resolve();
            });
        });
    }

    send(data, fn) {
        const packet = {
            data
        };
        const isBuf = isBuffer(data);
        packet.type = isBuf ? parser.BINARY_EVENT : parser.EVENT;
        if (fn) {
            this._acks[this._mid] = fn;
            packet.id = this._mid++;
        }
        const encoder = new parser.Encoder();
        return new Promise((resolve, reject) => {
            encoder.encode(packet, items => {
                for (const item of items) {
                    const isSent = this._send(item);
                    if (!isSent) {
                        reject();
                        return;
                    }
                }
                resolve();
            });
        });
    }

    _error(err) {
        const error = new Error(`连接建立失败：${err.message}`);
        this.emit('error', error);
    }

    _createConnection() {
        this._conn = new RTCPeerConnection(this._config);
        this._conn.ondatachannel = event => this._onDataChannel(event);
        this._conn.onconnectionstatechange = () => this._onConnectionStateChange();
        this._conn.addEventListener('icecandidate', event => this._onIcecandidate(event));
    }

    addIceCandidate(candidateta) {
        this._conn.addIceCandidate(new RTCIceCandidate(candidateta)).catch(err => this._error(err));
    }

    _onIcecandidate(event) {
        if (!event.candidate) return;
        const isSent = SocketClient.sendIcecandidate(this.id, event.candidate);
        if (isSent) {
            // console.log('Send ICE: ', event.candidate);
        } else {
            const err = new Error('websocket 连接失败');
            this._error(err);
        }
    }

    _onConnectionStateChange() {
        if (this._conn.connectionState === 'failed') {
            const err = new Error('connection failed');
            this._error(err);
            return;
        }
        if (this._conn.connectionState === 'connected') {
            // console.log('rtc connection create successful!')
        }
    }

    _onDataChannel(event) {
        this._receiveChannel = event.channel;
        this._receiveChannel.onmessage = event => this._onReceiveMessageCallback(event);
        this._receiveChannel.onopen = () => this._onReceiveChannelStateChange();
        this._receiveChannel.onclose = () => this._onReceiveChannelStateChange();
    }

    _onReceiveMessageCallback(event) {
        if (this._decoder == null) this._createDecoder();
        this._decoder.add(event.data);
    }

    _createDecoder() {
        this._decoder = new parser.Decoder();
        this._decoder.on('decoded', (packet) => {
            if (packet.id === null) {
                this.emit('message', packet.data);
            } else {
                if (packet.type === parser.ACK || packet.type === parser.BINARY_ACK) {
                    const ack = this._acks[packet.id];
                    if (ack) {
                        ack.apply(this, [packet.data]);
                        Reflect.deleteProperty(this._acks, packet.id);
                    }
                } else {
                    this.emit('message', packet.data, this._ack(packet.id));
                }
            }
        });
    }

    _ack(id) {
        const self = this;
        return function () {
            const items = Array.from(arguments);
            let data;
            if (items.length !== 0) {
                data = items[0];
            }
            self._sendAck(id, data).catch();
        }
    }

    _onReceiveChannelStateChange() {
        const readyState = this._receiveChannel.readyState;
        if (readyState === 'open') {
            this.emit('connection');
        }
        if (readyState === 'closed') {
            this.emit('disconnected');
        }
    }
}