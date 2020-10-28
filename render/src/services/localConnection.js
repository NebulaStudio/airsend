import events from 'events';
import isBuffer from "./parser/isBuffer";
import parser from "../services/parser";
import SocketClient from "./socketClient";

export default class LocalConnection extends events.EventEmitter {

    constructor(config) {
        super();
        this._mid = 0;
        this.id = null;
        this._conn = null;
        this._config = config;
        this._sendChannel = null;
        this._acks = {};
        this._decoder = null;
    }

    _error(err) {
        const error = new Error(`连接建立失败：${err.message}`);
        this.emit('error', error);
    }

    addIceCandidate(candidateta) {
        this._conn.addIceCandidate(new RTCIceCandidate(candidateta)).catch(err => this._error(err));
    }

    connect(id) {
        this.id = id;
        this._createConnection();
        this._conn
            .createOffer()
            .then((offer) => {
                this._conn.setLocalDescription(offer)
                    .then(() => {
                        const isSent = SocketClient.sendOffer(this.id, offer, answer => {
                            this._conn.setRemoteDescription(new RTCSessionDescription(answer)).catch(err => this._error(err));
                        });
                        if (isSent) {
                            //console.log('Send Offer: ', offer);
                        } else {
                            const err = new Error('websocket 连接失败');
                            this._error(err);
                        }
                    })
                    .catch((err) => this._error(err));
            })
            .catch((err) => this._error(err));
    }

    _send(data) {
        if (this._sendChannel == null) return false;
        if (this._sendChannel.readyState !== 'open') return false;
        this._sendChannel.send(data);
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
                        reject();
                        return;
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
        return new Promise((resolve, reject) => {
            const encoder = new parser.Encoder();
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

    close() {
        if (this._sendChannel) {
            if (this._sendChannel.readyState) {
                if (this._sendChannel.readyState == 'open') {
                    this._sendChannel.close();
                }
            }
        }
        if (this._conn) {
            this._conn.close();
        }
    }

    _createConnection() {
        if (this._conn) return;
        this._conn = new RTCPeerConnection(this._config);
        this._conn.onconnectionstatechange = () => this._onConnectionStateChange();
        this._conn.addEventListener('icecandidate', event => this._onIcecandidate(event));
        this._sendChannel = this._conn.createDataChannel('label');
        this._sendChannel.binaryType = 'arraybuffer';
        this._sendChannel.onopen = () => this._onSendChannelStateChange();
        this._sendChannel.onclose = () => this._onSendChannelStateChange();
        this._sendChannel.onmessage = event => this._onReceiveMessageCallback(event);
    }

    _onConnectionStateChange() {
        if (this._conn.connectionState === 'failed') {
            const err = new Error('connection failed');
            this._error(err);
        }
        if (this._conn.connectionState === 'connected') {
            // console.log('rtc connection create successful!!!');
        }
    }

    _onIcecandidate(e) {
        if (!e.candidate) return;
        const isSent = SocketClient.sendIcecandidate(this.id, e.candidate);
        if (isSent) {
            // console.log('Send ICE: ', e.candidate);
        } else {
            const err = new Error('websocket 连接失败');
            this._error(err);
        }
    }

    _onSendChannelStateChange() {
        const readyState = this._sendChannel.readyState;
        if (readyState === 'open') {
            this.emit('connection');
        }
        if (readyState === 'closed') {
            this.emit('disconnected');
        }
    }

    _onReceiveMessageCallback(event) {
        if (this._decoder == null) this._createDecoder();
        this._decoder.add(event.data);
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
}